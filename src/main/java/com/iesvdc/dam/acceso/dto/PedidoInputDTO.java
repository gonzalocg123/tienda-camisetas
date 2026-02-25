package com.iesvdc.dam.acceso.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PedidoInputDTO(
        @NotNull(message = "El ID de usuario es obligatorio") String usuarioId,

        @NotEmpty(message = "El pedido debe tener al menos una camiseta") List<LineaPedidoInputDTO> items) {
}
