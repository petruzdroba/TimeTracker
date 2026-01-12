package com.pz.backend.exceptions;

public class NotFoundException extends RuntimeException {
    public NotFoundException() {
        super("Object not found");
    }

    public NotFoundException(Long id) {
        super(String.format("Object with id: %d not found", id));
    }

    public NotFoundException(String className, Long id) {
        super(String.format("%s with id: %d not found", className,id));
    }

    public NotFoundException(String className, String id) {
        super(String.format("%s with id: %s not found", className,id));
    }

    public NotFoundException(String message) {
        super(message);
    }
}
