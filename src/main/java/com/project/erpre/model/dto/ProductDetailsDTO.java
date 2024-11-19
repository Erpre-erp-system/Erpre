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
public class ProductDetailsDTO {

    private Long productDetailCd;       // 상품 상세 고유 ID(안쓸거임)
    private String productModelName;   // 모델명
    private String productManufacturer; // 제조사
    private String productSpecifications; // 상세 사양
    private String productWeight;      // 상품 무게
    private String productWarrantyPeriod; // 보증 기간
    private String productDescription; // 상품 설명

    private String productCd; //상품코드
    private String productNm; //상품명
    private BigDecimal productPrice; // 상품 가격
}