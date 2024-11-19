package com.project.erpre.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "m_product_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_detail_cd")
    private Long productDetailCd; // 상품 상세 고유 ID

    @Column(name = "product_model_name", nullable = false, length = 30)
    private String productModelName; // 모델명

    @Column(name = "product_manufacturer", length = 30)
    private String productManufacturer; // 제조사

    @Column(name = "product_specifications", length = 200)
    private String productSpecifications; // 상세 사양

    @Column(name = "product_weight", length = 30)
    private String productWeight; // 상품 무게

    @Column(name = "product_warranty_period", length = 30)
    private String productWarrantyPeriod; // 보증 기간

    @Column(name = "product_description", columnDefinition = "TEXT")
    private String productDescription; // 상품 설명

    //상품
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_cd")
    private Product product;

}
