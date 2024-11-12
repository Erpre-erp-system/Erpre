package com.project.erpre.model.dto;

import com.project.erpre.model.entity.Dispatch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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
    private Integer warehouseNo; // 출고 창고 번호
    private Integer orderDNo; // 출고 상품 상세
    private Integer customerNo; // 출고 납품 고객사

    // 추가 필드
    private String customerName; // 고객사 이름
    private String customerAddr; // 납품지 주소
    private String warehouseName; // 창고명
    private String orderHStatus; // 주문상태
    private String productNm; // 상품명
    private BigDecimal orderDPrice; // 출고 단가
    private int orderDQty; // 수량
    private BigDecimal orderDTotalPrice; // 총 금액
    private Timestamp orderDDeliveryRequestDate; // 납품 요청일
    private List<Integer> dispatchNos; // 선택된 출고 번호 목록


}
