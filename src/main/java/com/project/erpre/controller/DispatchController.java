package com.project.erpre.controller;

import com.project.erpre.model.dto.AndroidDispatchDTO;
import com.project.erpre.model.entity.Dispatch;
import com.project.erpre.service.DispatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dispatch/api")
public class DispatchController {

    @Autowired
    private DispatchService dispatchService;

    // 조건부 Dispatch 항목 조회(inProgress가져오기)
    @CrossOrigin(origins = "*")
    @GetMapping("/get/dispatch/all/{warehouseNo}")
    public ResponseEntity<?> findDispatches(
            @PathVariable("warehouseNo") Integer warehouseNo,
            @RequestParam(value = "status", required = false, defaultValue = "inProgress") String status) {
        try {
            List<AndroidDispatchDTO> dispatchList = dispatchService.findDispatches(warehouseNo, status);
            return ResponseEntity.ok(dispatchList);
        } catch (Exception e) {
            // 예외 로그 출력
            e.printStackTrace();
            // 에러 메시지 반환
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching dispatches: " + e.getMessage());
        }
    }


    // 특정 Dispatch 업데이트
    @CrossOrigin(origins = "*")  // 모든 도메인에 대해 허용
    @PostMapping("/post/dispatch/update/{dispatchNo}")
    public ResponseEntity<Dispatch> updateDispatch(
            @PathVariable("dispatchNo") Integer dispatchNo,
            @RequestBody Dispatch dispatch) {
        Dispatch updatedDispatch = dispatchService.updateDispatch(dispatchNo, dispatch);
        return ResponseEntity.ok(updatedDispatch);
    }
}
