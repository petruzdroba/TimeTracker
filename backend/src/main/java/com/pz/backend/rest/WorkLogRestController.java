package com.pz.backend.rest;


import com.pz.backend.dto.WorkLogPostRequest;
import com.pz.backend.dto.WorkLogPutRequest;
import com.pz.backend.entity.WorkLog;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.WorkLogService;
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
    public WorkLog addWorkLog(@RequestBody WorkLogPostRequest workLog) throws AlreadyExistsException {
        return workLogService.post(workLog.userId(), workLog.date(), workLog.timeWorked());
    }

    @PutMapping("/worklog")
    public WorkLog updateWorkLog(@RequestBody WorkLogPutRequest workLog) throws NotFoundException {
        return workLogService.put(workLog.id(), workLog.date(),workLog.timeWorked());
    }

    @DeleteMapping("/worklog/{workLogId}")
    public void deleteWorkLog(@PathVariable Long workLogId) throws NotFoundException {
        workLogService.delete(workLogId);
    }
}
