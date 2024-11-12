package com.project.erpre.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "m_warehouse")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warehouse_no")
    private Integer warehouseNo; // 창고 번호

    @Column(name = "warehouse_name", length = 30, nullable = false)
    private String warehouseName; // 창고명

    @Column(name = "warehouse_tel", length = 30)
    private String warehouseTel; // 창고 대표 전화번호

    @Column(name = "warehouse_addr", length = 200)
    private String warehouseAddr; // 창고 주소

    @Column(name = "warehouse_manager_name", length = 30)
    private String warehouseManagerName; // 창고 담당자 이름


}
