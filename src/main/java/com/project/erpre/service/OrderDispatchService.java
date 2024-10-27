package com.project.erpre.service;

import com.project.erpre.model.dto.DispatchDTO;
import com.project.erpre.model.entity.*;
import com.project.erpre.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.*;

@Service
public class OrderDispatchService {

    @Autowired
    private OrderDispatchRepository orderDispatchRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private QrCodeRepository qrCodeRepository;

    //DispatchDTO -> Dispatch 엔티티로 변환하는 메서드
    private Dispatch convertToDispatchEntity(DispatchDTO dispatchDTO) {
        Dispatch dispatch = new Dispatch();
        dispatch.setDispatchNo(dispatchDTO.getDispatchNo());
        dispatch.setDispatchStatus(dispatchDTO.getDispatchStatus());
        dispatch.setDispatchStartDate(dispatchDTO.getDispatchStartDate());
        dispatch.setDispatchEndDate(dispatchDTO.getDispatchEndDate());
        //dispatch.setDispatchQrCode(dispatchDTO.getDispatchQrCode());
        dispatch.setDispatchDeleteYn(dispatchDTO.getDispatchDeleteYn());

        // 고객사, 주문, 창고 정보는 엔티티로 변환해서 추가로 설정 필요
        OrderDetail orderDetail = orderDetailRepository.findById(dispatchDTO.getOrderDNo()).orElse(null);
        Warehouse warehouse = warehouseRepository.findById(dispatchDTO.getWarehouseNo()).orElse(null);

        dispatch.setOrderDetail(orderDetail);
        dispatch.setWarehouse(warehouse);

        return dispatch;
    }

    // Dispatch 엔티티를 DispatchDTO로 변환하는 메서드
    private DispatchDTO convertToDispatchDTO(Dispatch dispatch) {
        Integer warehouseNo = dispatch.getWarehouse() != null ? dispatch.getWarehouse().getWarehouseNo() : null;
        String warehouseName = dispatch.getWarehouse() != null ? dispatch.getWarehouse().getWarehouseName() : null;

        OrderDetail orderDetail = dispatch.getOrderDetail();
        Order order = orderDetail != null ? orderDetail.getOrder() : null;
        Customer customer = order != null ? order.getCustomer() : null;
        Product product = orderDetail != null ? orderDetail.getProduct() : null;

        String customerName = customer != null ? customer.getCustomerName() : null;
        String productNm = product != null ? product.getProductNm() : null;
        Timestamp orderDDeliveryRequestDate = orderDetail != null ? orderDetail.getOrderDDeliveryRequestDate() : null;

        return DispatchDTO.builder()
                .dispatchNo(dispatch.getDispatchNo())
                .dispatchStatus(dispatch.getDispatchStatus())
                .dispatchStartDate(dispatch.getDispatchStartDate())
                .dispatchEndDate(dispatch.getDispatchEndDate())
                .dispatchDeleteYn(dispatch.getDispatchDeleteYn())
                .warehouseNo(warehouseNo)
                .warehouseName(warehouseName)
                //.dispatchQrCode(dispatch.getDispatchQrCode())
                .customerName(customerName)
                .productNm(productNm)
                .orderDDeliveryRequestDate(orderDDeliveryRequestDate)
                .build();
    }


    // 주문 상태가 '결제완료'만 페이징하여 pending  목록 보여주기
    public Page<DispatchDTO> getPagePending(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Dispatch> dispatchPage = orderDispatchRepository.findByOrderDetail_Order_OrderHStatus("approved", pageable);
        return dispatchPage.map(this::convertToDispatchDTO);
    }

    //페이징해서 in progress 목록 보여주기
    public Page<DispatchDTO> getPageInProgress(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Dispatch> dispatchPage = orderDispatchRepository.findByDispatchStatus("in_progress", pageable);
        return dispatchPage.map(this::convertToDispatchDTO);
    }

    // 페이징해서 complete 목록 보여주기
    public Page<DispatchDTO> getPageComplete(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Dispatch> dispatchPage = orderDispatchRepository.findByDispatchStatus("complete", pageable);
        return dispatchPage.map(this::convertToDispatchDTO);
    }

    //목록화면에서 체크된 직원 logical 삭제(delete_yn만 바꾸기)
    public void deleteDispatches(List<Integer> nos) {
        for (Integer no : nos) {
            Dispatch dispatch = orderDispatchRepository.findById(no).orElse(null);
            if (dispatch != null) {
                dispatch.setDispatchDeleteYn("Y");
//                employee.setEmployeeDeleteDate(new Timestamp(System.currentTimeMillis()));
                orderDispatchRepository.save(dispatch);  // update로 N -> Y로 바꿈
            }
        }
    }

    //출고지시
    public void releaseDispatches(Map<String, Object> requestData) {
        // dispatchNos 추출
        List<Integer> dispatchNos = extractDispatchNos(requestData.get("dispatchNos"));

        if (dispatchNos == null || dispatchNos.isEmpty()) {
            throw new IllegalArgumentException("dispatchNos는 필수입니다.");
        }

        // 기타 필요한 데이터 추출
        String warehouseName = (String) requestData.get("warehouseName");
        String qrCodeData = (String) requestData.get("qrCodeData");

        // 각 dispatchNo에 대해 처리
        for (Integer dispatchNo : dispatchNos) {
            Optional<Dispatch> dispatchOpt = orderDispatchRepository.findById(dispatchNo);
            if (dispatchOpt.isPresent()) {
                Dispatch dispatch = dispatchOpt.get();

                // 출고 상태 업데이트
                dispatch.setDispatchStatus("in_progress");
                dispatch.setDispatchStartDate(new Timestamp(System.currentTimeMillis()));

                // 창고 정보 업데이트
                if (warehouseName != null) {
                    Warehouse warehouse = warehouseRepository.findByWarehouseName(warehouseName);
                    if (warehouse != null) {
                        dispatch.setWarehouse(warehouse);
                    }
                }

                // QR 코드 생성 및 저장
                if (qrCodeData != null) {
                    QrCode qrCode = new QrCode();
                    qrCode.setQrCodeId(UUID.randomUUID());
                    qrCode.setQrCodeData(qrCodeData);
                    qrCode.setQrCodeStatus("active");
                    qrCode.setQrCodeInsertDate(new Timestamp(System.currentTimeMillis()));
                    qrCode.setQrCodeUsageCount(0);
                    qrCode.setQrCodeDeleteYn("N");

                    qrCodeRepository.save(qrCode);
                    dispatch.setQrCode(qrCode);
                }

                // 출고 정보 저장
                orderDispatchRepository.save(dispatch);
            } else {
                // 해당 dispatchNo가 존재하지 않을 경우 처리 (필요에 따라 예외 처리 또는 로그 작성)
                // 예: throw new ResourceNotFoundException("Dispatch not found with id " + dispatchNo);
            }
        }
    }

    // dispatchNos를 추출하고 형변환하는 유틸리티 메서드
    /* Map에서 값을 추출할 때는 타입 캐스팅에 주의해야함
       dispatchNos의 경우 JSON 배열로 전달되기 때문에 List<Integer>로 바로 캐스팅되지 않을 수 있음
       이를 해결하기 위해 extractDispatchNos 메서드를 사용하여 dispatchNos를 안전하게 추출 */
    private List<Integer> extractDispatchNos(Object dispatchNosObj) {
        List<Integer> dispatchNos = new ArrayList<>();

        if (dispatchNosObj instanceof List<?>) {
            for (Object obj : (List<?>) dispatchNosObj) {
                if (obj instanceof Integer) {
                    dispatchNos.add((Integer) obj);
                } else if (obj instanceof Number) {
                    dispatchNos.add(((Number) obj).intValue());
                }
            }
        }

        return dispatchNos;
    }


}
