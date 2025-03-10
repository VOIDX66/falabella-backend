# Proyecto Falabella Clone
Este proyecto es una réplica de la plataforma Falabella, construida con tecnologías modernas. Aquí te dejamos una guía paso a paso para clonar el repositorio y ejecutar el entorno de desarrollo usando Docker.

## Pasos para ejecutar el proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/VOIDX66/falabella-backend.git
```
### 2. Navegar al directorio del proyecto
```bash
cd falabella-backend
```
### 3. Construir y ejecutar el contenedor de Docker, recuerda que debes tener instalado docker y docker-compose
```bash
docker-compose up --build -d
```
### 4. Verificar que los contenedores están en funcionamiento
```bash
docker ps
```
### 5. Detener los contenedores
```bash
docker-compose down
```



