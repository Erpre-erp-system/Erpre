package com.project.erpre.service;

import com.project.erpre.model.dto.ChatDTO;
import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.model.entity.*;
import com.project.erpre.repository.ChatParticipantRepository;
import com.project.erpre.repository.ChatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.project.erpre.repository.EmployeeRepository;
import com.project.erpre.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class MessengerService {

    private static final Logger logger = LoggerFactory.getLogger(MessengerService.class);

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final EmployeeRepository employeeRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Autowired
    public MessengerService(ChatRepository chatRepository, ChatParticipantRepository chatParticipantRepository, EmployeeRepository employeeRepository, ChatMessageRepository chatMessageRepository) {
        this.chatRepository = chatRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.employeeRepository = employeeRepository;
        this.chatMessageRepository = chatMessageRepository;
    }


    /////////////////////////////////////////////////////////////////////// 🟢 공통


    // 사용자 인증
    private String getEmployeeIdFromAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증된 사용자를 찾을 수 없습니다. 로그인이 필요합니다.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getUsername();
        } else {
            return principal.toString();
        }
    }


    /////////////////////////////////////////////////////////////////////// 🔴 채팅


    // 현재 참여하고 있는 채팅 목록 조회 및 검색
    public List<ChatDTO> getChatListByUser(String searchKeyword){
        String employeeId = getEmployeeIdFromAuthentication();
        return chatRepository.getChatListByUser(employeeId, searchKeyword);
    }

    // 개별 채팅방 조회 및 검색 (📌검색 프론트에서 아직 구현 안 함, 하자!)
    public Map<String, Object> getSelectedChat(Long chatNo, String searchKeyword) {
        String employeeId = getEmployeeIdFromAuthentication();
        List<ChatMessageDTO> chatMessages = chatRepository.getSelectedChat(chatNo, searchKeyword, employeeId);

        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", employeeId);
        response.put("chatMessages", chatMessages);

        return response;
    }

    // 새 채팅방 생성
    @Transactional
    public ChatDTO createChatRoom(List<String> participantIds) {

        // 현재 로그인 된 유저 아이디 조회
        String employeeId = getEmployeeIdFromAuthentication();

        // 참여자 목록 가져오기
        List<Employee> participants = participantIds.stream()
                .map(participantId -> employeeRepository.findById(participantId)
                        .orElseThrow(() -> new RuntimeException("직원을 찾을 수 없습니다: " + participantId)))
                .collect(Collectors.toList());

        // 현재 로그인된 사용자를 추가
        Employee currentUser = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("현재 사용자를 찾을 수 없습니다: " + employeeId));
        participants.add(currentUser);

        // 채팅방 엔티티 생성 및 저장
        Chat chat = new Chat();
        Chat savedChat = chatRepository.save(chat);

        // 채팅방 제목 설정
        List<ChatParticipant> chatParticipants;
        if (participants.size() == 2) { // 1:1 채팅방일 경우
            Employee participant1 = participants.get(0);
            Employee participant2 = participants.get(1);

            // 1:1 채팅방 - 각 참여자의 chatTitle을 상대방의 이름으로 설정
            chatParticipants = List.of(
                    new ChatParticipant(savedChat, participant1, participant2.getEmployeeName()), // participant1의 chatTitle을 participant2의 이름으로
                    new ChatParticipant(savedChat, participant2, participant1.getEmployeeName())  // participant2의 chatTitle을 participant1의 이름으로
            );
        } else {
            // 단체 채팅방
            String firstParticipantName = participants.get(0).getEmployeeName();
            String chatTitle = firstParticipantName + " 외 " + (participants.size() - 1) + "인"; // 단체 채팅방 이름 설정

            chatParticipants = participants.stream()
                    .map(employee -> new ChatParticipant(savedChat, employee, chatTitle))
                    .collect(Collectors.toList());
        }

        // 모든 참여자 저장
        chatParticipantRepository.saveAll(chatParticipants);

        // 저장된 채팅방 정보를 DTO로 변환하여 반환
        return new ChatDTO(savedChat.getChatNo(), chatParticipants.get(0).getChatTitle(), chatParticipants);
    }

    // 채팅방 이름 변경
    public void updateChatTitle(Long chatNo, String newTitle) {
        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new IllegalArgumentException("채팅방 이름은 공백이 불가능합니다.");
        }

        String participantId = getEmployeeIdFromAuthentication();

        ChatParticipant chatParticipant = chatParticipantRepository.findById(new ChatParticipantId(chatNo, participantId))
                .orElseThrow(() -> new NoSuchElementException("해당 채팅방을 찾을 수 없습니다. 채팅방 ID: " + chatNo));

        // 새로운 채팅방 이름 설정
        chatParticipant.setChatTitle(newTitle);

        // 변경 사항 저장
        chatParticipantRepository.save(chatParticipant);
    }

    // 채팅방 나가기
    @Transactional
    public void leaveChatRoom(Long chatNo) {
        // 현재 로그인 된 유저 아이디 조회
        String employeeId = getEmployeeIdFromAuthentication();

        // 참여자 정보 조회
        ChatParticipant chatParticipant = chatParticipantRepository.findById(new ChatParticipantId(chatNo, employeeId))
                .orElseThrow(() -> new NoSuchElementException("해당 채팅방 참여자를 찾을 수 없습니다."));

        // 참여자 삭제
        chatParticipantRepository.delete(chatParticipant);

        // 채팅방에 남아있는 다른 참여자가 있는지 확인
        long remainingParticipants = chatParticipantRepository.countByChatParticipantId_ChatNo(chatNo);

        if (remainingParticipants == 0) {
            // 만약 나가는 사용자가 마지막 참여자라면 채팅방과 관련된 모든 메시지 및 파일 삭제 후 채팅방도 삭제
            Chat chat = chatRepository.findById(chatNo)
                    .orElseThrow(() -> new NoSuchElementException("찾을 수 없는 채팅방:" + chatNo));
            chatRepository.delete(chat);
            logger.info("채팅방 {} 삭제 완료", chatNo);
        } else {
            // 채팅방은 유지되고 참여자만 삭제됨
            logger.info("채팅방 유지");
        }
    }
    
    // 채팅 메시지 저장
    public ChatMessageDTO saveChatMessage(Long chatNo, ChatMessageDTO chatMessage, String employeeId) {

        Chat chat = chatRepository.findById(chatNo)
                .orElseThrow(() -> new RuntimeException("해당 채팅방을 찾을 수 없습니다: " + chatNo));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("해당 직원을 찾을 수 없습니다: " + employeeId));

        ChatMessage newMessage = new ChatMessage();
        newMessage.setChat(chat);
        newMessage.setEmployee(employee);
        newMessage.setChatMessageContent(chatMessage.getChatMessageContent());

        ChatMessage savedMessage = chatMessageRepository.save(newMessage);

        return new ChatMessageDTO(savedMessage);
    }


}
