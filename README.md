# Proyecto Falabella Clone
Este proyecto es una réplica de la plataforma Falabella, construida con tecnologías modernas. Aquí te dejamos una guía paso a paso para clonar el repositorio, cambiar a la rama `backend`, y ejecutar el entorno de desarrollo usando Docker.

## Pasos para ejecutar el proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/danipel/falabella-clone.git
```
### 2. Navegar al directorio del proyecto
```bash
cd falabella-clone
```
### 3. Cambiar a la rama `backend`
```bash
git checkout backend
```
### 4. Construir y ejecutar el contenedor de Docker, recuerda que debes tener instalado docker y docker-compose
```bash
docker-compose up --build -d
```
### 5. Verificar que los contenedores están en funcionamiento
```bash
docker ps
```
### 6. Detener los contenedores
```bash
docker-compose down
```



