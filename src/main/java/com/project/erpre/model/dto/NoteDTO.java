package com.project.erpre.model.dto;

import com.project.erpre.model.entity.Note;
import lombok.*;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoteDTO {

    private Long noteNo;
    private String noteSenderId;
    private String employeeName; // 발신자
    private String employeeJobName; // 발신자 직급
    private String employeeDepartmentName; // 발신자 부서
    private String noteContent; // 쪽지 내용
    private LocalDateTime noteSendDate;
    private LocalDateTime noteUpdateDate;
    private String noteDeleteYn;
    private LocalDateTime noteDeleteDate;
    private String noteRecallYn;
    private String noteReceiverId;
    private List<String> noteReceiverNames;
    private String noteReceiverReadYn;
    private LocalDateTime noteReceiverReadDate;
    private String noteReceiverDeleteYn;
    private String noteReceiverBookmarkedYn;
    private LocalDateTime noteRecallDate;
    private Integer noteAttachmentId;
    private List<String> noteReceiverIds;
    private String noteFileName;
    private String noteFileUrl;
    private BigInteger noteFileSize;
    private String noteFileType;

    // 상태에 따른 쪽지 목록 조회 및 검색 생성자
    public NoteDTO(Long noteNo, String noteSenderId, String employeeName, String noteContent,
                   LocalDateTime noteSendDate, String noteDeleteYn, String noteRecallYn,
                   String noteReceiverId, String noteReceiverReadYn, LocalDateTime noteReceiverReadDate,
                   String noteReceiverDeleteYn, String noteReceiverBookmarkedYn, Integer noteAttachmentId) {
        this.noteNo = noteNo;
        this.noteSenderId = noteSenderId;
        this.employeeName = employeeName;
        this.noteContent = noteContent;
        this.noteSendDate = noteSendDate;
        this.noteDeleteYn = noteDeleteYn;
        this.noteRecallYn = noteRecallYn;
        this.noteReceiverId = noteReceiverId;
        this.noteReceiverReadYn = noteReceiverReadYn;
        this.noteReceiverReadDate = noteReceiverReadDate;
        this.noteReceiverDeleteYn = noteReceiverDeleteYn;
        this.noteReceiverBookmarkedYn = noteReceiverBookmarkedYn;
        this.noteAttachmentId = noteAttachmentId;
    }

    // 새 쪽지 생성 생성자
    public NoteDTO(Note note) {
        this.noteNo = note.getNoteNo();
        this.noteSenderId = note.getEmployee().getEmployeeId();
        this.noteContent = note.getNoteContent();
        this.noteSendDate = note.getNoteSendDate();
        this.noteDeleteYn = note.getNoteDeleteYn();
        this.noteRecallYn = note.getNoteRecallYn();
    }

    // 쪽지 개별 조회 생성자
    public NoteDTO(Long noteNo, String senderName, String employeeJobName, String employeeDepartmentName, String noteContent, LocalDateTime noteSendDate, String noteRecallYn, LocalDateTime noteRecallDate,
                   String noteReceiverReadYn, LocalDateTime noteReceiverReadDate, String noteReceiverBookmarkedYn,
                   String noteFileName, String noteFileUrl, BigInteger noteFileSize, String noteFileType) {
        this.noteNo = noteNo;
        this.employeeName = senderName;
        this.employeeJobName = employeeJobName;
        this.employeeDepartmentName = employeeDepartmentName;
        this.noteContent = noteContent;
        this.noteSendDate = noteSendDate;
        this.noteRecallYn = noteRecallYn;
        this.noteRecallDate = noteRecallDate;
        this.noteReceiverReadYn = noteReceiverReadYn;
        this.noteReceiverReadDate = noteReceiverReadDate;
        this.noteReceiverBookmarkedYn = noteReceiverBookmarkedYn;
        this.noteFileName = noteFileName;
        this.noteFileUrl = noteFileUrl;
        this.noteFileSize = noteFileSize;
        this.noteFileType = noteFileType;
    }

    // 새 쪽지 저장 DTO
    @Data
    public static class NoteRequestDTO {
        private String employeeName;
        private String employeeJobName;
        private String employeeDepartmentName;
        private String bookmarkedYn;
        private String noteContent;
        private LocalDateTime noteSendDate;
        private List<String> noteReceiverIds;
    }
}
