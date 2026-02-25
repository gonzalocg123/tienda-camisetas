package com.iesvdc.dam.acceso.controller;

import com.iesvdc.dam.acceso.model.Camiseta;
import com.iesvdc.dam.acceso.service.CamisetaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/camisetas")
public class CamisetaController {

    @Autowired
    private CamisetaService camisetaService;

    @GetMapping
    public List<Camiseta> getAll() {
        return camisetaService.findAll();
    }

    @GetMapping("/{id}")
    public Camiseta getById(@PathVariable String id) {
        return camisetaService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Camiseta> create(@Valid @RequestBody Camiseta camiseta) {
        return ResponseEntity.status(HttpStatus.CREATED).body(camisetaService.save(camiseta));
    }

    @PutMapping("/{id}")
    public Camiseta update(@PathVariable String id, @Valid @RequestBody Camiseta camiseta) {
        return camisetaService.update(id, camiseta);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        camisetaService.deleteById(id);
    }
}
