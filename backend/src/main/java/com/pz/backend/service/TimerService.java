package com.pz.backend.service;

import com.pz.backend.entity.TimerData;

public interface TimerService {
    TimerData get(Long timerId) throws Exception;

    TimerData sync(Long userId, String startTime, String endTime, Integer requiredTime, String timerType) throws Exception;
}
