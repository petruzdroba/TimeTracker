package com.pz.backend.service;

import com.pz.backend.entity.TimerData;

public interface TimerService {
    TimerData get(Long timerId) throws Exception;

    TimerData sync(Long userId, TimerData data) throws Exception;
}
