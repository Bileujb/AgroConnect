package br.com.agroconnect;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ErroHandler {
    private static final Logger log = LoggerFactory.getLogger(ErroHandler.class);
    @ExceptionHandler(ApiException.class)
    ResponseEntity<?> negocio(ApiException erro) {
        return ResponseEntity.status(erro.status).body(Map.of("mensagem", erro.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validar(MethodArgumentNotValidException erro) {
        var mensagens = erro.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage()).distinct().toList();
        return ResponseEntity.badRequest().body(Map.of("mensagem", String.join("\n", mensagens)));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<?> formato(Exception erro) {
        return ResponseEntity.badRequest().body(Map.of("mensagem", "Dados inválidos. Confira os campos informados."));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> integridade(DataIntegrityViolationException erro) {
        return ResponseEntity.status(409).body(Map.of("mensagem", "A operação entra em conflito com os dados existentes. Atualize a tela e tente novamente."));
    }
    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<?> banco(DataAccessException erro) {
        log.error("Falha de acesso ao banco: {}", erro.getClass().getSimpleName());
        return ResponseEntity.status(503).body(Map.of("mensagem", "Banco indisponível. Confira a conexão e a instalação do SQL do AgroConnect."));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<?> inesperado(Exception erro) {
        log.error("Erro inesperado na API", erro);
        return ResponseEntity.internalServerError().body(Map.of("mensagem", "Ocorreu uma falha. Tente novamente."));
    }
}
