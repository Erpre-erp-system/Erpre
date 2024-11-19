package com.project.erpre.repository;

import com.project.erpre.model.entity.ProductDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductDetailsRepository extends JpaRepository<ProductDetails, Long> {

    @Query("SELECT pd FROM ProductDetails pd JOIN FETCH pd.product WHERE pd.productDetailCd = :productDetailCd")
    Optional<ProductDetails> findByProductDetailCdWithProduct(@Param("productDetailCd") Long productDetailCd);

}
