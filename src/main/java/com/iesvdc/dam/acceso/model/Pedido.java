package com.iesvdc.dam.acceso.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "pedidos")
public class Pedido {
    @Id
    private String id;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime fechaPedido;

    private UsuarioSnapshot usuario;

    private List<LineaPedido> camisetas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioSnapshot {
        private String id;
        private String nombre;
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LineaPedido {
        private String camisetaId;
        private String nombre;
        private String talla;
        private Double precio;
        private Integer cantidad;
    }
}
