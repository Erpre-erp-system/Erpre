package com.project.erpre.service;

import com.project.erpre.model.dto.DispatchDTO;
import com.project.erpre.model.entity.*;
import com.project.erpre.repository.OrderDetailRepository;
import com.project.erpre.repository.OrderDispatchRepository;
import com.project.erpre.repository.OrderRepository;
import com.project.erpre.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

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

    //DispatchDTO -> Dispatch 엔티티로 변환하는 메서드
    private Dispatch convertToDispatchEntity(DispatchDTO dispatchDTO) {
        Dispatch dispatch = new Dispatch();
        dispatch.setDispatchNo(dispatchDTO.getDispatchNo());
        dispatch.setDispatchStatus(dispatchDTO.getDispatchStatus());
        dispatch.setDispatchStartDate(dispatchDTO.getDispatchStartDate());
        dispatch.setDispatchEndDate(dispatchDTO.getDispatchEndDate());
        dispatch.setDispatchQrCode(dispatchDTO.getDispatchQrCode());
        dispatch.setDispatchDeleteYn(dispatchDTO.getDispatchDeleteYn());

        // 고객사, 주문, 창고 정보는 엔티티로 변환해서 추가로 설정 필요
        Order order = orderRepository.findById(dispatchDTO.getOrderHNo()).orElse(null);
        OrderDetail orderDetail = orderDetailRepository.findById(dispatchDTO.getOrderDNo()).orElse(null);
        Warehouse warehouse = warehouseRepository.findById(dispatchDTO.getWarehouseNo()).orElse(null);

        dispatch.setOrder(order);
        dispatch.setOrderDetail(orderDetail);
        dispatch.setWarehouse(warehouse);

        return dispatch;
    }

    // Dispatch 엔티티를 DispatchDTO로 변환하는 메서드
    private DispatchDTO convertToDispatchDTO(Dispatch dispatch) {
        Integer orderHNo = dispatch.getOrder() != null ? dispatch.getOrder().getOrderNo() : null;
        Integer orderDNo = dispatch.getOrderDetail() != null ? dispatch.getOrderDetail().getOrderNo() : null;
        Integer warehouseNo = dispatch.getWarehouse() != null ? dispatch.getWarehouse().getWarehouseNo() : null;

        return DispatchDTO.builder()
                .dispatchNo(dispatch.getDispatchNo())
                .dispatchStatus(dispatch.getDispatchStatus())
                .dispatchStartDate(dispatch.getDispatchStartDate())
                .dispatchEndDate(dispatch.getDispatchEndDate())
                .dispatchQrCode(dispatch.getDispatchQrCode())
                .dispatchDeleteYn(dispatch.getDispatchDeleteYn())
                .orderHNo(orderHNo)
                .orderDNo(orderDNo)
                .warehouseNo(warehouseNo)
                .build();
    }


    //페이징해서 pending 목록 보여주기
    public Page<DispatchDTO> getPagePending(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Dispatch> dispatchPage = orderDispatchRepository.findByDispatchStatus("pending", pageable);
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



}
