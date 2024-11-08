package com.project.erpre.service;

import com.project.erpre.model.dto.DispatchDTO;
import com.project.erpre.model.entity.*;
import com.project.erpre.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

//pdf import
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

//excel import
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.*;

@Slf4j
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

    // DispatchDTO -> Dispatch 엔티티로 변환하는 메서드
    private Dispatch convertToDispatchEntity(DispatchDTO dispatchDTO) {
        Dispatch dispatch = new Dispatch();
        dispatch.setDispatchNo(dispatchDTO.getDispatchNo());
        dispatch.setDispatchStatus(dispatchDTO.getDispatchStatus());
        dispatch.setDispatchStartDate(dispatchDTO.getDispatchStartDate());
        dispatch.setDispatchEndDate(dispatchDTO.getDispatchEndDate());
        dispatch.setDispatchDeleteYn(dispatchDTO.getDispatchDeleteYn());

        // 주문 상세 (OrderDetail)과 창고 (Warehouse) 정보 설정
        OrderDetail orderDetail = orderDetailRepository.findById(dispatchDTO.getOrderDNo()).orElse(null);
        Warehouse warehouse = warehouseRepository.findById(dispatchDTO.getWarehouseNo()).orElse(null);
        QrCode qrCode = qrCodeRepository.findById(UUID.fromString(dispatchDTO.getQrCodeId())).orElse(null);

        dispatch.setOrderDetail(orderDetail);
        dispatch.setWarehouse(warehouse);
        dispatch.setQrCode(qrCode);

        return dispatch;
    }

    // Dispatch 엔티티 -> DispatchDTO로 변환하는 메서드
    private DispatchDTO convertToDispatchDTO(Dispatch dispatch) {
        Integer warehouseNo = dispatch.getWarehouse() != null ? dispatch.getWarehouse().getWarehouseNo() : null;
        String warehouseName = dispatch.getWarehouse() != null ? dispatch.getWarehouse().getWarehouseName() : null;
        String qrCodeId = dispatch.getQrCode() != null ? dispatch.getQrCode().getQrCodeId().toString() : null;

        // OrderDetail과 관련된 정보 추출
        OrderDetail orderDetail = dispatch.getOrderDetail();
        Order order = orderDetail != null ? orderDetail.getOrder() : null;
        Customer customer = order != null ? order.getCustomer() : null;
        Product product = orderDetail != null ? orderDetail.getProduct() : null;

        String customerName = customer != null ? customer.getCustomerName() : null;
        String customerAddr = customer != null ? customer.getCustomerAddr() : null;
        String productNm = product != null ? product.getProductNm() : null;
        Timestamp orderDDeliveryRequestDate = orderDetail != null ? orderDetail.getOrderDDeliveryRequestDate() : null;

        BigDecimal orderDPrice = orderDetail != null ? orderDetail.getOrderDPrice() : BigDecimal.ZERO;
        int orderDQty = orderDetail != null ? orderDetail.getOrderDQty() : 0;
        BigDecimal orderDTotalPrice = orderDetail != null ? orderDetail.getOrderDTotalPrice() : BigDecimal.ZERO;

        String orderHStatus = order != null ? order.getOrderHStatus() : null;

        // DispatchDTO 생성
        return DispatchDTO.builder()
                .dispatchNo(dispatch.getDispatchNo())
                .dispatchStatus(dispatch.getDispatchStatus())
                .dispatchStartDate(dispatch.getDispatchStartDate())
                .dispatchEndDate(dispatch.getDispatchEndDate())
                .dispatchDeleteYn(dispatch.getDispatchDeleteYn())
                .warehouseNo(warehouseNo)
                .warehouseName(warehouseName)
                .qrCodeId(qrCodeId)
                .orderDNo(orderDetail != null ? orderDetail.getOrderNo() : null)
                .customerNo(customer != null ? customer.getCustomerNo() : null)
                .customerName(customerName)
                .customerAddr(customerAddr)
                .productNm(productNm)
                .orderHStatus(orderHStatus)
                .orderDPrice(orderDPrice)
                .orderDQty(orderDQty)
                .orderDTotalPrice(orderDTotalPrice)
                .orderDDeliveryRequestDate(orderDDeliveryRequestDate)
                .build();
    }


    // Dispatch 레코드 생성 메서드 - orderHStatus가 'approved'일 때만 dispatchStatus("pending") 설정
    @Transactional
            //(propagation = Propagation.REQUIRES_NEW) // 기존에 실행 중인 트랜잭션이 있어도 새로운 트랜잭션을 시작
    public void createDispatchForOrder(Order order) {

        // OrderDetails 초기화
        Hibernate.initialize(order.getOrderDetails());

        if ("approved".equals(order.getOrderHStatus())) { // orderHStatus가 'approved'인지 확인
            for (OrderDetail orderDetail : order.getOrderDetails()) {
                log.info("Dispatch 생성 중, OrderDetail ID: " + orderDetail.getOrderNo());

                Dispatch dispatch = new Dispatch();
                dispatch.setOrderDetail(orderDetail);
                dispatch.setDispatchStatus("pending"); // orderHStatus가 'approved'일 때만 'pending'으로 설정
                dispatch.setDispatchDeleteYn("N");

                // warehouse 설정 (예시로 기본 창고를 설정하거나 로직에 맞게 설정)
//                Warehouse defaultWarehouse = warehouseRepository.findDefaultWarehouse();
//                dispatch.setWarehouse(defaultWarehouse);

                // qrCode 설정 (새로운 QR 코드를 생성하거나 로직에 맞게 설정)
//                QrCode newQrCode = qrCodeService.generateQrCode(dispatch);
//                dispatch.setQrCode(newQrCode);

                // Dispatch 저장
                orderDispatchRepository.save(dispatch);
            }

        }
    }


    //주문 상태가 '결제완료'만 페이징하여 pending 목록 보여주기
    public Page<DispatchDTO> getPagePending(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Dispatch> dispatchPage = orderDispatchRepository.findByDispatchStatus("pending", pageable);
        return dispatchPage.map(this::convertToDispatchDTO);
    }


    //페이징해서 in progress 목록 보여주기
    public Page<DispatchDTO> getPageInProgress(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Dispatch> dispatchPage = orderDispatchRepository.findByDispatchStatus("inProgress", pageable);
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


    // 창고배정
    public void assignWarehouse(Map<String, Object> requestData) {
        // 요청 데이터에서 필요한 정보 추출
        List<Integer> dispatchNos = extractDispatchNos(requestData.get("dispatchNos"));
        String warehouseName = (String) requestData.get("warehouseName");
        String warehouseManagerName = (String) requestData.get("warehouseManagerName");

        // 입력값 검증
//        if (dispatchNos == null || dispatchNos.isEmpty()) {
//            throw new IllegalArgumentException("dispatchNos는 필수입니다.");
//        }
//        if (warehouseName == null || warehouseName.trim().isEmpty()) {
//            throw new IllegalArgumentException("warehouseName은 필수입니다.");
//        }

        // 창고 정보 조회
        Warehouse warehouse = warehouseRepository.findByWarehouseName(warehouseName);
        if (warehouse == null) {
            throw new IllegalArgumentException("해당 창고를 찾을 수 없습니다: " + warehouseName);
        }

        // 필요 시 창고 담당자 업데이트
        if (warehouseManagerName != null && !warehouseManagerName.trim().isEmpty()) {
            warehouse.setWarehouseManagerName(warehouseManagerName);
            warehouseRepository.save(warehouse);
        }

        // 각 dispatchNo에 대해 창고 정보 업데이트
        for (Integer dispatchNo : dispatchNos) {
            Optional<Dispatch> dispatchOpt = orderDispatchRepository.findById(dispatchNo);
            if (dispatchOpt.isPresent()) {
                Dispatch dispatch = dispatchOpt.get();
                dispatch.setWarehouse(warehouse);
                orderDispatchRepository.save(dispatch);
            } else {
                // 존재하지 않는 dispatchNo에 대한 처리
                // 필요에 따라 로그 작성 또는 예외 처리
            }
        }
    }


    // 출고지시
//    public void releaseDispatches(Map<String, Object> requestData) {
//        // dispatchNos 추출
//        List<Integer> dispatchNos = extractDispatchNos(requestData.get("dispatchNos"));
//
//        if (dispatchNos == null || dispatchNos.isEmpty()) {
//            throw new IllegalArgumentException("dispatchNos는 필수입니다.");
//        }
//
//        // 기타 필요한 데이터 추출
//        String warehouseName = (String) requestData.get("warehouseName");
//        String qrCodeData = (String) requestData.get("qrCodeData");
//
//        // 각 dispatchNo에 대해 처리
//        for (Integer dispatchNo : dispatchNos) {
//            Optional<Dispatch> dispatchOpt = orderDispatchRepository.findById(dispatchNo);
//            if (dispatchOpt.isPresent()) {
//                Dispatch dispatch = dispatchOpt.get();
//
//                // 출고 상태 업데이트
//                dispatch.setDispatchStatus("inProgress");
//                dispatch.setDispatchStartDate(new Timestamp(System.currentTimeMillis()));
//
//                // 창고 정보 업데이트
//                if (warehouseName != null) {
//                    Warehouse warehouse = warehouseRepository.findByWarehouseName(warehouseName);
//                    if (warehouse != null) {
//                        dispatch.setWarehouse(warehouse);
//                    }
//                }
//
//                // QR 코드 생성 및 저장
//                if (qrCodeData != null) {
//                    QrCode qrCode = new QrCode();
//                    qrCode.setQrCodeId(UUID.randomUUID());
//                    qrCode.setQrCodeData(qrCodeData);
//                    qrCode.setQrCodeStatus("active");
//                    qrCode.setQrCodeInsertDate(new Timestamp(System.currentTimeMillis()));
//                    qrCode.setQrCodeUsageCount(0);
//                    qrCode.setQrCodeDeleteYn("N");
//
//                    qrCodeRepository.save(qrCode);
//                    dispatch.setQrCode(qrCode);
//                }
//
//                // 출고 정보 저장
//                orderDispatchRepository.save(dispatch);
//            } else {
//                // 해당 dispatchNo가 존재하지 않을 경우 처리 (필요에 따라 예외 처리 또는 로그 작성)
//                // 예: throw new ResourceNotFoundException("Dispatch not found with id " + dispatchNo);
//            }
//        }
//    }

        // 출고 지시 후 상태 변경 및 QR 코드 생성
        public void updateDispatchStatus(Map<String, Object> requestData) {
            Integer dispatchNo = (Integer) requestData.get("dispatchNo");
            String newStatus = (String) requestData.get("newStatus");
            String qrCodeData = (String) requestData.get("qrCodeData");

            Optional<Dispatch> optionalDispatch = orderDispatchRepository.findById(dispatchNo);

            if (optionalDispatch.isPresent()) {
                Dispatch dispatch = optionalDispatch.get();
                dispatch.setDispatchStatus(newStatus);

                // 'inProgress' 상태로 변경될 경우 출고 시작일시 설정
                if ("inProgress".equals(newStatus)) {
                    dispatch.setDispatchStartDate(new Timestamp(System.currentTimeMillis()));
                }

                // QR 코드 데이터가 있는 경우 QR 코드 생성 및 저장
                if (qrCodeData != null) {
                    QrCode qrCode = new QrCode();
                    qrCode.setQrCodeId(UUID.fromString(UUID.randomUUID().toString())); // String 타입으로 가정
                    qrCode.setQrCodeData(qrCodeData);
                    qrCode.setQrCodeStatus("active");
                    qrCode.setQrCodeInsertDate(new Timestamp(System.currentTimeMillis()));
                    qrCode.setQrCodeUsageCount(0);
                    qrCode.setQrCodeDeleteYn("N");

                    qrCodeRepository.save(qrCode);
                    dispatch.setQrCode(qrCode);
                }

                orderDispatchRepository.save(dispatch);
            } else {
                // 존재하지 않는 경우: 로그 출력
                System.out.println("Dispatch not found with id: " + dispatchNo);
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

    //pdf생성
    public byte[] generatePdf(int dispatchNo) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            Document document = new Document();
            PdfWriter.getInstance(document, byteArrayOutputStream);
            document.open();

            // dispatchNo를 사용하여 필요한 데이터 조회
            Dispatch dispatch = orderDispatchRepository.findById(dispatchNo)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dispatchNo"));

            // PDF 내용 작성
            document.add(new Paragraph("출고증"));
            document.add(new Paragraph("고객사 이름: " + dispatch.getOrderDetail().getOrder().getCustomer().getCustomerName()));
            document.add(new Paragraph("납품지 주소: " + dispatch.getOrderDetail().getOrder().getCustomer().getCustomerAddr()));
            document.add(new Paragraph("품목명: " + dispatch.getOrderDetail().getProduct().getProductNm()));
            document.add(new Paragraph("수량: " + dispatch.getOrderDetail().getOrderDQty()));
            // ... 필요한 내용 추가 ...

            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return byteArrayOutputStream.toByteArray();
    }

    //excel 생성
    public byte[] generateExcel(int dispatchNo) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("출고증");

            // dispatchNo를 사용하여 필요한 데이터 조회
            Dispatch dispatch = orderDispatchRepository.findById(dispatchNo)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dispatchNo"));

            // 데이터 작성
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("항목");
            headerRow.createCell(1).setCellValue("내용");

            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("고객사 이름");
            row1.createCell(1).setCellValue(dispatch.getOrderDetail().getOrder().getCustomer().getCustomerName());

            Row row2 = sheet.createRow(2);
            row2.createCell(0).setCellValue("납품지 주소");
            row2.createCell(1).setCellValue(dispatch.getOrderDetail().getOrder().getCustomer().getCustomerAddr());

            Row row3 = sheet.createRow(3);
            row3.createCell(0).setCellValue("품목명");
            row3.createCell(1).setCellValue(dispatch.getOrderDetail().getProduct().getProductNm());
            // ... 필요한 내용 추가 ...

            workbook.write(byteArrayOutputStream);
            workbook.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return byteArrayOutputStream.toByteArray();
    }

}
