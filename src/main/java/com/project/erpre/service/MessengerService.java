package com.project.erpre.service;

import com.project.erpre.model.dto.ChatDTO;
import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.model.entity.*;
import com.project.erpre.repository.*;
import org.hibernate.StaleStateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class MessengerService {

    @PersistenceContext
    private EntityManager entityManager;

    private static final Logger logger = LoggerFactory.getLogger(MessengerService.class);

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final EmployeeRepository employeeRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageReadRepository chatMessageReadRepository;
    private final ChatFileRepository chatFileRepository;

    @Autowired
    public MessengerService(ChatRepository chatRepository, ChatParticipantRepository chatParticipantRepository, EmployeeRepository employeeRepository, ChatMessageRepository chatMessageRepository, ChatMessageReadRepository chatMessageReadRepository, ChatFileRepository chatFileRepository) {
        this.chatRepository = chatRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.employeeRepository = employeeRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatMessageReadRepository = chatMessageReadRepository;
        this.chatFileRepository = chatFileRepository;
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
        try {
            String employeeId = getEmployeeIdFromAuthentication();

            ChatParticipant chatParticipant = chatParticipantRepository.findById(new ChatParticipantId(chatNo, employeeId))
                    .orElse(null);
            if (chatParticipant != null) {
                chatParticipantRepository.delete(chatParticipant);
                entityManager.flush();  // 삭제 후 즉시 반영
            }

            long remainingParticipants = chatParticipantRepository.countParticipants(chatNo);
            if (remainingParticipants > 0) {
                logger.debug("남은 참여자 수: {}", remainingParticipants);
                logger.info("채팅방 유지, 참여자만 삭제됨");
                return;
            }

//            }
//            if (chatMessageReadRepository.existsByChatMessageReadId_ChatMessageNo(chatNo)) {
//                chatMessageReadRepository.deleteByChatMessageReadId_ChatMessageNo(chatNo);
//                entityManager.flush();
//            }
//            if (chatFileRepository.existsByChatMessage_ChatMessageNo(chatNo)) {
//                chatFileRepository.deleteByChatMessage_ChatMessageNo(chatNo);
//                entityManager.flush();
//            }
//            if (chatMessageRepository.existsByChat_ChatNo(chatNo)) {
//                chatMessageRepository.deleteByChat_ChatNo(chatNo);
//                entityManager.flush();
//            }
            if (chatRepository.existsById(chatNo)) {
                chatRepository.deleteById(chatNo);
                entityManager.flush();
            }

            logger.info("채팅방 {} 및 관련 데이터 삭제 완료", chatNo);
        } catch (StaleStateException e) {
            logger.warn("데이터가 이미 삭제되었습니다: {}", e.getMessage());
        }
    }


    // 채팅 메시지 저장
    public ChatMessageDTO saveChatMessage(Long chatNo, ChatMessageDTO chatMessage, String senderId) {

        // Chat과 Employee(발신자)
        Chat chat = chatRepository.findById(chatNo)
                .orElseThrow(() -> new RuntimeException("해당 채팅방을 찾을 수 없습니다: " + chatNo));
        Employee sender = employeeRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("해당 발신자를 찾을 수 없습니다: " + senderId));

        // ChatMessage 생성 및 저장
        ChatMessage newMessage = new ChatMessage();
        newMessage.setChat(chat);
        newMessage.setEmployee(sender);
        newMessage.setChatMessageContent(chatMessage.getChatMessageContent());

        ChatMessage savedMessage = chatMessageRepository.save(newMessage);

        // 채팅방의 모든 참여자에 대해 ChatMessageRead 엔티티 생성
        List<ChatParticipant> participants = chatParticipantRepository.findByChat(chat);
        for (ChatParticipant participant : participants) {
            // 발신자가 아닌 수신자에 대해 ChatMessageRead 엔티티 생성
            if (!participant.getEmployee().getEmployeeId().equals(senderId)) {

                ChatMessageReadId readId = new ChatMessageReadId();
                readId.setChatMessageNo(savedMessage.getChatMessageNo());
                readId.setChatMessageRecipientId(participant.getEmployee().getEmployeeId());

                ChatMessageRead messageRead = new ChatMessageRead();
                messageRead.setChatMessageReadId(readId);
                messageRead.setChatMessage(savedMessage);
                messageRead.setEmployee(participant.getEmployee());
                messageRead.setChatMessageReadYn("N");

                chatMessageReadRepository.save(messageRead);
            }
        }

        return new ChatMessageDTO(savedMessage);
    }


}
