package com.pz.backend.rest;

import com.pz.backend.dto.LoginRequest;
import com.pz.backend.dto.LoginResponse;
import com.pz.backend.dto.SignupRequest;
import com.pz.backend.dto.UserResponse;
import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.UserData;
import com.pz.backend.service.AuthService;
import com.pz.backend.service.JwtService;
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
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
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
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("exists")) {
                return ResponseEntity.status(409).body(Map.of("detail", msg));
            }
            return ResponseEntity.status(500).body(Map.of("detail", msg));
        }
    }

    @PostMapping("/login/")
    public ResponseEntity<Object> login(@RequestBody LoginRequest request) {
        try {
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
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("not found")) {
                return ResponseEntity.status(404).body(Map.of("detail", msg));
            }
            return ResponseEntity.status(401).body(Map.of("detail", "Invalid credentials"));
        }
    }

    @GetMapping("/me/")
    public ResponseEntity<Object> me(@RequestHeader(value = "Authorization", required = false) String authHeader){
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            return ResponseEntity.status(401).body(Map.of("detail", "No token provided"));
        }

        String token = authHeader.substring(7);

        try {
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

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("detail", e.getMessage()));
        }
    }
}
