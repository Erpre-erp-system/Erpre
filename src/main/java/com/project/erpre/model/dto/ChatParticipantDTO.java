package com.project.erpre.model.dto;

import com.project.erpre.model.entity.ChatParticipant;
import com.project.erpre.model.entity.ChatParticipantId;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ChatParticipantDTO {

    private Long chatNo;
    private String participantId;
    private String chatTitle;

    // DTO -> Entity 변환 메서드
    public ChatParticipantDTO(ChatParticipant chatParticipant) {
        this.chatNo = chatParticipant.getChat().getChatNo();
        this.participantId = chatParticipant.getEmployee().getEmployeeId();
        this.chatTitle = chatParticipant.getChatTitle();
    }
}
