package com.estore.estore.exception;

import org.springframework.http.HttpStatus;

public class DuplicateResourceException extends ApiException {
    public DuplicateResourceException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}