package com.project.erpre.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;
import javax.persistence.Id;


import javax.persistence.*;
import java.math.BigInteger;
import java.time.LocalDateTime;

@Entity
@Table(name = "m_note_file")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class NoteFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "note_attachment_id")
    private Integer noteAttachmentId;

    @ManyToOne
    @JsonManagedReference
    @JoinColumn(name = "note_no", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    @JsonIgnore
    private Note note;

    @Column(name = "note_file_name", length = 255)
    private String noteFileName;

    @Column(name = "note_file_url", nullable = false, length = 255)
    private String noteFileUrl;

    @Column(name = "note_file_size")
    private BigInteger noteFileSize;

    @Column(name = "note_file_type", length = 50)
    private String noteFileType;

    @Column(nullable = false, length=10)
    private String noteFileDeleteYn = "n";

    private LocalDateTime noteFileDeleteDate;

}
