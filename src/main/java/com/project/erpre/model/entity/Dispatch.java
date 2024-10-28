package com.project.erpre.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "m_dispatch")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Dispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dispatch_no")
    private Integer dispatchNo; // 출고 번호

    @Column(name = "dispatch_status", length = 100, nullable = true, columnDefinition = "VARCHAR(100) DEFAULT 'pending'")
    private String dispatchStatus; // 출고 상태

    @Column(name = "dispatch_start_date", nullable = true, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp dispatchStartDate; // 출고 시작일시

    @Column(name = "dispatch_end_date")
    private Timestamp dispatchEndDate; // 출고 완료일시

    @Column(name = "dispatch_delete_yn", length = 1, nullable = true, columnDefinition = "CHAR(1) DEFAULT 'n'")
    private String dispatchDeleteYn; // 출고 삭제 여부

    // 창고
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_no", nullable = false)
    private Warehouse warehouse;

    // 출고 QR코드
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "qr_code_id", referencedColumnName = "qr_code_id", nullable = false)
    private QrCode qrCode;

    // 주문 상세
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_d_no")
    private OrderDetail orderDetail;


}
