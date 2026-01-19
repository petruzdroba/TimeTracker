package com.pz.backend.rest;

import com.pz.backend.dto.UserResponse;
import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserRestController {

    private final UserService userService;

    public UserRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable Long id) throws NotFoundException{
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

    @GetMapping("/email/{email}")
    public UserResponse findByEmail(@PathVariable String email) throws NotFoundException{
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
}
