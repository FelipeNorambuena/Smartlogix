package com.api.inventario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InventarioApplication {

	/*
	 * Punto de entrada del microservicio de inventario.
	 * Spring Boot levanta el contexto, registra controllers, services,
	 * repositories y deja disponible la API HTTP.
	 */
	public static void main(String[] args) {
		SpringApplication.run(InventarioApplication.class, args);
	}

}
