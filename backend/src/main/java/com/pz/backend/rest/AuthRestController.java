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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

//    @PostMapping("/signup")
//    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
//        return ResponseEntity.ok();
//    }

    @PostMapping("/login")
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
            return ResponseEntity.status(401).body(null);
        }
    }
}
