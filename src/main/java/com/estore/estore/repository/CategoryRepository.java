package com.estore.estore.repository;

import com.estore.estore.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    List<Category> findAllByOrderByNameAsc();
    boolean existsByName(String name);
}