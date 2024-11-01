package com.project.erpre.repository;

import com.project.erpre.model.entity.Dispatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDispatchRepository extends JpaRepository<Dispatch, Integer> {

    /*
    JpaRepository는 기본적으로 다음과 같은 CRUD 메서드를 제공합니다.
    ---------------------------------------
    save(S entity) : 삽입 또는 수정
    findById(ID id) : 특정 ID로 엔티티 조회
    findAll() : 모든 엔티티 조회
    deleteById(ID id) : 특정 ID로 엔티티 삭제
    delete(S entity) : 특정 엔티티 삭제
    ---------------------------------------
    */


    // JOIN FETCH - 연관된 엔티티를 한 번에 가져옴
    // countQuery - JPA에서 JOIN FETCH를 사용한 쿼리와 페이징을 함께 사용할 때 발생하는 count 쿼리 생성

    // 상태에 따라 Dispatch를 페이징하여 조회 (주문 상태가 'ing' 또는 'denied'가 아닌 경우)
    @Query(value = "SELECT d FROM Dispatch d " +
            "JOIN FETCH d.orderDetail od " +
            "JOIN FETCH od.order o " +
            "JOIN FETCH o.customer c " +
            "JOIN FETCH od.product p " +
            "LEFT JOIN FETCH d.warehouse w " +
            "WHERE d.dispatchStatus = :dispatchStatus " +
            "AND o.orderHStatus = 'approved' " +
            //"AND o.orderHStatus NOT IN ('ing', 'denied') " +
            "AND d.dispatchDeleteYn = 'N'",
            countQuery = "SELECT COUNT(d) FROM Dispatch d " +
                    "JOIN d.orderDetail od " +
                    "JOIN od.order o " +
                    "WHERE d.dispatchStatus = :dispatchStatus " +
                    "AND o.orderHStatus = 'approved' " +
                    //"AND o.orderHStatus NOT IN ('ing', 'denied') " +
                    "AND d.dispatchDeleteYn = 'N'")
    Page<Dispatch> findByDispatchStatus(@Param("dispatchStatus") String dispatchStatus, Pageable pageable);

    // 출고 완료 상태 조회 메서드
    @Query(value = "SELECT d FROM Dispatch d " +
            "JOIN FETCH d.orderDetail od " +
            "JOIN FETCH od.order o " +
            "JOIN FETCH o.customer c " +
            "JOIN FETCH od.product p " +
            "LEFT JOIN FETCH d.warehouse w " +
            "WHERE d.dispatchStatus = 'complete' " +
            "AND d.dispatchDeleteYn = 'N'",
            countQuery = "SELECT COUNT(d) FROM Dispatch d " +
                    "WHERE d.dispatchStatus = 'complete' " +
                    "AND d.dispatchDeleteYn = 'N'")
    Page<Dispatch> findByDispatchStatusComplete(Pageable pageable);


}
