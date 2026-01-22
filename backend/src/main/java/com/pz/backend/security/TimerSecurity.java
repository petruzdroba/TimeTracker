package com.pz.backend.security;

import com.pz.backend.service.TimerService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component("timerSecurity")
public class TimerSecurity {

    private final TimerService timerService;

    public TimerSecurity(TimerService timerService) {
        this.timerService = timerService;
    }

    public boolean isOwner(Long requestId, Authentication authentication){
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("user_id");

        return Objects.equals(requestId, userId);
    }
}
