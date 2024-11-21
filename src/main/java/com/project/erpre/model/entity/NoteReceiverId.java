package com.project.erpre.model.entity;

import lombok.*;

import javax.persistence.Embeddable;
import java.io.Serializable;

// 복합키 정의
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class NoteReceiverId implements Serializable {

    private Long noteNo;
    private String noteReceiverId;

}
