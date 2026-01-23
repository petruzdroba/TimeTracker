package com.pz.backend.rest;

import com.pz.backend.dto.UserPutRequest;
import com.pz.backend.dto.UserResponse;
import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.AdminRoleUpdateException;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserRestController {

    private final UserService userService;

    public UserRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user")
    public List<UserResponse> getAll() {
        return userService.get()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getWorkHours(),
                        user.getVacationDays(),
                        user.getPersonalTime(),
                        user.getRole()
                ))
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or @userSecurity.canAccessUser(#id, authentication)")
    @GetMapping("/user/{id}")
    public UserResponse findById(@PathVariable Long id) throws NotFoundException {
        UserData data = userService.findById(id);

        return new UserResponse(
                data.getId(),
                data.getName(),
                data.getEmail(),
                data.getWorkHours(),
                data.getVacationDays(),
                data.getPersonalTime(),
                data.getRole()
        );
    }

    @PreAuthorize("hasRole('ADMIN') or  @userSecurity.canAccessUser(#email, authentication)")
    @GetMapping("/user/email/{email}")
    public UserResponse findByEmail(@PathVariable String email) throws NotFoundException {
        UserData data = userService.findByEmail(email);

        return new UserResponse(
                data.getId(),
                data.getName(),
                data.getEmail(),
                data.getWorkHours(),
                data.getVacationDays(),
                data.getPersonalTime(),
                data.getRole()
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/user")
    public UserResponse put(@Valid @RequestBody UserPutRequest request) throws NotFoundException, AdminRoleUpdateException {
        UserData data = userService.put(
                request.id(),
                request.name(),
                request.email(),
                request.workHours(),
                request.vacationDays(),
                request.personalTime(),
                request.role()
        );

        return new UserResponse(
                data.getId(),
                data.getName(),
                data.getEmail(),
                data.getWorkHours(),
                data.getVacationDays(),
                data.getPersonalTime(),
                data.getRole()
        );
    }
}
