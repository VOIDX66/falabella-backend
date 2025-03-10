import express from "express";
import morgan from "morgan";
import cors from "cors";
import user_routes from "./routes/user.routes"
import product_routes from "./routes/product.routes"

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(user_routes);
app.use(product_routes);

export default app;