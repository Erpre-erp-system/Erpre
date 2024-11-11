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
//    @MessageMapping("/note")
//    public void sendNote(MessageDTO message, Principal principal) {
//
//        String senderId = principal.getName();
//        message.getEmployee().getEmployeeId(senderId);
//
//        // 수신자 목록 가져오기 (예: 수신자 ID들을 리스트로 포함)
//        List<String> receiverIds = noteMessage.getReceiverIds(); // ChatMessageDTO에 수신자 ID 리스트가 있다고 가정
//
//        // 메시지 DB에 저장 (다수의 수신자에 대해 별도의 로직을 구현)
//        ChatMessageDTO savedNote = messengerService.saveNoteMessage(noteMessage, senderId, receiverIds);
//
//        // 각 수신자에게 메시지 전송
//        for (String receiverId : receiverIds) {
//            messagingTemplate.convertAndSendToUser(receiverId, "/queue/note", savedNote);
//            System.out.println("쪽지 전송 완료 - 수신자: " + receiverId + ", 경로: /user/" + receiverId + "/queue/note, 메시지 내용: " + savedNote);
//        }
//    }


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
