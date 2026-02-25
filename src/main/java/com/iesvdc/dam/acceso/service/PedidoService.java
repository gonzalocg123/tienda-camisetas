package com.iesvdc.dam.acceso.service;

import com.iesvdc.dam.acceso.dto.LineaPedidoInputDTO;
import com.iesvdc.dam.acceso.dto.PedidoInputDTO;
import com.iesvdc.dam.acceso.model.Camiseta;
import com.iesvdc.dam.acceso.model.Pedido;
import com.iesvdc.dam.acceso.model.Usuario;
import com.iesvdc.dam.acceso.repository.CamisetaRepository;
import com.iesvdc.dam.acceso.repository.PedidoRepository;
import com.iesvdc.dam.acceso.repository.UsuarioRepository;
import com.iesvdc.dam.acceso.web.BadRequestException;
import com.iesvdc.dam.acceso.web.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CamisetaRepository camisetaRepository;

    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    public Pedido findById(String id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado con ID: " + id));
    }

    // @Transactional // MongoDB transaction support requires replica set usually.
    // Entorno local docker -> standalone usually no transaction unless configured.
    // We will do logic without explicit transaction annotation for simplicity
    // unless needed.
    public Pedido create(PedidoInputDTO dto) {
        // 1. Validar usuario
        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new BadRequestException("El usuario con ID " + dto.usuarioId() + " no existe"));

        // 2. Construir lista de lineas y snapshot
        List<Pedido.LineaPedido> lineas = new ArrayList<>();

        for (LineaPedidoInputDTO item : dto.items()) {
            Camiseta camiseta = camisetaRepository.findById(item.camisetaId())
                    .orElseThrow(
                            () -> new BadRequestException("La camiseta con ID " + item.camisetaId() + " no existe"));

            if (camiseta.getStock() < item.cantidad()) {
                throw new BadRequestException("Stock insuficiente para la camiseta: " + camiseta.getNombre() +
                        ". Solicitado: " + item.cantidad() + ", Disponible: " + camiseta.getStock());
            }

            // 3. Actualizar stock
            camiseta.setStock(camiseta.getStock() - item.cantidad());
            camisetaRepository.save(camiseta);

            // 4. Crear linea embebida
            Pedido.LineaPedido linea = new Pedido.LineaPedido(
                    camiseta.getId(),
                    camiseta.getNombre(),
                    camiseta.getTalla(),
                    camiseta.getPrecio(),
                    item.cantidad());
            lineas.add(linea);
        }

        // 5. Crear pedido
        Pedido pedido = new Pedido();
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setUsuario(new Pedido.UsuarioSnapshot(usuario.getId(), usuario.getNombre(), usuario.getEmail()));
        pedido.setCamisetas(lineas);

        return pedidoRepository.save(pedido);
    }

    public void deleteById(String id) {
        if (!pedidoRepository.existsById(id)) {
            throw new NotFoundException("Pedido no encontrado");
        }
        pedidoRepository.deleteById(id);
    }
}
