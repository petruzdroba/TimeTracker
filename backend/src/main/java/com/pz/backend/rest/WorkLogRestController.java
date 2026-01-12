package com.pz.backend.rest;


import com.pz.backend.dto.WorkLogRequest;
import com.pz.backend.entity.WorkLog;
import com.pz.backend.service.WorkLogService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WorkLogRestController {

    private final WorkLogService workLogService;

    public WorkLogRestController(WorkLogService workLogService) {
        this.workLogService = workLogService;
    }

    @GetMapping("/worklog/{userId}")
    public List<WorkLog> getWorkLogs(@PathVariable Long userId) throws Exception {
        if(userId == null)
            throw new Exception("User not logged in");

        return workLogService.get(userId);
    }

    @PostMapping("/worklog")
    public WorkLog addWorkLog(@RequestBody WorkLogRequest workLog) throws Exception {
        return workLogService.post(workLog.userId(), workLog.date(), workLog.timeWorked());
    }

    @PutMapping("/worklog")
    public WorkLog updateWorkLog(@RequestBody WorkLogRequest workLog) throws Exception {
        return workLogService.put(workLog.workLogId(), workLog.timeWorked());
    }

    @DeleteMapping("/worklog/{workLogId}")
    public void deleteWorkLog(@PathVariable Long workLogId) throws Exception {
        workLogService.delete(workLogId);
    }
}
