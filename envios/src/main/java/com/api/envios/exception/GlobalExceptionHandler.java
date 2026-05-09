package com.api.envios.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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
        // Recurso no encontrado: envio o tracking inexistente.
        return build(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessRule(
            BusinessRuleException exception,
            HttpServletRequest request) {
        // Regla de negocio invalida: estado no permitido, duplicado, etc.
        return build(HttpStatus.BAD_REQUEST, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        // Errores generados por anotaciones como @NotBlank, @NotNull o @Size.
        Map<String, String> details = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            details.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, "La solicitud contiene datos invalidos", request, details);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request) {
        // Errores de conversion en path/query params, por ejemplo UUID invalido.
        Map<String, String> details = Map.of(
                exception.getName(),
                "Debe ser de tipo " + requiredTypeName(exception));
        return build(HttpStatus.BAD_REQUEST, "Parametro invalido", request, details);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingRequestParameter(
            MissingServletRequestParameterException exception,
            HttpServletRequest request) {
        // Parametros query obligatorios omitidos.
        Map<String, String> details = Map.of(
                exception.getParameterName(),
                "Parametro requerido");
        return build(HttpStatus.BAD_REQUEST, "Falta un parametro requerido", request, details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpServletRequest request) {
        // JSON mal formado o body incompatible con el DTO.
        return build(HttpStatus.BAD_REQUEST, "JSON de solicitud invalido o mal formado", request, Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException exception,
            HttpServletRequest request) {
        // Restricciones de BD: unique, foreign key o checks cuando hay carreras concurrentes.
        return build(HttpStatus.CONFLICT, "La solicitud viola restricciones de integridad de datos", request, Map.of());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request) {
        // Metodo HTTP no permitido para la ruta solicitada.
        Map<String, String> details = Map.of(HttpHeaders.ALLOW, supportedMethods(exception));
        return build(HttpStatus.METHOD_NOT_ALLOWED, "Metodo HTTP no permitido", request, details);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException exception,
            HttpServletRequest request) {
        // Content-Type no soportado por endpoints que esperan JSON.
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Tipo de contenido no soportado", request, Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
            Exception exception,
            HttpServletRequest request) {
        // Fallback para mantener contrato JSON aun ante errores no previstos.
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", request, Map.of());
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

    private String requiredTypeName(MethodArgumentTypeMismatchException exception) {
        if (exception.getRequiredType() == null) {
            return "desconocido";
        }
        return exception.getRequiredType().getSimpleName();
    }

    private String supportedMethods(HttpRequestMethodNotSupportedException exception) {
        String[] supportedMethods = exception.getSupportedMethods();
        if (supportedMethods == null || supportedMethods.length == 0) {
            return "";
        }
        return String.join(", ", supportedMethods);
    }
}
