package com.pz.backend.rest;

import com.pz.backend.entity.ErrorResponse;
import com.pz.backend.exceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException exception){
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND.value(), exception.getMessage(), System.currentTimeMillis());

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyExists(AlreadyExistsException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                exception.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(AdminRoleUpdateException.class)
    public ResponseEntity<ErrorResponse> handleAdminRoleUpdate(AdminRoleUpdateException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                exception.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                exception.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(InsufficientVacationDaysException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientVacationDays(
            InsufficientVacationDaysException exception) {

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                exception.getMessage(),
                System.currentTimeMillis()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InsufficientPersonalTimeException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientPersonalTime(
            InsufficientPersonalTimeException exception) {

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                exception.getMessage(),
                System.currentTimeMillis()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        StringBuilder sb = new StringBuilder();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            sb.append(error.getField())
                    .append(": ")
                    .append(error.getDefaultMessage())
                    .append("; ");
        }

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                sb.toString(),
                System.currentTimeMillis()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleJsonParse(HttpMessageNotReadableException ex) {
        Throwable cause = ex.getCause();

        String message;
        if (cause instanceof IllegalArgumentException) {
            message = cause.getMessage();
        } else {
            message = ex.getMessage();
        }

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                message,
                System.currentTimeMillis()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(org.springframework.security.access.AccessDeniedException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(org.springframework.security.core.AuthenticationException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                exception.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
