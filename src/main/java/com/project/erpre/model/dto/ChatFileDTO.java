package com.project.erpre.model.dto;

import lombok.*;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;

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

    @Builder
    public ChatFileDTO(String chatFileName, String chatFileUrl, BigInteger chatFileSize, String chatFileType) {
        this.chatFileName = chatFileName;
        this.chatFileUrl = chatFileUrl;
        this.chatFileSize = chatFileSize;
        this.chatFileType = chatFileType;
    }

}
