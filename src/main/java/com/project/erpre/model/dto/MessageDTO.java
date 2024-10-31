package com.project.erpre.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {

    private Long messageNo;
    private String messageSenderId;
    private String employeeName;
    private String messageContent;
    private LocalDateTime messageSendDate;
    private LocalDateTime messageUpdateDate;
    private String messageDeleteYn;
    private LocalDateTime messageDeleteDate;
    private String messageRecallYn;
    private String recipientId;
    private String recipientReadYn;
    private LocalDateTime recipientReadDate;
    private String recipientDeleteYn;
    private String bookmarkedYn;
    private LocalDateTime messageRecallDate;
    private Integer messageAttachmentId;

    // 상태에 따른 쪽지 목록 조회 및 검색 생성자
    public MessageDTO(Long messageNo, String messageSenderId, String employeeName, String messageContent,
                      LocalDateTime messageSendDate, String messageDeleteYn, String messageRecallYn,
                      String recipientId, String recipientReadYn, LocalDateTime recipientReadDate,
                      String recipientDeleteYn, String bookmarkedYn, Integer messageAttachmentId) {
        this.messageNo = messageNo;
        this.messageSenderId = messageSenderId;
        this.employeeName = employeeName;
        this.messageContent = messageContent;
        this.messageSendDate = messageSendDate;
        this.messageDeleteYn = messageDeleteYn;
        this.messageRecallYn = messageRecallYn;
        this.recipientId = recipientId;
        this.recipientReadYn = recipientReadYn;
        this.recipientReadDate = recipientReadDate;
        this.recipientDeleteYn = recipientDeleteYn;
        this.bookmarkedYn = bookmarkedYn;
        this.messageAttachmentId = messageAttachmentId;
    }
    

}
