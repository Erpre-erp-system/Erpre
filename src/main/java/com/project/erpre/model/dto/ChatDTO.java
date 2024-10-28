package com.project.erpre.model.dto;

import lombok.*;
import net.bytebuddy.asm.Advice;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ChatDTO {

    private Long chatNo;
    private String chatTitle;
    private String participantId;
    private String employeeName;
    private String chatMessageContent;
    private LocalDateTime chatSendDate;
    private String chatFilename;
    private String chatFileUrl;
    private Long participantCount;

    // 현재 참여하고 있는 채팅 목록 조회 및 검색 생성자
    public ChatDTO(Long chatNo, String chatTitle, String participantId, String employeeName,
                   String chatMessageContent, LocalDateTime chatSendDate,
                   String chatFilename, Long participantCount) {
        this.chatNo = chatNo;
        this.chatTitle = chatTitle;
        this.participantId = participantId;
        this.employeeName = employeeName;
        this.chatMessageContent = chatMessageContent;
        this.chatSendDate = chatSendDate;
        this.chatFilename = chatFilename;
        this.participantCount = participantCount;
    }

    // 선택된 채팅방 조회 생성자
    public ChatDTO(Long chatNo, String chatTitle, String employeeName,
                   String chatMessageContent, LocalDateTime chatSendDate,
                   String chatFilename, String chatFileUrl) {
        this.chatNo = chatNo;
        this.chatTitle = chatTitle;
        this.employeeName = employeeName;
        this.chatMessageContent = chatMessageContent;
        this.chatSendDate = chatSendDate;
        this.chatFilename = chatFilename;
        this.chatFileUrl = chatFileUrl;
    }


}
