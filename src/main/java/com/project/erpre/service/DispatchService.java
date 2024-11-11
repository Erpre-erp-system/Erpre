package com.project.erpre.service;

import com.project.erpre.model.dto.AndroidDispatchDTO;
import com.project.erpre.model.entity.Customer;
import com.project.erpre.model.entity.Dispatch;
import com.project.erpre.model.entity.OrderDetail;
import com.project.erpre.model.entity.Product;
import com.project.erpre.repository.DispatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.*;

@Service
public class DispatchService {

    @Autowired
    private DispatchRepository dispatchRepository;

    public List<AndroidDispatchDTO> getInProgressDispatches(Integer warehouseNo) {
        List<Dispatch> dispatchList = dispatchRepository.findInProgressDispatchesByWarehouseNo(warehouseNo);
        List<AndroidDispatchDTO> result = new ArrayList<>();

        for (Dispatch dispatch : dispatchList) {
            OrderDetail orderDetail = dispatch.getOrderDetail();
            Product product = orderDetail.getProduct();
            Customer customer = orderDetail.getOrder().getCustomer();

            AndroidDispatchDTO dto = new AndroidDispatchDTO(
                    dispatch.getDispatchNo(),
                    product.getProductNm(),
                    orderDetail.getOrderDQty(),
                    customer.getCustomerName()
            );
            result.add(dto);
        }
        return result;
    }

//    public boolean updateDispatchStatus(Integer dispatchNo) { //성공 여부를 boolean 값으로 반환
//        Optional<Dispatch> optionalDispatch = dispatchRepository.findById(dispatchNo);
//        if (optionalDispatch.isPresent()) {
//            Dispatch dispatch = optionalDispatch.get();
//            dispatch.setDispatchStatus("complete"); // dispatchStatus를 "complete"로 변경
//
//            // dispatchEndDate를 현재 시간으로 설정
//            dispatch.setDispatchEndDate(new Timestamp(System.currentTimeMillis()));
//
//            dispatchRepository.save(dispatch); // 변경 사항 저장
//            return true;
//        } else {
//            return false; // 해당 dispatchNo가 없는 경우
//        }
//    }

    public AndroidDispatchDTO updateDispatchStatus(Integer dispatchNo) {
        Optional<Dispatch> optionalDispatch = dispatchRepository.findById(dispatchNo);
        if (optionalDispatch.isPresent()) {
            Dispatch dispatch = optionalDispatch.get();
            dispatch.setDispatchStatus("complete"); // dispatchStatus를 "complete"로 변경

            // dispatchEndDate를 현재 시간으로 설정
            dispatch.setDispatchEndDate(new Timestamp(System.currentTimeMillis()));

            dispatchRepository.save(dispatch); // 변경 사항 저장

            // 업데이트된 Dispatch 데이터를 AndroidDispatchDTO로 변환하여 반환
            return AndroidDispatchDTO.builder()
                    .dispatchNo(dispatch.getDispatchNo())
                    .productNm(dispatch.getOrderDetail().getProduct().getProductNm())
                    .orderDQty(dispatch.getOrderDetail().getOrderDQty())
                    .customerName(dispatch.getOrderDetail().getOrder().getCustomer().getCustomerName())
                    .build();
        } else {
            return null; // 해당 dispatchNo가 없는 경우 null 반환
        }
    }


    //3일 전 데이터 가져오기
    public List<AndroidDispatchDTO> getCompletedDispatchesForLastDays(Integer warehouseNo, int daysAgo) {
        Calendar calendar = Calendar.getInstance();

        // daysAgo 일 전의 자정(00:00:00.000)으로 시작일 설정
        calendar.add(Calendar.DAY_OF_MONTH, -daysAgo);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Timestamp startDate = new Timestamp(calendar.getTimeInMillis());

        // daysAgo 일 전의 23:59:59.999로 종료일 설정
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        calendar.set(Calendar.MILLISECOND, 999);
        Timestamp endDate = new Timestamp(calendar.getTimeInMillis());

        List<Dispatch> dispatches = dispatchRepository.findCompletedDispatchesWithinDays(warehouseNo, startDate, endDate);
        List<AndroidDispatchDTO> result = new ArrayList<>();

        for (Dispatch dispatch : dispatches) {
            AndroidDispatchDTO dto = AndroidDispatchDTO.builder()
                    .dispatchNo(dispatch.getDispatchNo())
                    .productNm(dispatch.getOrderDetail().getProduct().getProductNm())
                    .orderDQty(dispatch.getOrderDetail().getOrderDQty())
                    .customerName(dispatch.getOrderDetail().getOrder().getCustomer().getCustomerName())
                    .build();
            result.add(dto);
        }
        return result;
    }


}