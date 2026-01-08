package com.pz.backend.rest;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pz.backend.dto.SignupRequest;
import com.pz.backend.dto.WorkLogRequest;
import com.pz.backend.entity.TimerData;
import com.pz.backend.entity.WorkLog;
import com.pz.backend.service.WorkLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/api/worklog")
public class WorkLogRestController {

    private final WorkLogService workLogService;

    public WorkLogRestController(WorkLogService workLogService) {
        this.workLogService = workLogService;
    }
    @Autowired private ObjectMapper mapper;

    @GetMapping("/get/{id}/")
    public ResponseEntity<?> getWorkLog(@PathVariable Long id) {
        try {
            WorkLog data = workLogService.get(id);

            return ResponseEntity.ok(Map.of(
                    "id", data.getId(),
                    "worklog", mapper.readValue(data.getWorkLog(), Object.class)
            ));
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("not found")) {
                return ResponseEntity.status(404).body(Map.of("detail", msg));
            }
            return ResponseEntity.status(500).body(Map.of("detail", msg));
        }
    }

    @PutMapping("/update/")
    public ResponseEntity<?> putWorkLog(@RequestBody WorkLogRequest request) {
        try {
            WorkLog workLog = workLogService.put(request.userId(), request.data());

            return ResponseEntity.status(200).body(Map.of(
                    "id", workLog.getId(),
                    "worklog", workLog.getWorkLog()
            ));
        }catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("not found")) {
                return ResponseEntity.status(404).body(Map.of("detail", msg));
            }
            return ResponseEntity.status(500).body(Map.of("detail", msg));
        }
    }
}
