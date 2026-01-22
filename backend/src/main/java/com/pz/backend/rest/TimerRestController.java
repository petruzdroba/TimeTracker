package com.pz.backend.rest;

import com.pz.backend.dto.TimerDataPutRequest;
import com.pz.backend.entity.TimerData;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.TimerService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class TimerRestController {

    private final TimerService timerService;

    public TimerRestController(TimerService timerService) {
        this.timerService = timerService;
    }

    @GetMapping("/timer/{userId}")
    public TimerData getTimerData(@PathVariable Long userId) throws NotFoundException {
        return timerService.get(userId);
    }

    @PreAuthorize("@timerSecurity.isOwner(#request.userId, authentication)")
    @PutMapping("/timer")
    public TimerData syncTimerData(@Valid @RequestBody TimerDataPutRequest request) throws NotFoundException {
        return timerService.sync(
                request.userId(),
                request.startTime(),
                request.endTime(),
                request.requiredTime(),
                request.timerType()
        );
    }
}
