package com.project.erpre.service;

import com.project.erpre.model.dto.*;
import com.project.erpre.model.entity.*;
import com.project.erpre.repository.*;
import org.hibernate.StaleStateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Service
public class MessengerService {

    @PersistenceContext
    private EntityManager entityManager;
    private static final Logger logger = LoggerFactory.getLogger(MessengerService.class);

    // SSE Emitter를 저장하는 컬렉션
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    private final FileService fileService;

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final EmployeeRepository employeeRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageReadRepository chatMessageReadRepository;
    private final ChatFileRepository chatFileRepository;
    private final MessageRepository messageRepository;
    private final MessageRecipientRepository messageRecipientRepository;

    @Autowired
    public MessengerService(FileService fileService, ChatRepository chatRepository, ChatParticipantRepository chatParticipantRepository, EmployeeRepository employeeRepository, ChatMessageRepository chatMessageRepository, ChatMessageReadRepository chatMessageReadRepository, ChatFileRepository chatFileRepository, MessageRepository messageRepository, MessageRecipientRepository messageRecipentRepository) {
        this.fileService = fileService;
        this.chatRepository = chatRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.employeeRepository = employeeRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatMessageReadRepository = chatMessageReadRepository;
        this.chatFileRepository = chatFileRepository;
        this.messageRepository = messageRepository;
        this.messageRecipientRepository = messageRecipentRepository;
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
    
    // 유저 정보 조회
    public EmployeeDTO getUserInfo() {
        String employeeId = getEmployeeIdFromAuthentication();
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("해당 직원을 찾을 수 없습니다"));
        return new EmployeeDTO(employee);
    }

    // 유저 프로필 사진 URL 업데이트
    @Transactional
    public void updateProfileImage(String fileName) {

        String employeeId = getEmployeeIdFromAuthentication();
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("해당 직원을 찾을 수 없습니다"));

        String imageUrl = "/uploads/profile-pictures/" + fileName;
        employee.setEmployeeImageUrl(imageUrl);
        employeeRepository.save(employee);
    }

    // 유저 프로필 사진 URL 삭제
    public void deleteProfileImage() {
        String employeeId = getEmployeeIdFromAuthentication();
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("해당 직원을 찾을 수 없습니다"));

        employee.setEmployeeImageUrl(null);
        employeeRepository.save(employee);
    }

    // 유저 정보 업데이트 (상태 메시지, 핸드폰 번호, 상태 등)
    public void updateInfo(Map<String, String> requests) {
        String employeeId = getEmployeeIdFromAuthentication();
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
               .orElseThrow(() -> new RuntimeException("해당 직원을 찾을 수 없습니다"));

        if (requests.containsKey("employeeTel")) {
            employee.setEmployeeTel(requests.get("employeeTel"));
        }
        if (requests.containsKey("employeeStatus")) {
            employee.setEmployeeStatus(requests.get("employeeStatus"));
        }
        if (requests.containsKey("employeeStatusMessage")) {
            employee.setEmployeeStatusMessage(requests.get("employeeStatusMessage"));
        }

        employeeRepository.save(employee);
    }


    /////////////////////////////////////////////////////////////////////// 🟠 쪽지


    // 상태에 따른 쪽지 목록 조회 및 검색
    public List<MessageDTO> getNoteListByUser(String searchKeyword, String noteStatus) {
        logger.error("쪽지 목록 서비스 층에서 조회 중 로그 오류 발생");
        String employeeId = getEmployeeIdFromAuthentication();
        return messageRepository.getNoteListByUser(employeeId, searchKeyword, noteStatus);
    }

    // 쪽지 상세 정보 조회 및 읽음 여부 업데이트
    @Transactional
    public MessageDTO getNoteByNo(Long messageNo) {
        String employeeId = getEmployeeIdFromAuthentication();
        return messageRepository.getNoteByNo(messageNo, employeeId);
    }

    // 쪽지 북마크 상태 업데이트
    public void updateBookmark(Long messageNo) {
        String employeeId = getEmployeeIdFromAuthentication();

        // 사용자 아이디와 메시지 넘버로 수신자 테이블에서 행 조회하고 해당 북마크 여부를 'Y'로 업데이트 후 저장하기
        MessageRecipientId recipientId = new MessageRecipientId();
        recipientId.setMessageNo(messageNo);
        recipientId.setRecipientId(employeeId);

        MessageRecipient recipient = messageRecipientRepository.findById(recipientId)
                .orElseThrow(() -> new NoSuchElementException("해당 쪽지를 찾을 수 없습니다."));

        recipient.setBookmarkedYn("Y");
        messageRecipientRepository.save(recipient);
    }

    // 쪽지 회수 (수신자의 읽음 상태가 모두 N인 경우)
    @Transactional
    public void recallNote(Long messageNo) {

        Message message = messageRepository.findById(messageNo)
                .orElseThrow(() -> new NoSuchElementException("해당 메시지를 찾을 수 없습니다: " + messageNo));

        // 1. 수신자 목록 조회
        List<MessageRecipient> recipients = messageRecipientRepository.findByMessageRecipientIdMessageNo(messageNo);

        // 2. 수신자들 중 읽음 상태가 'Y'인 경우 회수 불가 처리
        boolean anyRead = recipients.stream().anyMatch(recipient -> "Y".equals(recipient.getRecipientReadYn()));
        if (anyRead) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수신자가 이미 쪽지를 읽었기 때문에 회수할 수 없습니다.");
        }

        // 3. 수신자들에 대해 수신 상태를 '회수됨'으로 표시 (삭제 상태로 업데이트)
        for (MessageRecipient recipient : recipients) {
            recipient.setRecipientDeleteYn("Y");
            messageRecipientRepository.save(recipient);
        }

        // 4. 발신자에 대해서도 메시지 회수 상태를 'Y'로 설정
        message.setMessageRecallYn("Y");
        messageRepository.save(message);
    }

    // 새 쪽지 생성
    @Transactional
    public MessageDTO createNote(String senderId, String messageContent, Optional<LocalDateTime> scheduledDate, List<String> receiverIds) {

        // 발신자 조회
        Employee sender = employeeRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("발신자를 찾을 수 없습니다: " + senderId));

        // 수신자 목록이 null 이거나 비어 있는지 확인
        if (receiverIds == null || receiverIds.isEmpty()) {
            receiverIds.add(senderId);
        }

        // 1. 메시지 생성 및 발신자 설정
        Message message = new Message();
        message.setEmployee(sender);
        message.setMessageContent(messageContent);
        message.setMessageSendDate(scheduledDate.orElse(LocalDateTime.now()));

        // 메시지 저장
        messageRepository.save(message);

        Message newMessage = messageRepository.findById(message.getMessageNo())
                .orElseThrow(() -> new RuntimeException("쪽지를 찾을 수 없습니다"));

        // 2. 수신자에 대한 처리 (내부용으로만 사용, 반환 데이터에 포함되지 않음)
        List<String> savedReceiverIds = new ArrayList<>();
        for (String receiverId : receiverIds) {
            Employee recipient = employeeRepository.findById(receiverId)
                    .orElseThrow(() -> new RuntimeException("수신자를 찾을 수 없습니다: " + receiverId));

            MessageRecipient messageRecipient = new MessageRecipient(newMessage, recipient);
            messageRecipientRepository.save(messageRecipient);
            savedReceiverIds.add(receiverId);
        }

        MessageDTO messageDTO = new MessageDTO(message);
        messageDTO.setMessageReceiverIds(savedReceiverIds);
        messageDTO.setEmployeeName(sender.getEmployeeName());
        messageDTO.setEmployeeJobName(sender.getJob().getJobName());
        messageDTO.setEmployeeDepartmentName(sender.getDepartment().getDepartmentName());
        messageDTO.setBookmarkedYn("N");

        return messageDTO;
    }

    // 쪽지 전체 삭제 (상태별)
    @Transactional
    public void deleteAllNotes(String noteStatus) {
        String employeeId = getEmployeeIdFromAuthentication();

        switch (noteStatus) {
            case "sent":
                // 본인이 보낸 모든 쪽지 삭제 여부를 'Y'로 업데이트
                messageRepository.updateMessageDeleteYnByEmployeeId(employeeId, "Y");
                break;

            case "received":
                // 수신한 모든 쪽지 삭제 여부를 'Y'로 업데이트
                messageRecipientRepository.updateRecipientDeleteYnByRecipientId(employeeId, "Y");
                break;

            case "new":
                // 읽지 않은 모든 쪽지 삭제 여부를 'Y'로 업데이트
                messageRecipientRepository.updateRecipientDeleteYnByRecipientIdAndRecipientReadYn(employeeId, "N", "Y");
                break;

            case "bookmarked":
                // 북마크된 모든 쪽지 삭제 여부를 'Y'로 업데이트
                messageRecipientRepository.updateRecipientDeleteYnByRecipientIdAndBookmarkedYn(employeeId, "Y", "Y");
                break;

            default:
                throw new IllegalArgumentException("현재 쪽지 상태를 알 수 없습니다: " + noteStatus);
        }

        // Message 테이블의 쪽지를 완전 삭제하기 위한 조건 확인 및 삭제
        List<Message> messagesToCheck = messageRepository.findAllByMessageDeleteYn("Y");
        for (Message message : messagesToCheck) {
            boolean allRecipientsDeleted = messageRecipientRepository
                    .countByMessageMessageNoAndRecipientDeleteYn(message.getMessageNo(), "N") == 0;

            if (allRecipientsDeleted) {
                messageRepository.deleteById(message.getMessageNo());
            }
        }
    }

    // 쪽지 개별 삭제
    @Transactional
    public void deleteNoteById(Long messageNo) {
        String employeeId = getEmployeeIdFromAuthentication();

        // 현재 사용자가 발신자인 경우
        boolean isSender = messageRepository.existsByMessageNoAndEmployeeEmployeeIdAndMessageDeleteYn(messageNo, employeeId, "N");
        if (isSender) {
            // 발신자가 메시지를 삭제하는 경우, 삭제 여부를 'Y'로 업데이트
            messageRepository.updateMessageDeleteYnByMessageNo(messageNo, "Y");
        } else {
            // 현재 사용자가 수신자인 경우
            MessageRecipientId recipientId = new MessageRecipientId();
            recipientId.setMessageNo(messageNo);
            recipientId.setRecipientId(employeeId);

            MessageRecipient recipient = messageRecipientRepository.findById(recipientId)
                    .orElseThrow(() -> new NoSuchElementException("해당 쪽지를 찾을 수 없습니다: " + messageNo));

            // 수신자가 받은 메시지를 삭제하는 경우, 삭제 여부를 'Y'로 업데이트
            recipient.setRecipientDeleteYn("Y");
            messageRecipientRepository.save(recipient);
        }

        // 발신자와 수신자 모두 삭제 상태인 경우 메시지를 완전히 삭제
        boolean allRecipientsDeleted = messageRecipientRepository
                .countByMessageMessageNoAndRecipientDeleteYn(messageNo, "N") == 0;

        Message message = messageRepository.findById(messageNo)
                .orElseThrow(() -> new NoSuchElementException("해당 메시지를 찾을 수 없습니다: " + messageNo));

        if ("Y".equals(message.getMessageDeleteYn()) && allRecipientsDeleted) {
            messageRepository.deleteById(messageNo);
            logger.info("모든 수신자와 발신자가 삭제 상태이므로 Message 테이블에서 완전 삭제되었습니다: {}", messageNo);
        }
    }

    // 실시간 쪽지 전송
    public void sendNote(List<String> receiverIds, String messageContent) {

        // 나에게 보내기
        String employeeId = getEmployeeIdFromAuthentication();
        if (receiverIds == null || receiverIds.isEmpty()) {
            receiverIds.add(employeeId);
        }

        for (String receiverId : receiverIds) {
            SseEmitter emitter = emitters.get(receiverId);
            if (emitter != null) {
                try {
                    emitter.send(SseEmitter.event().name("NEW_NOTE").data(messageContent));
                } catch (Exception e) {
                    emitters.remove(receiverId);
                    logger.error("SSE 전송 중 오류 발생 (사용자 ID: {}): {}", receiverId, e.getMessage());
                }
            } else {
                logger.info("구독 중이 아닌 사용자입니다: {}", receiverId);
            }
        }

    }

//    // 실시간 알림 구독
//    public SseEmitter noteSubscribe() {
//        String senderId = getEmployeeIdFromAuthentication();
//        SseEmitter emitter = new SseEmitter();
//        emitters.put(senderId, emitter);
//
//        // 연결 종료 및 타임아웃 처리
//        emitter.onCompletion(() -> emitters.remove(senderId));
//        emitter.onTimeout(() -> emitters.remove(senderId));
//
//        try {
//            emitter.send(SseEmitter.event().name("INIT"));
//        } catch (Exception e) {
//            emitters.remove(senderId);
//        }
//
//        return emitter;
//    }


    /////////////////////////////////////////////////////////////////////// 🔴 채팅


    // 현재 참여하고 있는 채팅 목록 조회 및 검색
    public List<ChatDTO> getChatListByUser(String searchKeyword) {
        String employeeId = getEmployeeIdFromAuthentication();
        return chatRepository.getChatListByUser(employeeId, searchKeyword);
    }

    // 개별 채팅방 조회 및 검색 (📌검색 프론트에서 아직 구현 안 함, 하자!)
    public Map<String, Object> getSelectedChat(Long chatNo, String searchKeyword) {
        String employeeId = getEmployeeIdFromAuthentication();
        List<ChatMessageDTO> chatMessages = chatRepository.getSelectedChat(chatNo, searchKeyword, employeeId);

        Map<String, Object> response = new HashMap<>();
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


        Employee sender = employeeRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("해당 발신자를 찾을 수 없습니다: " + senderId));
        Chat chat = chatRepository.findById(chatNo)
                .orElseThrow(() -> new RuntimeException("해당 채팅방을 찾을 수 없습니다: " + chatNo));

        // 새로운 메시지 생성 및 저장
        ChatMessage newMessage = new ChatMessage();
        newMessage.setChat(chat);
        newMessage.setEmployee(sender);
        newMessage.setChatMessageContent(chatMessage.getChatMessageContent());
        ChatMessage savedMessage = chatMessageRepository.save(newMessage);

        // 메시지 DTO 반환 준비
        ChatMessageDTO savedMessageDTO = new ChatMessageDTO(savedMessage);
        savedMessageDTO.setChatSenderName(sender.getEmployeeName());
        savedMessageDTO.setEmployeeImageUrl(sender.getEmployeeImageUrl());

        // 파일이 있는 경우 메타데이터 저장
        if (chatMessage.getChatFileUrl() != null) {
            saveChatFileMetadata(savedMessage, chatMessage.getChatFileUrl(), chatMessage.getChatFileName());

            // 저장된 파일 메타데이터를 가져와서 savedMessageDTO에 설정
            savedMessageDTO.setChatFileUrl(chatMessage.getChatFileUrl());
            savedMessageDTO.setChatFileName(chatMessage.getChatFileName());
        }

        // 채팅방의 모든 참여자에 대해 ChatMessageRead 엔티티 생성
        List<ChatParticipant> participants = chatParticipantRepository.findByChat(chat);
        for (ChatParticipant participant : participants) {
            if (!participant.getEmployee().getEmployeeId().equals(senderId)) {
                ChatMessageReadId readId = new ChatMessageReadId(savedMessage.getChatMessageNo(), participant.getEmployee().getEmployeeId());
                ChatMessageRead messageRead = new ChatMessageRead(readId, savedMessage, participant.getEmployee(), "N");
                chatMessageReadRepository.save(messageRead);
            }
        }

        return savedMessageDTO;
    }

    // 파일 메타데이터 저장 메서드
    private void saveChatFileMetadata(ChatMessage chatMessage, String chatFileUrl, String chatFileName) {
        ChatFile chatFile = new ChatFile();
        chatFile.setChatMessage(chatMessage);
        chatFile.setChatFileUrl(chatFileUrl);
        chatFile.setChatFileName(chatFileName);
        chatFileRepository.save(chatFile);
    }
}
