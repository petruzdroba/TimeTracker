package com.pz.backend.rest;

import com.pz.backend.entity.TimerData;
import com.pz.backend.service.TimerService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping("/api/timer")
public class TimerRestController {

    private final TimerService timerService;

    public TimerRestController(TimerService timerService) {
        this.timerService = timerService;
    }

    @GetMapping("/get/{id}/")
    public ResponseEntity<?> getTimerData(@PathVariable Long id){
        try{
            TimerData data = timerService.get(id);

            return ResponseEntity.ok(Map.of(
                    "id", data.getId(),
                    "startTime", data.getStartTime(),
                    "endTime", data.getEndTime(),
                    "requiredTime", data.getRemainingTime(),
                    "timerType", data.getTimerType()
            ));
        } catch (Exception e) {
            String msg = e.getMessage();
            if(msg != null && msg.contains("not found")){
                return ResponseEntity.status(404).body(Map.of("detail", msg));
            }
            return ResponseEntity.status(500).body(Map.of("detail", msg));
        }
    }

//    @PutMapping("/sync/")
//    public ResponseEntity<?> syncTimerData(){
//        return;
//    }
}
