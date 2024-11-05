package com.project.erpre.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobDTO {

    private String jobName;
    private BigDecimal gradeIncentiveRate;
}
