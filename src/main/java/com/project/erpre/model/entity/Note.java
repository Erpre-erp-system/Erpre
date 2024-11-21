package com.project.erpre.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="m_note")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long noteNo;

    @ManyToOne
    @JoinColumn(name = "note_sender_id", nullable = false)
    private Employee employee; // 발신자

    @Column(nullable = false)
    private String noteContent;

    @Column(nullable = false)
    private LocalDateTime noteSendDate;

    private LocalDateTime noteUpdateDate;

    @Column(nullable = false, length = 10)
    private String noteDeleteYn = "N";

    private LocalDateTime noteDeleteDate;

    @Column(nullable = false, length = 10)
    private String noteRecallYn = "N";

    private LocalDateTime noteRecallDate;

    @OneToMany(mappedBy = "note", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<NoteReceiver> noteReceiverList;

    @JsonIgnore
    @ToString.Exclude
    @OneToMany(mappedBy = "note", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<NoteFile> noteFiles;

}
