package com.pz.backend.rest;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pz.backend.entity.TimerData;
import com.pz.backend.entity.WorkLog;
import com.pz.backend.service.WorkLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping("/api/worklog")
public class WorkLogRestController {

    private final WorkLogService workLogService;

    public WorkLogRestController(WorkLogService workLogService) {
        this.workLogService = workLogService;
    }

    @GetMapping("/get/{id}/")
    public ResponseEntity<?> getWorkLog(@PathVariable Long id){
        try{
        WorkLog data = workLogService.get(id);

        return ResponseEntity.ok(Map.of(
                "id", data.getId(),
                "worklog", new ObjectMapper().readValue(data.getWorkLog(), Object.class)
        ));
    } catch (Exception e) {
        String msg = e.getMessage();
        if(msg != null && msg.contains("not found")){
            return ResponseEntity.status(404).body(Map.of("detail", msg));
        }
        return ResponseEntity.status(500).body(Map.of("detail", msg));
    }
    }
}
