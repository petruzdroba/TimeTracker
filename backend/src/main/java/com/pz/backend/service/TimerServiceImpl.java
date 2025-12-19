package com.pz.backend.service;

import com.pz.backend.dao.TimerDataRepository;
import com.pz.backend.entity.TimerData;

public class TimerServiceImpl implements TimerService{

    private final TimerDataRepository timerDataRepository;

    public TimerServiceImpl(TimerDataRepository timerDataRepository) {
        this.timerDataRepository = timerDataRepository;
    }

    @Override
    public TimerData get(Long timerId) throws Exception {
        return timerDataRepository.findById(timerId)
                .orElseThrow(() -> new Exception("Timer data nout found"));
    }

    @Override
    public TimerData sync(Long userId, TimerData data) throws Exception {
        return null;
    }
}
