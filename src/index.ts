import "reflect-metadata";
import "dotenv/config"
import app from "./app";
import { AppDataSource } from "./db";
import { seedDatabase } from "./seed";

async function main(){
    try{
        await AppDataSource.initialize();
        console.log("Database Connected...");
        // Nos aseguramos que la base de datos este inicializada antes de insertar los datos
        if(AppDataSource.isInitialized){
            //await seedDatabase();
        }
        app.listen(3000);
        console.log("Server is listeng on port, http://localhost:3000");
    } catch (error) {
        console.error(error);
    }   
}

main();
