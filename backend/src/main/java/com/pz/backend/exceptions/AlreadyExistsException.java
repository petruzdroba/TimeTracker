package com.pz.backend.exceptions;

public class AlreadyExistsException extends RuntimeException {

    public AlreadyExistsException() {
        super("Object already exists");
    }

    public AlreadyExistsException(Long id) {
        super(String.format("Object with id: %d already exists", id));
    }

    public AlreadyExistsException(String className, long id){
        super(String.format("%s with id: %d already exists",className, id));
    }

    public AlreadyExistsException(String className, String id){
        super(String.format("%s with id: %s already exists",className, id));
    }

    public AlreadyExistsException(String message) {
        super(message);
    }
}
