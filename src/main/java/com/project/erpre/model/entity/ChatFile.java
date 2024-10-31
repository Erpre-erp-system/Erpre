package com.project.erpre.model.entity;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.*;

import javax.persistence.*;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "m_chat_file")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ChatFile {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "chat_attachment_id")
    private Long chatAttachmentId;

    @ManyToOne
    @JsonManagedReference
    @JoinColumn(name = "chat_message_no", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private ChatMessage chatMessage;

    @Column(name = "chat_file_name", length = 255)
    private String chatFileName;

    @Column(name = "chat_file_url", nullable = false, length = 255)
    private String chatFileUrl;

    @Column(name = "chat_file_size")
    private BigInteger chatFileSize;

    @Column(name = "chat_file_type", length = 50)
    private String chatFileType;
}
