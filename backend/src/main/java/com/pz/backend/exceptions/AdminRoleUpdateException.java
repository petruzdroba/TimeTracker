package com.pz.backend.exceptions;

public class AdminRoleUpdateException extends RuntimeException {
    AdminRoleUpdateException(){super("Admin role cannot be modified here!");}

    public AdminRoleUpdateException(String message) {
        super(message);
    }
}
