package com.iesvdc.dam.acceso.service;

import com.iesvdc.dam.acceso.model.Camiseta;
import com.iesvdc.dam.acceso.repository.CamisetaRepository;
import com.iesvdc.dam.acceso.web.BadRequestException;
import com.iesvdc.dam.acceso.web.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CamisetaService {

    @Autowired
    private CamisetaRepository camisetaRepository;

    public List<Camiseta> findAll() {
        return camisetaRepository.findAll();
    }

    public Camiseta findById(String id) {
        return camisetaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Camiseta no encontrada con id: " + id));
    }

    public Camiseta save(Camiseta camiseta) {
        return camisetaRepository.save(camiseta);
    }

    public Camiseta update(String id, Camiseta camisetaActualizada) {
        Camiseta existente = findById(id);

        existente.setNombre(camisetaActualizada.getNombre());
        existente.setTalla(camisetaActualizada.getTalla());
        existente.setColor(camisetaActualizada.getColor());
        existente.setPrecio(camisetaActualizada.getPrecio());
        existente.setStock(camisetaActualizada.getStock());

        return camisetaRepository.save(existente);
    }

    public void deleteById(String id) {
        if (!camisetaRepository.existsById(id)) {
            throw new NotFoundException("No se puede eliminar. Camiseta no encontrada con id: " + id);
        }
        camisetaRepository.deleteById(id);
    }
}
