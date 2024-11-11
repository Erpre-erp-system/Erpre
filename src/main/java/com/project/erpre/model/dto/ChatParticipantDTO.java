package com.project.erpre.model.dto;

import com.project.erpre.model.entity.ChatParticipant;
import com.project.erpre.model.entity.ChatParticipantId;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatParticipantDTO {

    private Long chatNo;
    private String participantId;
    private String chatTitle;
    private String employeeImageUrl;
    private String employeeName;

    // DTO -> Entity 변환 메서드 (새 채팅방 생성)
    public ChatParticipantDTO(ChatParticipant chatParticipant) {
        this.chatNo = chatParticipant.getChat().getChatNo();
        this.participantId = chatParticipant.getEmployee().getEmployeeId();
        this.chatTitle = chatParticipant.getChatTitle();
    }

    // 내부 클래스 ChatTitleUpdateDTO (채팅방 이름 변경)
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatTitleUpdateDTO {
        private Long chatNo;
        private String chatTitle;
    }

    public ChatParticipantDTO(String participantId, String employeeName, String employeeImageUrl) {
        this.participantId = participantId;
        this.employeeName = employeeName;
        this.employeeImageUrl = employeeImageUrl;
    }
}
