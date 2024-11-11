package com.project.erpre.model.dto;

import com.project.erpre.model.entity.ChatMessage;
import lombok.*;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {

    private Long chatNo;
    private Long chatMessageNo;
    private String chatSenderId;
    private String chatSenderName;
    private String chatMessageContent;
    private LocalDateTime chatSendDate;
    private String chatTitle;
    private String chatFileName;
    private String chatFileUrl;
    private BigInteger chatFileSize;
    private String chatFileType;
    private String chatMessageReadYn;
    private Long readCount;
    private Long participantCount;
    private String employeeImageUrl;

    // 개별 채팅방 조회 생성자
    public ChatMessageDTO(Long chatMessageNo, String chatSenderId, String chatSenderName, String employeeImageUrl,
                          String chatMessageContent, LocalDateTime chatSendDate,
                          String chatTitle, String chatFileName, String chatFileUrl,
                          BigInteger chatFileSize, String chatFileType, String chatMessageReadYn,
                          Long readCount, Long participantCount) {
        this.chatMessageNo = chatMessageNo;
        this.chatSenderId = chatSenderId;
        this.chatSenderName = chatSenderName;
        this.employeeImageUrl = employeeImageUrl; // 발신자 이미지 URL
        this.chatMessageContent = chatMessageContent;
        this.chatSendDate = chatSendDate;
        this.chatTitle = chatTitle;
        this.chatFileName = chatFileName;
        this.chatFileUrl = chatFileUrl;
        this.chatFileSize = chatFileSize;
        this.chatFileType = chatFileType;
        this.chatMessageReadYn = chatMessageReadYn;
        this.readCount = readCount;
        this.participantCount = participantCount;

    }

    // ChatMessage로부터 DTO 생성하는 생성자 (메시지 저장)
    public ChatMessageDTO(ChatMessage chatMessage) {
        this.chatNo = chatMessage.getChat().getChatNo(); // 채팅방 번호
        this.chatMessageNo = chatMessage.getChatMessageNo(); // 메시지 번호
        this.chatSenderId = chatMessage.getEmployee().getEmployeeId(); // 발신자 ID
        this.chatMessageContent = chatMessage.getChatMessageContent(); // 메시지 내용
        this.chatSendDate = chatMessage.getChatSendDate(); // 메시지 전송 시간
    }
}
