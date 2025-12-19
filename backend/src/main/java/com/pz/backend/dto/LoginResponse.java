package com.pz.backend.dto;


public record LoginResponse(
        String access,
        String refresh,
        UserResponse user
) {}
