package com.project.erpre.controller;

import com.project.erpre.model.dto.AndroidDispatchDTO;
import com.project.erpre.model.dto.DispatchDTO;
import com.project.erpre.service.DispatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/android/api")
public class DispatchController {

    @Autowired
    private DispatchService dispatchService;

    @CrossOrigin(origins = "")
    @GetMapping("/get/dispatch/inProgress/{warehouseNo}")
    public List<AndroidDispatchDTO> getInProgressDispatches(@PathVariable Integer warehouseNo) {
        return dispatchService.getInProgressDispatches(warehouseNo);
    }

    @CrossOrigin(origins = "")
    @PostMapping("/update/dispatch/complete/{dispatchNo}")
    public ResponseEntity<?> updateDispatchStatus(@PathVariable Integer dispatchNo) {
        boolean updated = dispatchService.updateDispatchStatus(dispatchNo);
        if (updated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dispatch not found");
        }
    }

    @CrossOrigin(origins = "")
    @GetMapping("/get/dispatch/completed")
    public List<DispatchDTO> getCompletedDispatches(
            @RequestParam Integer warehouseNo,
            @RequestParam int daysAgo) {
        return dispatchService.getCompletedDispatchesForLastDays(warehouseNo, daysAgo);
    }
}