package com.project.erpre.service;

import com.project.erpre.model.dto.DispatchDTO;
import com.project.erpre.model.entity.*;
import com.project.erpre.repository.*;
import lombok.extern.slf4j.Slf4j;

import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.RegionUtil;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

//pdf import
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

//excel import
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.File;
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

        // 주문 상세 (OrderDetail), 창고 (Warehouse)
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
        Order order = dispatch.getOrder();
        Customer customer = order != null ? order.getCustomer() : null;
        Product product = orderDetail != null ? orderDetail.getProduct() : null;

        // 상품 상세 정보 추출
        ProductDetails productDetails = product != null ? product.getProductDetails() : null;

        // 각 필드 추출
        String customerName = customer != null ? customer.getCustomerName() : null;
        String customerAddr = customer != null ? customer.getCustomerAddr() : null;
        String productNm = product != null ? product.getProductNm() : null;
        String productCd = product != null ? product.getProductCd() : null;
        Long productDetailCd = productDetails != null ? productDetails.getProductDetailCd() : null;
        String productModelName = productDetails != null ? productDetails.getProductModelName() : null;
        String productManufacturer = productDetails != null ? productDetails.getProductManufacturer() : null;
        String productSpecifications = productDetails != null ? productDetails.getProductSpecifications() : null;
        String productWeight = productDetails != null ? productDetails.getProductWeight() : null;
        String productWarrantyPeriod = productDetails != null ? productDetails.getProductWarrantyPeriod() : null;
        String productDescription = productDetails != null ? productDetails.getProductDescription() : null;
        Timestamp orderDDeliveryRequestDate = orderDetail != null ? orderDetail.getOrderDDeliveryRequestDate() : null;

        BigDecimal orderDPrice = orderDetail != null ? orderDetail.getOrderDPrice() : BigDecimal.ZERO;
        int orderDQty = orderDetail != null ? orderDetail.getOrderDQty() : 0;
        BigDecimal orderDTotalPrice = orderDetail != null ? orderDetail.getOrderDTotalPrice() : BigDecimal.ZERO;

        String orderHStatus = order != null ? order.getOrderHStatus() : null;

        // 담당자 이름 추출
        String employeeName = (order != null && order.getEmployee() != null) ? order.getEmployee().getEmployeeName() : null;

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
                .productCd(productCd)
                .productDetailCd(productDetailCd)
                .productModelName(productModelName)
                .productManufacturer(productManufacturer)
                .productSpecifications(productSpecifications)
                .productWeight(productWeight)
                .productWarrantyPeriod(productWarrantyPeriod)
                .productDescription(productDescription)
                .orderHStatus(orderHStatus)
                .orderDPrice(orderDPrice)
                .orderDQty(orderDQty)
                .orderDTotalPrice(orderDTotalPrice)
                .orderDDeliveryRequestDate(orderDDeliveryRequestDate)
                .employeeName(employeeName)
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
        PDDocument document = new PDDocument();

        try {
            Dispatch dispatch = orderDispatchRepository.findById(dispatchNo)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dispatchNo"));

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            String fontPath = "src/main/resources/fonts/malgun.ttf";
            PDType0Font font = PDType0Font.load(document, new File(fontPath));

            PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.OVERWRITE, true);

            float margin = 50;
            float tableWidth = 500;
            float centerX = (page.getMediaBox().getWidth() - tableWidth) / 2;
            float yStart = page.getMediaBox().getHeight() - margin;
            float yPosition = yStart;

            // Title
            contentStream.beginText();
            contentStream.setFont(font, 25);
            float titleWidth = font.getStringWidth("출고증") / 1000 * 25;
            contentStream.newLineAtOffset((page.getMediaBox().getWidth() - titleWidth) / 2, yPosition);
            contentStream.showText("출고증");
            contentStream.endText();

            // Title underline
            contentStream.moveTo((page.getMediaBox().getWidth() - titleWidth) / 2, yPosition - 5);
            contentStream.lineTo((page.getMediaBox().getWidth() + titleWidth) / 2, yPosition - 5);
            contentStream.stroke();

            yPosition -= 30;

            // Table data
            String[][] tableData = {
                    {"고객사 이름", dispatch.getOrderDetail().getOrder().getCustomer().getCustomerName()},
                    {"납품지 주소", dispatch.getOrderDetail().getOrder().getCustomer().getCustomerAddr()},
                    {"공급자 상호", "이케아코리아 유한회사"},
                    {"공급자 주소", "경기도 광명시 일직로 17, 1층 (일직동) 이케아 광명점"},
                    {"공급자 대표성명", "이사벨 푸치(Isabel Puig)"},
                    {"공급자 전화번호", "1670-4532"},
                    {"공급자 사업자 등록번호", "106-86-82871"},
                    {"납품 요청일", formatDate(dispatch.getOrderDetail().getOrderDDeliveryRequestDate())},
                    {"출하창고", dispatch.getWarehouse().getWarehouseName()},
                    {"품목명", dispatch.getOrderDetail().getProduct().getProductNm()},
                    {"수량", dispatch.getOrderDetail().getOrderDQty() + "EA"},
                    {"출고단가", formatCurrency(dispatch.getOrderDetail().getOrderDPrice())},
                    {"총금액", formatCurrency(dispatch.getOrderDetail().getOrderDTotalPrice())}
            };

            float[] colWidths = {200, 300};
            float cellHeight = 25;
            float cellMargin = 5;

            for (int i = 0; i < tableData.length; i++) {
                String[] row = tableData[i];
                boolean isFirstRow = (i == 0);
                boolean isLastRow = (i == tableData.length - 1);

                addTableRow(contentStream, font, row[0], row[1] != null ? row[1] : "-", centerX, yPosition, colWidths, cellHeight, cellMargin, isFirstRow, isLastRow);
                yPosition -= cellHeight;

                if (yPosition < margin) {
                    contentStream.close();
                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    contentStream = new PDPageContentStream(document, page);
                    yPosition = page.getMediaBox().getHeight() - margin;
                }
            }

            contentStream.close();
            document.save(byteArrayOutputStream);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                document.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return byteArrayOutputStream.toByteArray();
    }

    // 테이블 행 추가 메서드
    private void addTableRow(PDPageContentStream contentStream, PDType0Font font, String label, String value,
                             float x, float y, float[] colWidths, float rowHeight, float cellMargin, boolean isFirstRow, boolean isLastRow) throws IOException {

        // 바깥 테두리를 위한 두꺼운 선 두께
        float thickLineWidth = 1.5f;
        float normalLineWidth = 1f;

        // 왼쪽 셀 (라벨 셀)
        contentStream.setLineWidth(isFirstRow ? thickLineWidth : normalLineWidth); // 첫 행 위쪽 테두리 두껍게
        contentStream.moveTo(x, y);
        contentStream.lineTo(x + colWidths[0], y);
        contentStream.stroke();

        contentStream.setLineWidth(isLastRow ? thickLineWidth : normalLineWidth); // 마지막 행 아래쪽 테두리 두껍게
        contentStream.moveTo(x, y - rowHeight);
        contentStream.lineTo(x + colWidths[0], y - rowHeight);
        contentStream.stroke();

        contentStream.setLineWidth(thickLineWidth); // 왼쪽 테두리 두껍게
        contentStream.moveTo(x, y);
        contentStream.lineTo(x, y - rowHeight);
        contentStream.stroke();

        contentStream.setLineWidth(normalLineWidth); // 오른쪽 테두리는 기본 두께로
        contentStream.addRect(x, y - rowHeight, colWidths[0], rowHeight);
        contentStream.stroke();

        // 라벨 텍스트
        contentStream.beginText();
        contentStream.setFont(font, 12);
        contentStream.newLineAtOffset(x + cellMargin, y - rowHeight / 2 - 6);
        contentStream.showText(label);
        contentStream.endText();

        // 오른쪽 셀 (값 셀)
        contentStream.setLineWidth(isFirstRow ? thickLineWidth : normalLineWidth); // 첫 행 위쪽 테두리 두껍게
        contentStream.moveTo(x + colWidths[0], y);
        contentStream.lineTo(x + colWidths[0] + colWidths[1], y);
        contentStream.stroke();

        contentStream.setLineWidth(isLastRow ? thickLineWidth : normalLineWidth); // 마지막 행 아래쪽 테두리 두껍게
        contentStream.moveTo(x + colWidths[0], y - rowHeight);
        contentStream.lineTo(x + colWidths[0] + colWidths[1], y - rowHeight);
        contentStream.stroke();

        contentStream.setLineWidth(normalLineWidth); // 왼쪽 테두리는 기본 두께로
        contentStream.addRect(x + colWidths[0], y - rowHeight, colWidths[1], rowHeight);
        contentStream.stroke();

        contentStream.setLineWidth(thickLineWidth); // 오른쪽 테두리 두껍게
        contentStream.moveTo(x + colWidths[0] + colWidths[1], y);
        contentStream.lineTo(x + colWidths[0] + colWidths[1], y - rowHeight);
        contentStream.stroke();

        // 값 텍스트 (오른쪽 정렬)
        contentStream.beginText();
        contentStream.setFont(font, 12);
        float textWidth = font.getStringWidth(value) / 1000 * 12;
        contentStream.newLineAtOffset(x + colWidths[0] + colWidths[1] - textWidth - cellMargin, y - rowHeight / 2 - 6);
        contentStream.showText(value);
        contentStream.endText();
    }

    // Excel 생성 메서드
    public byte[] generateExcel(int dispatchNo) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("출고증");

            Dispatch dispatch = orderDispatchRepository.findById(dispatchNo)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dispatchNo"));

            int rowNum = 1;

            // 제목 스타일 설정
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setBold(true);
            titleFont.setUnderline(Font.U_SINGLE);
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            Row titleRow = sheet.createRow(rowNum++);
            titleRow.setHeightInPoints(30);
            Cell titleCell = titleRow.createCell(1);
            titleCell.setCellValue("출고증");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 1, 2));

            CellStyle labelStyle = workbook.createCellStyle();
            labelStyle.setAlignment(HorizontalAlignment.LEFT);
            labelStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            labelStyle.setBorderTop(BorderStyle.THIN);
            labelStyle.setBorderBottom(BorderStyle.THIN);
            labelStyle.setBorderLeft(BorderStyle.THIN);
            labelStyle.setBorderRight(BorderStyle.THIN);

            CellStyle valueStyle = workbook.createCellStyle();
            valueStyle.setAlignment(HorizontalAlignment.RIGHT);
            valueStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            valueStyle.setBorderTop(BorderStyle.THIN);
            valueStyle.setBorderBottom(BorderStyle.THIN);
            valueStyle.setBorderLeft(BorderStyle.THIN);
            valueStyle.setBorderRight(BorderStyle.THIN);

            CellStyle currencyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            currencyStyle.setDataFormat(format.getFormat("#,##0.00"));
            currencyStyle.setAlignment(HorizontalAlignment.RIGHT);
            currencyStyle.setBorderTop(BorderStyle.THIN);
            currencyStyle.setBorderBottom(BorderStyle.THIN);
            currencyStyle.setBorderLeft(BorderStyle.THIN);
            currencyStyle.setBorderRight(BorderStyle.THIN);

            String[][] data = {
                    {"고객사 이름", dispatch.getOrderDetail().getOrder().getCustomer().getCustomerName()},
                    {"납품지 주소", dispatch.getOrderDetail().getOrder().getCustomer().getCustomerAddr()},
                    {"공급자 상호", "이케아코리아 유한회사"},
                    {"공급자 주소", "경기도 광명시 일직로 17, 1층 (일직동) 이케아 광명점"},
                    {"공급자 대표성명", "이사벨 푸치(Isabel Puig)"},
                    {"공급자 전화번호", "1670-4532"},
                    {"공급자 사업자 등록번호", "106-86-82871"},
                    {"납품 요청일", formatDate(dispatch.getOrderDetail().getOrderDDeliveryRequestDate())},
                    {"출하창고", dispatch.getWarehouse().getWarehouseName()},
                    {"품목명", dispatch.getOrderDetail().getProduct().getProductNm()},
                    {"수량", dispatch.getOrderDetail().getOrderDQty() + "EA"},
            };

            for (String[] item : data) {
                Row row = sheet.createRow(rowNum++);
                Cell labelCell = row.createCell(1);
                Cell valueCell = row.createCell(2);
                labelCell.setCellValue(item[0]);
                valueCell.setCellValue(item[1]);
                labelCell.setCellStyle(labelStyle);
                valueCell.setCellStyle(valueStyle);
            }

            Row row12 = sheet.createRow(rowNum++);
            Cell labelCell12 = row12.createCell(1);
            labelCell12.setCellValue("출고단가");
            labelCell12.setCellStyle(labelStyle);
            Cell priceCell = row12.createCell(2);
            priceCell.setCellValue(dispatch.getOrderDetail().getOrderDPrice().doubleValue());
            priceCell.setCellStyle(currencyStyle);

            Row row13 = sheet.createRow(rowNum++);
            Cell labelCell13 = row13.createCell(1);
            labelCell13.setCellValue("총금액");
            labelCell13.setCellStyle(labelStyle);
            Cell totalCell = row13.createCell(2);
            totalCell.setCellValue(dispatch.getOrderDetail().getOrderDTotalPrice().doubleValue());
            totalCell.setCellStyle(currencyStyle);

            RegionUtil.setBorderTop(BorderStyle.MEDIUM, new CellRangeAddress(2, 2, 1, 2), sheet);

            CellRangeAddress entireTableRange = new CellRangeAddress(1, rowNum - 1, 1, 2);
            RegionUtil.setBorderTop(BorderStyle.MEDIUM, entireTableRange, sheet);
            RegionUtil.setBorderBottom(BorderStyle.MEDIUM, entireTableRange, sheet);
            RegionUtil.setBorderLeft(BorderStyle.MEDIUM, entireTableRange, sheet);
            RegionUtil.setBorderRight(BorderStyle.MEDIUM, entireTableRange, sheet);

            sheet.setColumnWidth(0, 500);
            sheet.setColumnWidth(1, 7000);
            sheet.setColumnWidth(2, 7000);

            workbook.write(byteArrayOutputStream);
            workbook.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return byteArrayOutputStream.toByteArray();
    }

    // 상품정보
    public Dispatch getDispatchDetails(Integer dispatchNo) {
        return orderDispatchRepository.findByDispatchDetails(dispatchNo);
    }








}
