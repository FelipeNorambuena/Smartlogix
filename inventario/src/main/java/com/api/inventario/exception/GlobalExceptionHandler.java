package com.api.inventario.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * Manejador global de errores.
     * Evita repetir try/catch en controllers y asegura una respuesta JSON
     * consistente para todos los errores conocidos.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request) {
        // Recurso no encontrado: producto o inventario inexistente.
        return build(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessRule(
            BusinessRuleException exception,
            HttpServletRequest request) {
        // Regla de negocio invalida: SKU duplicado, stock inconsistente, etc.
        return build(HttpStatus.BAD_REQUEST, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        // Errores generados por anotaciones como @NotBlank, @NotNull o @Min.
        Map<String, String> details = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            details.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, "La solicitud contiene datos invalidos", request, details);
    }

    private ResponseEntity<ApiErrorResponse> build(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> details) {
        // Construye el contrato JSON comun usado por todos los handlers.
        ApiErrorResponse response = new ApiErrorResponse(
                OffsetDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                details);
        return ResponseEntity.status(status).body(response);
    }
}
