package com.indentity.identity_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IdentityAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(IdentityAppApplication.class, args);
	}

}
