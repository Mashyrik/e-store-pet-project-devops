package com.estore.estore.model;

public enum Role {
    ROLE_USER, ROLE_ADMIN;

    // Добавим явный toString для надежности
    @Override
    public String toString() {
        return this.name();
    }
}
