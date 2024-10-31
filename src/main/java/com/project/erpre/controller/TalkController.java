package com.project.erpre.controller;

import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.service.MessengerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

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

//    // 🟣 쪽지(Message) 전송
//    @MessageMapping("/talk/message") // 클라이언트가 메시지를 "/app/talk/message"으로 보내면 호출됨
//    @SendTo("/topic/message") // 모든 클라이언트에게 메시지를 "/topic/message" 경로로 전송
//    public TalkMessage send(TalkMessage message) {
//        return message; // 실시간 쪽지를 그대로 반환하여 모든 구독자에게 전달
//    }

    // 🔴 채팅 메시지 전송 및 저장
    @MessageMapping("/talk/chat/{chatNo}")
    public void sendTalk(@DestinationVariable Long chatNo, ChatMessageDTO chatMessage, Principal principal) {

        String employeeId = principal.getName();
        chatMessage.setChatSenderId(employeeId);

        // 메시지 DB에 저장
        ChatMessageDTO savedMessage = messengerService.saveChatMessage(chatNo, chatMessage, employeeId);

        // 메시지 저장 및 전송 확인
        System.out.println("메시지 저장 후 전송: 채팅방 번호 " + chatNo + ", 메시지 내용: " + savedMessage);

        // 특정 채팅방 구독자들에게만 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/" + chatNo, savedMessage);
        System.out.println("메시지 전송 완료: 구독 경로 /topic/chat/" + chatNo);
    }

}
