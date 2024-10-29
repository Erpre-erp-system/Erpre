package com.project.erpre.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
public class ChatMessageDTO {

    private Long chatMessageNo;
    private Long chatNo;
    private String chatSenderId;
    private String employeeName;
    private String chatMessageContent;
    private LocalDateTime chatSendDate;
    private String chatFileName;
    private String chatFileUrl;

    // 선택된 채팅방 조회 생성자
    public ChatMessageDTO(Long chatMessageNo, Long chatNo, String chatSenderId, String employeeName,
                          String chatMessageContent, LocalDateTime chatSendDate,
                          String chatFileName, String chatFileUrl) {
        this.chatMessageNo = chatMessageNo;
        this.chatNo = chatNo;
        this.chatSenderId = chatSenderId;
        this.employeeName = employeeName;
        this.chatMessageContent = chatMessageContent;
        this.chatSendDate = chatSendDate;
        this.chatFileName = chatFileName;
        this.chatFileUrl = chatFileUrl;
    }

}
