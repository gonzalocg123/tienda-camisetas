package com.iesvdc.dam.acceso.repository;

import com.iesvdc.dam.acceso.model.Camiseta;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CamisetaRepository extends MongoRepository<Camiseta, String> {
}
