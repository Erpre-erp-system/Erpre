package com.project.erpre.service;

import com.project.erpre.model.dto.AndroidDispatchDTO;
import com.project.erpre.model.entity.Dispatch;
import com.project.erpre.repository.DispatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class DispatchServiceImpl implements DispatchService {

    @Autowired
    private DispatchRepository dispatchRepository;

    @Override
    public List<AndroidDispatchDTO> findDispatches(Integer warehouseNo, String status) {
        if (warehouseNo != null && status != null) {
            return dispatchRepository.findDispatchesWithProductInfo(warehouseNo, status);
        } else {
            // 기본으로 모든 항목을 반환하지 않고, 조건에 맞는 데이터만 제공할 수 있습니다.
            throw new IllegalArgumentException("warehouseNo와 status는 필수 입력값입니다.");
        }
    }

    @Override
    public Dispatch updateDispatch(Integer dispatchNo, Dispatch dispatch) {
        Dispatch existingDispatch = dispatchRepository.findById(dispatchNo)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch not found with id " + dispatchNo));

        existingDispatch.setDispatchStatus(dispatch.getDispatchStatus());
        existingDispatch.setDispatchStartDate(dispatch.getDispatchStartDate() != null ? dispatch.getDispatchStartDate() : new Timestamp(System.currentTimeMillis()));
        existingDispatch.setDispatchEndDate(dispatch.getDispatchEndDate());
        existingDispatch.setDispatchDeleteYn(dispatch.getDispatchDeleteYn());
        existingDispatch.setWarehouse(dispatch.getWarehouse());
        existingDispatch.setQrCode(dispatch.getQrCode());
        existingDispatch.setOrderDetail(dispatch.getOrderDetail());

        return dispatchRepository.save(existingDispatch);
    }
}
