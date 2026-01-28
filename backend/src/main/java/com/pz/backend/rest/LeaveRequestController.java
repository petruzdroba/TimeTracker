package com.pz.backend.rest;

import com.pz.backend.common.TimeRelation;
import com.pz.backend.dto.LeaveRequestPostRequest;
import com.pz.backend.dto.LeaveRequestPutRequest;
import com.pz.backend.entity.LeaveRequest;
import com.pz.backend.entity.Status;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.LeaveRequestService;
import jakarta.validation.Valid;
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

    @GetMapping("/leaverequest/user/{userId}")
    public List<LeaveRequest> getByUser(@PathVariable Long userId) throws NotFoundException {
        return leaveRequestService.get(userId);
    }

    @GetMapping("/leaverequest/user/{userId}/{relation}")
    public List<LeaveRequest> getByUserAndTimeRelation(@PathVariable Long userId, @PathVariable TimeRelation relation) throws NotFoundException {
        return leaveRequestService.get(userId, relation);
    }

    @GetMapping("/leaverequest/remaining/{userId}")
    public Long getRemainingTime(@PathVariable Long userId) throws NotFoundException {
        return leaveRequestService.getRemaining(userId);
    }

    @PostMapping("/leaverequest")
    public LeaveRequest post(@Valid @RequestBody LeaveRequestPostRequest request) throws AlreadyExistsException {
        return leaveRequestService.post(
                request.userId(),
                request.startTime(),
                request.endTime(),
                request.description());
    }

    @PutMapping("/leaverequest")
    public LeaveRequest update(@Valid @RequestBody LeaveRequestPutRequest request) throws NotFoundException{
        return leaveRequestService.put(
                request.id(),
                request.userId(),
                request.startTime(),
                request.endTime(),
                request.description()
        );
    }

    @PutMapping("/leaverequest/{id}/{status}")
    public LeaveRequest putStatus(@PathVariable Long id, @PathVariable Status status) throws NotFoundException{
        return leaveRequestService.put(id,status);
    }

    @DeleteMapping("/leaverequest/{id}")
    public void delete(@PathVariable Long id) throws NotFoundException{
        leaveRequestService.delete(id);
    }
}
