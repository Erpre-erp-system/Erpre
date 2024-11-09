package com.project.erpre.service;

import com.project.erpre.model.dto.AndroidDispatchDTO;
import com.project.erpre.model.entity.Dispatch;

import java.util.List;

public interface DispatchService {
    List<AndroidDispatchDTO> findDispatches(Integer warehouseNo, String status);
    Dispatch updateDispatch(Integer dispatchNo, Dispatch dispatch);
}
