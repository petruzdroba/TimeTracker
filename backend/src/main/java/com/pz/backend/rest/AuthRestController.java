package com.pz.backend.rest;

import com.pz.backend.dto.LoginRequest;
import com.pz.backend.dto.SignupRequest;
import com.pz.backend.dto.UserResponse;
import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.InvalidCredentialsException;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.AuthService;
import com.pz.backend.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final AuthService authService;
    private final JwtService jwtService;

    @Autowired
    public AuthRestController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup/")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) throws AlreadyExistsException {
        UserData user = authService.signUp(request.name(), request.email(), request.password());
        UserAuth auth = user.getUser();

        String accessToken = jwtService.generateAccessToken(auth);
        String refreshToken = jwtService.generateRefreshToken(auth);

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getWorkHours(),
                user.getVacationDays(),
                user.getPersonalTime(),
                user.getRole()
        );

        return ResponseEntity.status(201).body(Map.of(
                "access", accessToken,
                "refresh", refreshToken,
                "user", userResponse
        ));
    }

    @PostMapping("/login/")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginRequest request) throws NotFoundException, InvalidCredentialsException {
        UserAuth auth = authService.logIn(request.email(), request.password());
        UserData user = auth.getUserData();

        String accessToken = jwtService.generateAccessToken(auth);
        String refreshToken = jwtService.generateRefreshToken(auth);

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getWorkHours(),
                user.getVacationDays(),
                user.getPersonalTime(),
                user.getRole()
        );

        return ResponseEntity.ok(Map.of(
                "access", accessToken,
                "refresh", refreshToken,
                "user", userResponse
        ));
    }

    @GetMapping("/me/")
    public ResponseEntity<Object> me(@RequestHeader(value = "Authorization", required = false) String authHeader) throws NotFoundException {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new InvalidCredentialsException("Auth Token not provided");
        }

        String token = authHeader.substring(7);

        Long userId = jwtService.getUserIdFromToken(token);
        UserData user = authService.getMe(userId);

        return ResponseEntity.ok(new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getWorkHours(),
                user.getVacationDays(),
                user.getPersonalTime(),
                user.getRole()
        ));
    }
}
