package com.project.erpre.model.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "m_note_receiver")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class NoteReceiver {

    @EmbeddedId
    private NoteReceiverId noteReceiverId;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("noteNo")
    @JoinColumn(name = "note_no", nullable = false)
    private Note note;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("noteReceiverId")
    @JoinColumn(name = "note_receiver_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 1)
    private String noteReceiverReadYn = "N";

    private LocalDateTime noteReceiverReadDate;

    @Column(nullable = false, length = 1)
    private String noteReceiverDeleteYn = "N";

    private LocalDateTime noteReceiverDeleteDate;

    @Column(nullable = false, length = 1)
    private String noteReceiverBookmarkedYn = "N";

    public NoteReceiver(Note note, Employee employee) {
        this.noteReceiverId = new NoteReceiverId(note.getNoteNo(), employee.getEmployeeId());
        this.note = note;
        this.employee = employee;
        this.noteReceiverReadYn = "N";
        this.noteReceiverDeleteYn = "N";
        this.noteReceiverBookmarkedYn = "N";
    }


}

