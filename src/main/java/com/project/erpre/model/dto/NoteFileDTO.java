package com.project.erpre.model.dto;

import lombok.*;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Data
@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class NoteFileDTO {

    private Integer noteAttachmentId;
    private Long noteNo;
    private String noteFileName;
    private String noteFileUrl;
    private BigInteger noteFileSize;
    private String noteFileType;
    private String noteFileDeleteYn;
    private LocalDateTime noteFileDeleteDate;


}
