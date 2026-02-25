package com.iesvdc.dam.acceso.controller;

import com.iesvdc.dam.acceso.dto.PedidoInputDTO;
import com.iesvdc.dam.acceso.model.Pedido;
import com.iesvdc.dam.acceso.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @GetMapping
    public List<Pedido> getAll() {
        return pedidoService.findAll();
    }

    @GetMapping("/{id}")
    public Pedido getById(@PathVariable String id) {
        return pedidoService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Pedido> create(@Valid @RequestBody PedidoInputDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.create(dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        pedidoService.deleteById(id);
    }
}
