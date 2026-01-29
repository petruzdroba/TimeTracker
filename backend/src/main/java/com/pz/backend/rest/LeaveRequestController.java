package com.pz.backend.rest;

import com.pz.backend.common.TimeRelation;
import com.pz.backend.dto.LeaveRequestPostRequest;
import com.pz.backend.dto.LeaveRequestPutRequest;
import com.pz.backend.entity.LeaveRequest;
import com.pz.backend.entity.Status;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.InsufficientPersonalTimeException;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.LeaveRequestService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping("/leaverequest")
    public List<LeaveRequest> getAll() {
        return leaveRequestService.get();
    }

    @GetMapping("/leaverequest/status/{status}")
    public List<LeaveRequest> getByStatus(@PathVariable Status status) {
        return leaveRequestService.get(status);
    }

    @PreAuthorize("hasRole('MANAGER') or @leaveRequestSecurity.canAccessUser(#userId, authentication)")
    @GetMapping("/leaverequest/user/{userId}")
    public List<LeaveRequest> getByUser(@PathVariable Long userId) throws NotFoundException {
        return leaveRequestService.get(userId);
    }

    @PreAuthorize("hasRole('MANAGER')or @leaveRequestSecurity.canAccessUser(#userId, authentication)")
    @GetMapping("/leaverequest/user/{userId}/{relation}")
    public List<LeaveRequest> getByUserAndTimeRelation(@PathVariable Long userId, @PathVariable TimeRelation relation) throws NotFoundException {
        return leaveRequestService.get(userId, relation);
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN') or @leaveRequestSecurity.canAccessUser(#userId, authentication)")
    @GetMapping("/leaverequest/remaining/{userId}")
    public Long getRemainingTime(@PathVariable Long userId) throws NotFoundException {
        return leaveRequestService.getRemaining(userId);
    }

    @PreAuthorize("@leaveRequestSecurity.canAccessUser(#request.id, authentication)")
    @PostMapping("/leaverequest")
    public LeaveRequest post(@Valid @RequestBody LeaveRequestPostRequest request) throws AlreadyExistsException, InsufficientPersonalTimeException {
        return leaveRequestService.post(
                request.userId(),
                request.startTime(),
                request.endTime(),
                request.description());
    }

    @PreAuthorize("@leaveRequestSecurity.isOwner(#request.id, authentication)")
    @PutMapping("/leaverequest")
    public LeaveRequest put(@Valid @RequestBody LeaveRequestPutRequest request) throws NotFoundException, InsufficientPersonalTimeException {
        return leaveRequestService.put(
                request.id(),
                request.userId(),
                request.startTime(),
                request.endTime(),
                request.description()
        );
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/leaverequest/{id}/{status}")
    public LeaveRequest putStatus(@PathVariable Long id, @PathVariable Status status) throws NotFoundException{
        return leaveRequestService.put(id,status);
    }

    @PreAuthorize("@leaveRequestSecurity.isOwner(#id, authentication)")
    @DeleteMapping("/leaverequest/{id}")
    public void delete(@PathVariable Long id) throws NotFoundException{
        leaveRequestService.delete(id);
    }
}
