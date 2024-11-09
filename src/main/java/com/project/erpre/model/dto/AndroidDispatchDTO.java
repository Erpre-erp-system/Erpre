package com.project.erpre.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AndroidDispatchDTO {
    private Integer dispatchNo;
    private String productNm;    // 상품명
    private Integer orderDQty;   // 수량
}
