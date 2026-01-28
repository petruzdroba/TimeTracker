package com.pz.backend.exceptions;

public class InsufficientPersonalTimeException extends RuntimeException {
    public InsufficientPersonalTimeException(String message) {
        super(message);
    }
}
