package com.estore.estore.controller;

import com.estore.estore.dto.request.CategoryRequest;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.exception.ResourceNotFoundException;
import com.estore.estore.model.Category;
import com.estore.estore.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Публичные GET методы
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Защищенные методы (ADMIN)
    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            Category category = categoryService.createCategory(categoryRequest);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            throw new BusinessException(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, categoryRequest);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }
}
