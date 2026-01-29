package com.pz.backend.security;

import com.pz.backend.service.LeaveRequestService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component("leaveRequestSecurity")
public class LeaveRequestSecurity {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestSecurity(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    public boolean isOwner(Long id, Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("user_id");
        return Objects.equals(leaveRequestService.findById(id).getUserId(), userId);
    }

    public boolean canAccessUser(Long userId, Authentication authentication){
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return Objects.equals(jwt.getClaim("user_id"), userId);
    }
}
