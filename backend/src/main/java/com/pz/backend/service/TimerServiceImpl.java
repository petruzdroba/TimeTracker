package com.pz.backend.service;

import com.pz.backend.dao.TimerDataRepository;
import com.pz.backend.entity.TimerData;
import com.pz.backend.entity.TimerType;
import com.pz.backend.exceptions.NotFoundException;
import org.springframework.stereotype.Service;

@Service
public class TimerServiceImpl implements TimerService{

    private final TimerDataRepository timerDataRepository;

    public TimerServiceImpl(TimerDataRepository timerDataRepository) {
        this.timerDataRepository = timerDataRepository;
    }

    @Override
    public TimerData get(Long timerId) throws NotFoundException {
        return timerDataRepository.findById(timerId)
                .orElseThrow(() -> new NotFoundException(TimerData.class.getName(), timerId));
    }

    @Override
    public TimerData sync(Long userId, String startTime, String endTime, Integer requiredTime, TimerType timerType) throws NotFoundException {
        TimerData existing =  timerDataRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(TimerData.class.getName(), userId));

        existing.setStartTime(startTime);
        existing.setEndTime(endTime);
        existing.setRemainingTime(requiredTime);
        existing.setTimerType(timerType);

        return timerDataRepository.save(existing);
    }
}
