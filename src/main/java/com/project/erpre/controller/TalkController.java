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

//    // 🟠 쪽지 메세시 전송 및 저장
//    @MessageMapping("/talk/note/{noteNo}")


    // 🔴 채팅 메시지 전송 및 저장
    @MessageMapping("/chat/{chatNo}")
    public void sendTalk(@DestinationVariable Long chatNo, ChatMessageDTO chatMessage, Principal principal) {

        String employeeId = principal.getName();
        chatMessage.setChatSenderId(employeeId);

        // 메시지 DB에 저장
        ChatMessageDTO savedMessage = messengerService.saveChatMessage(chatNo, chatMessage, employeeId);

        // 메시지 저장 및 전송 확인
        System.out.println("메시지 저장 후 전송: 채팅방 번호 " + chatNo + ", 메시지 내용: " + savedMessage);

        // 특정 채팅방 구독자들에게만 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/" + chatNo, savedMessage);

        // 로그 추가: 메시지 전송 완료 확인
        System.out.println("메시지 전송 완료 - 구독 경로: /topic/chat/" + chatNo + ", 메시지 내용: " + savedMessage);
    }

}
