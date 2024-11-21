package com.project.erpre.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoteReceiverDTO {

    private Long noteNo;
    private String noteReceiverId;
    private String noteReceiverReadYn;
    private LocalDateTime noteReceiverReadDate;
    private String noteReceiverDeleteYn;
    private LocalDateTime noteReceiverDeleteDate;
}
