package com.pz.backend.service;

import com.pz.backend.entity.TimerData;
import com.pz.backend.entity.TimerType;
import com.pz.backend.exceptions.NotFoundException;

public interface TimerService {
    TimerData get(Long timerId) throws NotFoundException;

    TimerData sync(Long userId, String startTime, String endTime, Integer requiredTime, TimerType timerType) throws NotFoundException;
}
