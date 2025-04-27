import express from "express";
import morgan from "morgan";
import cors from "cors";
import user_routes from "./routes/user.routes"
import product_routes from "./routes/product.routes"
import cart_routes from "./routes/cart.routes"
import favorite_routes from "./routes/favorite.routes"
import path from "path";

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


// Servir archivos estáticos desde la carpeta "images"
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(user_routes);
app.use(product_routes);
app.use(cart_routes);
app.use(favorite_routes);


export default app;