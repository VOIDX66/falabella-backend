import express from "express";
import morgan from "morgan";
import cors from "cors";
import user_routes from "./routes/user.routes"
import product_routes from "./routes/product.routes"
import path from "path";

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(user_routes);
app.use(product_routes);
// Servir archivos estáticos desde la carpeta "images"
app.use("/images", express.static(path.join(__dirname, "images")));

export default app;