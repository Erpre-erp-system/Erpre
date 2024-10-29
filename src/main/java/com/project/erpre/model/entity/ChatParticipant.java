package com.project.erpre.model.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "m_chat_participant")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ChatParticipant {

    @EmbeddedId
    private ChatParticipantId chatParticipantId;

    @Column(nullable = true, length = 50)
    private String chatTitle;

    @ManyToOne
    @MapsId("chatNo")
    @JoinColumn(name = "chat_no", nullable = false)
    private Chat chat;

    @ManyToOne
    @MapsId("participantId")
    @JoinColumn(name = "participant_id", nullable = false)
    private Employee employee;


    // Chat과 Employee를 인자로 받아 ChatParticipantId를 설정하는 생성자
    public ChatParticipant(Chat chat, Employee employee, String chatTitle) {
        this.chat = chat;
        this.employee = employee;
        this.chatParticipantId = new ChatParticipantId(chat.getChatNo(), employee.getEmployeeId());
        this.chatTitle = chatTitle;
    }

}
