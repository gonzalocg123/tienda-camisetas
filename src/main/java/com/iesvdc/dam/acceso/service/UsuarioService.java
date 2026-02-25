package com.iesvdc.dam.acceso.service;

import com.iesvdc.dam.acceso.model.Usuario;
import com.iesvdc.dam.acceso.repository.UsuarioRepository;
import com.iesvdc.dam.acceso.web.BadRequestException;
import com.iesvdc.dam.acceso.web.ConflictException;
import com.iesvdc.dam.acceso.web.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Usuario findById(String id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con id: " + id));
    }

    public Usuario add(Usuario usuario) {
        // Check email unique
        Optional<Usuario> existing = usuarioRepository.findByEmailIgnoreCase(usuario.getEmail());
        if (existing.isPresent()) {
            throw new ConflictException("El email ya está registrado: " + usuario.getEmail());
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario update(String id, Usuario usuarioActualizado) {
        Usuario existente = findById(id);

        // Verifica si cambia el email y si el nuevo ya existe en otro usuario
        if (!existente.getEmail().equalsIgnoreCase(usuarioActualizado.getEmail())) {
            Optional<Usuario> other = usuarioRepository.findByEmailIgnoreCase(usuarioActualizado.getEmail());
            if (other.isPresent()) {
                throw new ConflictException("El email ya está uso por otro usuario");
            }
        }

        existente.setNombre(usuarioActualizado.getNombre());
        existente.setEmail(usuarioActualizado.getEmail());
        // Password solo si viene informado, sino se mantiene (lógica simple)
        if (usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().isBlank()) {
            existente.setPassword(usuarioActualizado.getPassword());
        }
        existente.setRol(usuarioActualizado.getRol());

        return usuarioRepository.save(existente);
    }

    public void deleteById(String id) {
        if (!usuarioRepository.existsById(id)) {
            throw new NotFoundException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

}
