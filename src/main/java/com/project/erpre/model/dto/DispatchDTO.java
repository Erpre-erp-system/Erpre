package com.project.erpre.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DispatchDTO {

    private Integer dispatchNo; // 출고 번호
    private String dispatchStatus; // 출고 상태
    private Timestamp dispatchStartDate; // 출고 시작일
    private Timestamp dispatchEndDate; // 출고 완료일
    private String dispatchDeleteYn; // 출고 삭제 여부
    private Integer warehouseNo; // 출고 창고 이름
    private String qrCodeId; // 출고 QR 코드
    private Integer orderDNo; // 출고 상품 상세
    private Integer customerNo; // 출고 납품 고객사

    //추가
    private String customerName; // 고객사 이름
    private String productNm; // 상품명
    private Timestamp orderDDeliveryRequestDate; // 납품 요청일
    private String warehouseName; // 창고명
    private String hqName; // 출고 공급자

    //추가 - 선택된 출고 번호 목록
    private List<Integer> dispatchNos;


}
