package com.project.erpre.service;

import com.project.erpre.model.dto.AndroidDispatchDTO;
import com.project.erpre.model.dto.DispatchDTO;
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

            AndroidDispatchDTO dto = new AndroidDispatchDTO(
                    dispatch.getDispatchNo(),
                    product.getProductNm(),
                    orderDetail.getOrderDQty()
            );
            result.add(dto);
        }
        return result;
    }

    public boolean updateDispatchStatus(Integer dispatchNo) { //성공 여부를 boolean 값으로 반환
        Optional<Dispatch> optionalDispatch = dispatchRepository.findById(dispatchNo);
        if (optionalDispatch.isPresent()) {
            Dispatch dispatch = optionalDispatch.get();
            dispatch.setDispatchStatus("complete"); // dispatchStatus를 "complete"로 변경

            // dispatchEndDate를 현재 시간으로 설정
            dispatch.setDispatchEndDate(new Timestamp(System.currentTimeMillis()));

            dispatchRepository.save(dispatch); // 변경 사항 저장
            return true;
        } else {
            return false; // 해당 dispatchNo가 없는 경우
        }
    }

    //3일 전 데이터 가져오기
    public List<DispatchDTO> getCompletedDispatchesForLastDays(Integer warehouseNo, int daysAgo) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -daysAgo);
        Timestamp startDate = new Timestamp(calendar.getTimeInMillis());

        calendar.add(Calendar.DAY_OF_MONTH, 1); // 1일 더해 오늘 날짜 끝까지 포함
        Timestamp endDate = new Timestamp(calendar.getTimeInMillis());

        List<Dispatch> dispatches = dispatchRepository.findCompletedDispatchesWithinDays(warehouseNo, startDate, endDate);
        List<DispatchDTO> result = new ArrayList<>();

        for (Dispatch dispatch : dispatches) {
            DispatchDTO dto = DispatchDTO.builder()
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