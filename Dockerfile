# Usar Node.js como base
FROM node:23

# Establecer directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos del proyecto al contenedor
COPY package.json package-lock.json ./

# Instalar dependencias y construir
RUN npm install && npm run build

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto en el que corre la aplicación
EXPOSE 4000

# Correr la app compilada
CMD ["npm", "start"]
