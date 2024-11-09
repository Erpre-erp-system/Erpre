package com.project.erpre.repository;

import com.project.erpre.model.dto.AndroidDispatchDTO;
import com.project.erpre.model.entity.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DispatchRepository extends JpaRepository<Dispatch, Integer> {

    @Query("SELECT new com.project.erpre.model.dto.AndroidDispatchDTO(d.dispatchNo, p.productNm, od.orderDQty) " +
            "FROM Dispatch d " +
            "JOIN d.orderDetail od " +
            "JOIN od.product p " +
            "WHERE d.warehouse.warehouseNo = :warehouseNo AND d.dispatchStatus = :status")
    List<AndroidDispatchDTO> findDispatchesWithProductInfo(@Param("warehouseNo") Integer warehouseNo,
                                                           @Param("status") String status);
}
