package br.com.agroconnect;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    final HttpStatus status;
    public ApiException(HttpStatus status, String mensagem) { super(mensagem); this.status = status; }
    public static ApiException invalido(String mensagem) { return new ApiException(HttpStatus.BAD_REQUEST, mensagem); }
    public static ApiException proibido() { return new ApiException(HttpStatus.FORBIDDEN, "Você não tem permissão para esta operação."); }
    public static ApiException naoEncontrado() { return new ApiException(HttpStatus.NOT_FOUND, "Registro não encontrado."); }
    public static ApiException conflito(String mensagem) { return new ApiException(HttpStatus.CONFLICT, mensagem); }
}
