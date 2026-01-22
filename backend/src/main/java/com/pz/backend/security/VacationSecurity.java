package com.pz.backend.security;

import com.pz.backend.service.VacationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component("vacationSecurity")
public class VacationSecurity {

    private final VacationService vacationService;

    public VacationSecurity(VacationService vacationService) {
        this.vacationService = vacationService;
    }

    public boolean isOwner(Long vacationId, Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("user_id");
        return Objects.equals(vacationService.findById(vacationId).getUserId(), userId);
    }

    public boolean canAccessUser(Long userId, Authentication authentication){
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return Objects.equals(jwt.getClaim("user_id"), userId);
    }
}

