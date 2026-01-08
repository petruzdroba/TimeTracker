package com.pz.backend.service;

import com.pz.backend.dao.TimerDataRepository;
import com.pz.backend.entity.TimerData;
import org.springframework.stereotype.Service;

@Service
public class TimerServiceImpl implements TimerService{

    private final TimerDataRepository timerDataRepository;

    public TimerServiceImpl(TimerDataRepository timerDataRepository) {
        this.timerDataRepository = timerDataRepository;
    }

    @Override
    public TimerData get(Long timerId) throws Exception {
        return timerDataRepository.findById(timerId)
                .orElseThrow(() -> new Exception("Timer data not found"));
    }

    @Override
    public TimerData sync(Long userId, String startTime, String endTime, Integer requiredTime, String timerType) throws Exception {
        TimerData existing =  timerDataRepository.findById(userId)
                .orElseThrow(() -> new Exception("Timer data not found"));

        existing.setStartTime(startTime);
        existing.setEndTime(endTime);
        existing.setRemainingTime(requiredTime);
        existing.setTimerType(timerType);

        return timerDataRepository.save(existing);
    }
}
