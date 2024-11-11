package com.project.erpre.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AndroidDispatchDTO {
    private Integer dispatchNo;   // 출고 번호
    private String productNm;    // 상품명
    private Integer orderDQty;   // 수량
    private String customerName; // 고객사명
}
