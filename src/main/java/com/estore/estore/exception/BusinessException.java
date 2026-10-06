package com.estore.estore.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends ApiException {
    public BusinessException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}