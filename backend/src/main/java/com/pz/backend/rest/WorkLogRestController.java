package com.pz.backend.rest;


import com.pz.backend.dto.WorkLogPostRequest;
import com.pz.backend.dto.WorkLogPutRequest;
import com.pz.backend.entity.WorkLog;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.WorkLogService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("@workLogSecurity.canAccessUser(#workLog.userId, authentication)")
    @PostMapping("/worklog")
    public WorkLog addWorkLog(@Valid @RequestBody WorkLogPostRequest workLog) throws AlreadyExistsException {
        return workLogService.post(workLog.userId(), workLog.date(), workLog.timeWorked());
    }

    @PreAuthorize("@workLogSecurity.isOwner(#workLog.id, authentication)")
    @PutMapping("/worklog")
    public WorkLog updateWorkLog(@Valid @RequestBody WorkLogPutRequest workLog) throws NotFoundException {
        return workLogService.put(workLog.id(), workLog.date(),workLog.timeWorked());
    }

    @PreAuthorize("@workLogSecurity.isOwner(#workLogId, authentication)")
    @DeleteMapping("/worklog/{workLogId}")
    public void deleteWorkLog(@PathVariable Long workLogId) throws NotFoundException {
        workLogService.delete(workLogId);
    }
}
