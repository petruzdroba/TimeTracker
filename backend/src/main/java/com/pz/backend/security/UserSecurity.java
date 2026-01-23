package com.pz.backend.security;

import com.pz.backend.entity.Role;
import com.pz.backend.service.UserService;
import org.springframework.security.core.Authentication;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component("userSecurity")
public class UserSecurity {

    private final UserService userService;

    public UserSecurity(UserService userService) {
        this.userService = userService;
    }

    public boolean canAccessUser(Long id, Authentication authentication){
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("user_id");

        return Objects.equals(id, userId);
    }

    public boolean canAccessUser(String email, Authentication authentication){
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long userId = jwt.getClaim("user_id");

        return Objects.equals(userService.findById(userId).getEmail(), email);
    }

    public boolean modifiable(Long id){
        return !Objects.equals(userService.findById(id).getRole(), Role.ADMIN);
    }
}
