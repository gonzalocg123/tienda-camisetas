package com.iesvdc.dam.acceso.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LineaPedidoInputDTO(
        @NotNull(message = "El ID de la camiseta es obligatorio") String camisetaId,

        @NotNull(message = "La cantidad es obligatoria") @Min(value = 1, message = "La cantidad debe ser al menos 1") Integer cantidad) {
}
