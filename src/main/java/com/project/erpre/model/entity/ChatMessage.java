package com.project.erpre.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "m_chat_message")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="chat_message_no")
    private Long chatMessageNo;

    @ManyToOne
    @JoinColumn(name = "chat_no", nullable = false)
    private Chat chat;

    @ManyToOne
    @JoinColumn(name = "chat_sender_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String chatMessageContent;

    @Column(nullable = false)
    private LocalDateTime chatSendDate;

    @OneToMany(mappedBy = "chatMessage", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    private List<ChatMessageRead> chatMessageReads;

    @OneToMany(mappedBy = "chatMessage", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    private List<ChatFile> chatFiles;

    // 엔티티가 처음 저장될 때 현재 시간을 자동으로 설정
    @PrePersist
    public void prePersist() {
        this.chatSendDate = (this.chatSendDate == null) ? LocalDateTime.now() : this.chatSendDate;
    }

}
