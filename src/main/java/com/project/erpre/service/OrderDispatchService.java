package com.project.erpre.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
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
import com.itextpdf.text.pdf.PdfWriter;

//excel import
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

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


    // DispatchDTO -> Dispatch 엔티티로 변환하는 메서드
    private Dispatch convertToDispatchEntity(DispatchDTO dispatchDTO) {
        Dispatch dispatch = new Dispatch();
        dispatch.setDispatchNo(dispatchDTO.getDispatchNo());
        dispatch.setDispatchStatus(dispatchDTO.getDispatchStatus());
        dispatch.setDispatchStartDate(dispatchDTO.getDispatchStartDate());
        dispatch.setDispatchEndDate(dispatchDTO.getDispatchEndDate());
        dispatch.setDispatchDeleteYn(dispatchDTO.getDispatchDeleteYn());

        // 주문 상세 (OrderDetail), 창고 (Warehouse), QR코드 정보 설정
        OrderDetail orderDetail = orderDetailRepository.findById(dispatchDTO.getOrderDNo()).orElse(null);
        Warehouse warehouse = warehouseRepository.findById(dispatchDTO.getWarehouseNo()).orElse(null);

        dispatch.setOrderDetail(orderDetail);
        dispatch.setWarehouse(warehouse);

        // 주문 정보 설정 (OrderDetail로부터 Order를 가져와 설정)
        Order order = orderDetail != null ? orderDetail.getOrder() : null;
        dispatch.setOrder(order);

        return dispatch;
    }

    // Dispatch 엔티티 -> DispatchDTO로 변환하는 메서드
    private DispatchDTO convertToDispatchDTO(Dispatch dispatch) {
        Integer warehouseNo = dispatch.getWarehouse() != null ? dispatch.getWarehouse().getWarehouseNo() : null;
        String warehouseName = dispatch.getWarehouse() != null ? dispatch.getWarehouse().getWarehouseName() : null;

        // OrderDetail 및 Order 관련 정보 추출
        OrderDetail orderDetail = dispatch.getOrderDetail();
        Order order = dispatch.getOrder(); // Dispatch에서 Order를 직접 가져옴
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
    public void createDispatchForOrder(Order order) {
        // Order를 다시 조회하여 orderDetails를 가져옴
        Order orderWithDetails = orderRepository.findById(order.getOrderNo()).orElse(null);
        if (orderWithDetails == null) {
            log.error("Order not found: " + order.getOrderNo());
            return;
        }

        // orderDetails 초기화
        Hibernate.initialize(orderWithDetails.getOrderDetails());

        log.info("Creating dispatches for order: " + orderWithDetails.getOrderNo() + ", order details size: " + orderWithDetails.getOrderDetails().size());

        if ("approved".equals(orderWithDetails.getOrderHStatus())) {
            for (OrderDetail orderDetail : orderWithDetails.getOrderDetails()) {
                log.info("Processing OrderDetail: " + orderDetail.getOrderNo());

                Dispatch dispatch = new Dispatch();
                dispatch.setOrderDetail(orderDetail);
                dispatch.setOrder(orderWithDetails);
                dispatch.setDispatchStatus("pending");
                dispatch.setDispatchDeleteYn("N");

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
                dispatch.setDispatchDeleteYn("Y"); // deleteYn 필드를 'N'에서 'Y'로 변경
                orderDispatchRepository.save(dispatch);  // 업데이트 수행
            }
        }
    }

    // 창고배정
    public void assignWarehouse(Map<String, Object> requestData) {
        // 요청 데이터에서 필요한 정보 추출
        List<Integer> dispatchNos = extractDispatchNos(requestData.get("dispatchNos"));
        String warehouseName = (String) requestData.get("warehouseName");
        String warehouseManagerName = (String) requestData.get("warehouseManagerName");

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

    // 출고 지시 후 상태 변경
    @Transactional
    public void updateDispatchStatus(Map<String, Object> requestData) {
        Integer dispatchNo = (Integer) requestData.get("dispatchNo");
        String newStatus = (String) requestData.get("newStatus");
        String qrCodeData = (String) requestData.get("qrCodeData");

        if (dispatchNo == null || newStatus == null) {
            // 필수 데이터 누락 처리
            System.out.println("dispatchNo 또는 newStatus가 제공되지 않았습니다.");
            return;
        }

        Optional<Dispatch> optionalDispatch = orderDispatchRepository.findById(dispatchNo);

        if (optionalDispatch.isPresent()) {
            Dispatch dispatch = optionalDispatch.get();
            dispatch.setDispatchStatus(newStatus);

            // 'inProgress' 상태로 변경될 경우 출고 시작일시 설정
            if ("inProgress".equals(newStatus)) {
                dispatch.setDispatchStartDate(new Timestamp(System.currentTimeMillis()));
            }

            orderDispatchRepository.save(dispatch);
            System.out.println("Dispatch 상태가 성공적으로 업데이트되었습니다. Dispatch No: " + dispatchNo);
        } else {
            // 존재하지 않는 경우 처리
            System.out.println("해당 Dispatch를 찾을 수 없습니다. Dispatch No: " + dispatchNo);
        }
    }


    // dispatchNos를 추출하고 형변환하는 유틸리티 메서드(창고배정에서 필요)
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

    //BigDecimal 처리
    private String formatCurrency(BigDecimal value) {
        return value != null ? String.format("%,.2f", value) : "-";
    }

    // 유틸리티 메서드 - 날짜 및 화폐 형식 지정
    private String formatDate(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        return date != null ? sdf.format(date) : "-";
    }

    // PDF 생성 메서드
    public byte[] generatePdf(int dispatchNo) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            Document document = new Document();
            PdfWriter.getInstance(document, byteArrayOutputStream);
            document.open();

            // dispatchNo를 사용하여 필요한 데이터 조회
            Dispatch dispatch = orderDispatchRepository.findById(dispatchNo)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dispatchNo"));

            // PDF 제목
            Paragraph title = new Paragraph("출고증", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);  // 빈 줄 추가

            // 테이블 생성 - 2열, 100% 너비로 설정
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            // 테이블에 항목과 데이터를 추가
            addTableRow(table, "고객사 이름", dispatch.getOrderDetail().getOrder().getCustomer().getCustomerName());
            addTableRow(table, "납품지 주소", dispatch.getOrderDetail().getOrder().getCustomer().getCustomerAddr());

            // 공급자 정보
            addTableRow(table, "공급자 상호", "이케아");
            addTableRow(table, "공급자 주소", "이케아");
            addTableRow(table, "공급자 대표성명", "박인욱");
            addTableRow(table, "공급자 전화번호", "02-111-5555");
            addTableRow(table, "공급자 사업자 등록번호", "123-456-7890");

            // 출하관련 정보
            addTableRow(table, "납품 요청일", formatDate(dispatch.getOrderDetail().getOrderDDeliveryRequestDate()));
            addTableRow(table, "출하창고", dispatch.getWarehouse().getWarehouseName());

            // 상품관련 정보
            addTableRow(table, "품목명", dispatch.getOrderDetail().getProduct().getProductNm());
            addTableRow(table, "수량", dispatch.getOrderDetail().getOrderDQty() + "EA");
            addTableRow(table, "출고단가", formatCurrency(dispatch.getOrderDetail().getOrderDPrice()));
            addTableRow(table, "총금액", formatCurrency(dispatch.getOrderDetail().getOrderDTotalPrice()));

            // 테이블을 문서에 추가
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return byteArrayOutputStream.toByteArray();
    }

    // 테이블에 행을 추가하는 유틸리티 메서드
    private void addTableRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "-", FontFactory.getFont(FontFactory.HELVETICA, 12)));

        // 셀 테두리 및 정렬 설정
        labelCell.setBorder(Rectangle.BOX);
        labelCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        labelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        labelCell.setPadding(8);

        valueCell.setBorder(Rectangle.BOX);
        valueCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        valueCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        valueCell.setPadding(8);

        // 테이블에 셀 추가
        table.addCell(labelCell);
        table.addCell(valueCell);
    }




    // Excel 생성 메서드
    public byte[] generateExcel(int dispatchNo) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("출고증");

            // dispatchNo를 사용하여 필요한 데이터 조회
            Dispatch dispatch = orderDispatchRepository.findById(dispatchNo)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dispatchNo"));

            // 데이터 작성
            int rowNum = 0;

            // 제목
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("출고증");

            // 고객사 정보
            Row row1 = sheet.createRow(rowNum++);
            row1.createCell(0).setCellValue("고객사 이름");
            row1.createCell(1).setCellValue(dispatch.getOrderDetail().getOrder().getCustomer().getCustomerName());

            Row row2 = sheet.createRow(rowNum++);
            row2.createCell(0).setCellValue("납품지 주소");
            row2.createCell(1).setCellValue(dispatch.getOrderDetail().getOrder().getCustomer().getCustomerAddr());

            // 공급자 정보
            Row row3 = sheet.createRow(rowNum++);
            row3.createCell(0).setCellValue("공급자 상호");
            row3.createCell(1).setCellValue("이케아");

            Row row4 = sheet.createRow(rowNum++);
            row4.createCell(0).setCellValue("공급자 주소");
            row4.createCell(1).setCellValue("이케아");

            Row row5 = sheet.createRow(rowNum++);
            row5.createCell(0).setCellValue("공급자 대표성명");
            row5.createCell(1).setCellValue("박인욱");

            Row row6 = sheet.createRow(rowNum++);
            row6.createCell(0).setCellValue("공급자 전화번호");
            row6.createCell(1).setCellValue("02-111-5555");

            Row row7 = sheet.createRow(rowNum++);
            row7.createCell(0).setCellValue("공급자 사업자 등록번호");
            row7.createCell(1).setCellValue("123-456-7890");

            // 출하관련 정보
            Row row8 = sheet.createRow(rowNum++);
            row8.createCell(0).setCellValue("납품 요청일");
            row8.createCell(1).setCellValue(formatDate(dispatch.getOrderDetail().getOrderDDeliveryRequestDate()));

            Row row9 = sheet.createRow(rowNum++);
            row9.createCell(0).setCellValue("출하창고");
            row9.createCell(1).setCellValue(dispatch.getWarehouse().getWarehouseName());

            // 상품관련 정보
            Row row10 = sheet.createRow(rowNum++);
            row10.createCell(0).setCellValue("품목명");
            row10.createCell(1).setCellValue(dispatch.getOrderDetail().getProduct().getProductNm());

            Row row11 = sheet.createRow(rowNum++);
            row11.createCell(0).setCellValue("수량");
            row11.createCell(1).setCellValue(dispatch.getOrderDetail().getOrderDQty() + "EA");

            Row row12 = sheet.createRow(rowNum++);
            row12.createCell(0).setCellValue("출고단가");
            Cell priceCell = row12.createCell(1);
            priceCell.setCellValue(dispatch.getOrderDetail().getOrderDPrice().doubleValue()); // 숫자로 셀에 추가

            Row row13 = sheet.createRow(rowNum++);
            row13.createCell(0).setCellValue("총금액");
            Cell totalCell = row13.createCell(1);
            totalCell.setCellValue(dispatch.getOrderDetail().getOrderDTotalPrice().doubleValue()); // 숫자로 셀에 추가

            // 숫자 형식 지정
            CellStyle currencyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            currencyStyle.setDataFormat(format.getFormat("#,##0.00"));
            priceCell.setCellStyle(currencyStyle);
            totalCell.setCellStyle(currencyStyle);

            workbook.write(byteArrayOutputStream);
            workbook.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return byteArrayOutputStream.toByteArray();
    }



}
