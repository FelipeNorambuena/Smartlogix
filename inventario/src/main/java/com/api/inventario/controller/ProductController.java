package com.api.inventario.controller;

import com.api.inventario.dto.ProductCreateRequest;
import com.api.inventario.dto.PageResponse;
import com.api.inventario.dto.ProductResponse;
import com.api.inventario.dto.ProductUpdateRequest;
import com.api.inventario.service.ProductService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    /*
     * Controller HTTP para productos.
     * Su responsabilidad es recibir solicitudes REST, validar el body con
     * @Valid y delegar la logica de negocio a ProductService.
     */
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public PageResponse<ProductResponse> findAll(
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Retorna productos activos con filtros y paginacion.
        return productService.searchActive(sku, name, category, page, size);
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable UUID id) {
        // Busca por identificador interno UUID.
        return productService.findById(id);
    }

    @GetMapping("/sku/{sku}")
    public ProductResponse findBySku(@PathVariable String sku) {
        // Permite consultar productos usando el codigo comercial visible para usuarios.
        return productService.findBySku(sku);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductCreateRequest request) {
        // Crea el producto y devuelve 201 Created con la ubicacion del nuevo recurso.
        ProductResponse response = productService.create(request);
        return ResponseEntity
                .created(URI.create("/api/products/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public ProductResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody ProductUpdateRequest request) {
        // Actualiza todos los datos editables del producto indicado por id.
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        // Baja logica: marca el producto como inactivo en vez de borrarlo de la BD.
        productService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
