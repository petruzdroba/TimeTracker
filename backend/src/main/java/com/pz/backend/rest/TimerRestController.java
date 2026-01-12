package com.pz.backend.rest;

import com.pz.backend.dto.TimerDataRequest;
import com.pz.backend.entity.TimerData;
import com.pz.backend.service.TimerService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class TimerRestController {

    private final TimerService timerService;

    public TimerRestController(TimerService timerService) {
        this.timerService = timerService;
    }

    @GetMapping("/timer/{userId}")
    public TimerData getTimerData(@PathVariable Long userId) throws Exception {
        return timerService.get(userId);
    }

    @PutMapping("/timer")
    public TimerData syncTimerData(@RequestBody TimerDataRequest request) throws Exception {
        return timerService.sync(
                request.userId(),
                request.data().startTime(),
                request.data().endTime(),
                request.data().requiredTime(),
                request.data().timerType()
        );
    }
}
