package com.project.erpre.model.dto;

import lombok.*;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ChatFileDTO {

    private Long chatAttachmentId;
    private Long chatMessageNo;
    private String chatFileName;
    private String chatFileUrl;
    private BigInteger chatFileSize;
    private String chatFileType;
}
