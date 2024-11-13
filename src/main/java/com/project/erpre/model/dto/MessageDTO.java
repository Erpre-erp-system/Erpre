package com.project.erpre.model.dto;

import com.project.erpre.model.entity.Message;
import lombok.*;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {

    private Long messageNo;
    private String messageSenderId;
    private String employeeName; // 발신자
    private String employeeJobName; // 발신자 직급
    private String employeeDepartmentName; // 발신자 부서
    private String messageContent; // 쪽지 내용
    private LocalDateTime messageSendDate;
    private LocalDateTime messageUpdateDate;
    private String messageDeleteYn;
    private LocalDateTime messageDeleteDate;
    private String messageRecallYn;
    private String recipientId;
    private List<String> recipientNames;
    private String recipientReadYn;
    private LocalDateTime recipientReadDate;
    private String recipientDeleteYn;
    private String bookmarkedYn;
    private LocalDateTime messageRecallDate;
    private Integer messageAttachmentId;
    private List<String> messageReceiverIds;
    private String messageFileName;
    private String messageFileUrl;
    private BigInteger messageFileSize;
    private String messageFileType;

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

    // 새 쪽지 생성 생성자
    public MessageDTO(Message message) {
        this.messageNo = message.getMessageNo();
        this.messageSenderId = message.getEmployee().getEmployeeId();
        this.messageContent = message.getMessageContent();
        this.messageSendDate = message.getMessageSendDate();
        this.messageDeleteYn = message.getMessageDeleteYn();
        this.messageRecallYn = message.getMessageRecallYn();
    }

    // 쪽지 개별 조회 생성자
    public MessageDTO(Long messageNo, String senderName, String employeeJobName, String employeeDepartmentName, String messageContent, LocalDateTime messageSendDate,
                      String messageRecallYn, LocalDateTime messageRecallDate, String recipientReadYn,
                      LocalDateTime recipientReadDate, String bookmarkedYn, String messageFileName, String messageFileUrl,
                      BigInteger messageFileSize, String messageFileType) {
        this.messageNo = messageNo;
        this.employeeName = senderName;
        this.employeeJobName = employeeJobName;
        this.employeeDepartmentName = employeeDepartmentName;
        this.messageContent = messageContent;
        this.messageSendDate = messageSendDate;
        this.messageRecallYn = messageRecallYn;
        this.messageRecallDate = messageRecallDate;
        this.recipientReadYn = recipientReadYn;
        this.recipientReadDate = recipientReadDate;
        this.bookmarkedYn = bookmarkedYn;
        this.messageFileName = messageFileName;
        this.messageFileUrl = messageFileUrl;
        this.messageFileSize = messageFileSize;
        this.messageFileType = messageFileType;
    }

    // 새 쪽지 저장 DTO
    @Data
    public static class NoteRequestDTO {
        private String employeeName;
        private String employeeJobName;
        private String employeeDepartmentName;
        private String bookmarkedYn;
        private String messageContent;
        private LocalDateTime messageSendDate;
        private List<String> messageReceiverIds;
    }
}
