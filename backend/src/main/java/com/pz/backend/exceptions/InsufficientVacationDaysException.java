package com.pz.backend.exceptions;

public class InsufficientVacationDaysException extends RuntimeException {

    public InsufficientVacationDaysException() {super("Insufficient vacation days");}

    public InsufficientVacationDaysException(String message) {
        super(message);
    }
}
