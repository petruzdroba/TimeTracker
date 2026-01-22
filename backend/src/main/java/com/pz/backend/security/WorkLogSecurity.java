package com.pz.backend.security;

import com.pz.backend.service.WorkLogService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component("workLogSecurity")
public class WorkLogSecurity {

    private final WorkLogService workLogService;

    public WorkLogSecurity(WorkLogService workLogService) {
        this.workLogService = workLogService;
    }

    public boolean isOwner(Long workLogId, Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("user_id");
        return Objects.equals(workLogService.findById(workLogId).getUser().getId(), userId);
    }

    public boolean canAccessUser(Long userId, Authentication authentication){
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return Objects.equals(jwt.getClaim("user_id"), userId);
    }
}
