package com.pz.backend.service;

import com.pz.backend.entity.Role;
import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.AdminRoleUpdateException;
import com.pz.backend.exceptions.NotFoundException;

import java.util.List;

public interface UserService {

    List<UserData> get();

    UserData findById(Long id) throws NotFoundException;

    UserData findByEmail(String email) throws NotFoundException;

    UserData put(Long id, String name, String email, int workHours, int vacationDays, int personalTime, Role role) throws NotFoundException, AdminRoleUpdateException;
}
