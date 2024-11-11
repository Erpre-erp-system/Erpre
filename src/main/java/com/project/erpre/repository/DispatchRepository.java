package com.project.erpre.repository;

import com.project.erpre.model.dto.AndroidDispatchDTO;
import com.project.erpre.model.entity.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch, Integer> {

    //get, update
    @Query("SELECT d FROM Dispatch d " +
            "JOIN d.orderDetail od " +
            "JOIN od.product p " +
            "WHERE d.warehouse.warehouseNo = :warehouseNo " +
            "AND d.dispatchStatus = 'inProgress'")
    List<Dispatch> findInProgressDispatchesByWarehouseNo(@Param("warehouseNo") Integer warehouseNo);

    //3일 전 데이터 가져오기
    @Query("SELECT d FROM Dispatch d WHERE d.dispatchStatus = 'complete' " +
            "AND d.dispatchEndDate BETWEEN :startDate AND :endDate AND d.warehouse.warehouseNo = :warehouseNo")
    List<Dispatch> findCompletedDispatchesWithinDays(
            @Param("warehouseNo") Integer warehouseNo,
            @Param("startDate") Timestamp startDate,
            @Param("endDate") Timestamp endDate);
}