# Usar Node.js como base
FROM node:23

# Establecer directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos del proyecto al contenedor
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del Analizacódigo
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Exponer el puerto en el que corre la aplicación
EXPOSE 4000

# Comando para iniciar la aplicación
#CMD ["npm", "run", "dev"]
# Correr la app compilada
CMD ["npm", "start"]
