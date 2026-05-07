package com.smartlogix.auth.controller;

import com.smartlogix.auth.dto.RoleUpdateRequest;
import com.smartlogix.auth.dto.UserCreateRequest;
import com.smartlogix.auth.dto.UserResponse;
import com.smartlogix.auth.dto.UserStatusUpdateRequest;
import com.smartlogix.auth.dto.UserUpdateRequest;
import com.smartlogix.auth.service.UserService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    /*
     * Endpoints administrativos.
     * El rol ADMIN se valida con los roles incluidos en el JWT.
     */
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> findAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable UUID id) {
        return userService.findById(id);
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.create(request);
        return ResponseEntity
                .created(URI.create("/users/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public UserResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        return userService.update(id, request);
    }

    @PatchMapping("/{id}/roles")
    public UserResponse updateRoles(
            @PathVariable UUID id,
            @Valid @RequestBody RoleUpdateRequest request) {
        return userService.updateRoles(id, request);
    }

    @PatchMapping("/{id}/status")
    public UserResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        return userService.updateStatus(id, request);
    }
}
