package com.estore.estore.service;

import com.estore.estore.dto.request.CategoryRequest;
import com.estore.estore.model.Category;
import com.estore.estore.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(CategoryRequest categoryRequest) {
        // Проверяем, нет ли уже категории с таким именем
        if (categoryRepository.existsByName(categoryRequest.getName())) {
            throw new RuntimeException("Category with name '" + categoryRequest.getName() + "' already exists");
        }

        // Создаем категорию из DTO
        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());

        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, CategoryRequest categoryRequest) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
}
