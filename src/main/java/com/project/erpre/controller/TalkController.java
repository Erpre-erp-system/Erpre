package com.project.erpre.controller;

import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.model.dto.MessageDTO;
import com.project.erpre.service.MessengerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// 웹소켓 메시지 커치
// 클라이언트 간 실시간 메시지 전송 (채팅, 쪽지, 알림 등)
// STOMP 프로토콜을 이용해 메시지를 처리하고 브로드캐스트
@Controller
public class TalkController {


    private final MessengerService messengerService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public TalkController(MessengerService messengerService, SimpMessagingTemplate messagingTemplate) {
        this.messengerService = messengerService;
        this.messagingTemplate = messagingTemplate;
    }

    // 🟠 쪽지 메세지 전송 및 저장
    @MessageMapping("/note")
    public void sendNote(MessageDTO message, Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("인증된 사용자가 필요합니다.");
        }

        String senderId = principal.getName();

        Optional<LocalDateTime> scheduledDate = Optional.ofNullable(message.getMessageSendDate());

        // 메시지 저장 처리
        MessageDTO savedNote = messengerService.createNote(senderId, message.getMessageContent(), scheduledDate, message.getMessageReceiverIds());

        // 각 수신자에게 메시지 전송D
        for (String receiverId : message.getMessageReceiverIds()) {
            messagingTemplate.convertAndSendToUser(receiverId, "/queue/note", savedNote);
        }
    }


    // 🔴 채팅 메시지 전송 및 저장
    @MessageMapping("/chat/{chatNo}") //  클라이언트가 /app/chat/{chatNo}로 메시지를 전송하면 서버의 @MessageMapping("/chat/{chatNo}") 메서드가 실행
    public void sendTalk(@DestinationVariable Long chatNo, ChatMessageDTO chatMessage) {

        // 메시지 DB에 저장
        ChatMessageDTO savedMessage = messengerService.saveChatMessage(chatNo, chatMessage, chatMessage.getChatSenderId());

        // 메시지 저장 및 전송 확인
        System.out.println("메시지 저장 후 전송: 채팅방 번호 " + chatNo + ", 메시지 내용: " + savedMessage);

        // 특정 채팅방 구독자들에게만 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/" + chatNo, savedMessage);

        System.out.println("메시지 저장 후 전송: 채팅방 번호 " + chatNo + ", 메시지 내용: " + savedMessage);
        System.out.println("메시지 전송 완료 - 구독 경로: /topic/chat/" + chatNo + ", 메시지 내용: " + savedMessage);
    }


}
