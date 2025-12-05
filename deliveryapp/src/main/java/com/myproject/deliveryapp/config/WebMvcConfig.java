package com.myproject.deliveryapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the absolute path to the uploads directory
        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        String uploadPathString = uploadPath.toUri().toString();
        
        // Serve static files from the uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPathString);
    }
}
