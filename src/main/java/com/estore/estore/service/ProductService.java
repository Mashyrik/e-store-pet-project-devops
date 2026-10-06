package com.estore.estore.service;

import com.estore.estore.dto.request.ProductRequest;
import com.estore.estore.model.Category;
import com.estore.estore.model.Product;
import com.estore.estore.repository.CategoryRepository;
import com.estore.estore.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // Старый метод для обратной совместимости
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByCreatedAtDesc();
    }

    // НОВЫЙ: Пагинация всех товаров
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    // НОВЫЙ: Пагинация с поиском
    public Page<Product> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProductsPage(query, pageable);
    }

    // НОВЫЙ: Пагинация товаров по категории
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getAvailableProducts() {
        return productRepository.findByStockQuantityGreaterThan(0);
    }

    public Product createProduct(ProductRequest productRequest) {
        if (productRepository.existsByModel(productRequest.getModel())) {
            throw new RuntimeException("Product with model '" + productRequest.getModel() + "' already exists");
        }

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productRequest.getCategoryId()));

        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setModel(productRequest.getModel());
        product.setCategory(category);
        product.setStockQuantity(productRequest.getStockQuantity());

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest productRequest) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (!product.getCategory().getId().equals(productRequest.getCategoryId())) {
            Category category = categoryRepository.findById(productRequest.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + productRequest.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setModel(productRequest.getModel());
        product.setStockQuantity(productRequest.getStockQuantity());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        productRepository.delete(product);
    }
}
