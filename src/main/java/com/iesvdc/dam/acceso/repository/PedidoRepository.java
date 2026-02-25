package com.iesvdc.dam.acceso.repository;

import com.iesvdc.dam.acceso.model.Pedido;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PedidoRepository extends MongoRepository<Pedido, String> {
    // Buscar pedidos por el id del usuario embebido
    List<Pedido> findByUsuario_Id(String usuarioId);
}
