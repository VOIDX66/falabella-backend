import { initializeDatabase, cleanDatabase, AppDataSource } from "./test_setup"; // Ajusta la ruta si es necesario
import request from "supertest";
import app from "../app"; // Asegúrate de que la ruta sea correcta
import { User } from "../entities/user";
import { Category } from "../entities/category";
import { Section } from "../entities/section";
import { Subcategory } from "../entities/subcategory";
import { SectionCategory } from "../entities/sectioncategory";
import { CategorySubcategory } from "../entities/categorysubcategory";
import { Product } from "../entities/product";
import { Cart } from "../entities/cart";
import { CartProduct } from "../entities/cartproduct";
import { FavoriteList } from "../entities/favoritelist";
import { FavoriteProduct } from "../entities/favoriteproduct";
import * as bcrypt from "bcrypt";

const createUser = async (email: string, password: string, phone?: string) => {
    const user = new User();
    user.name = "test name";
    user.lastname = "test lastname";
    user.email = email;
    user.id_type = "CC";
    user.id_number = "1000000000";
    user.phone = phone ?? "3000000000";
    user.password = await bcrypt.hash(password, 10);
    await AppDataSource.getRepository(User).save(user);
};

beforeAll(async () => {
    await initializeDatabase(); // Inicializa la base de datos
});

afterAll(async () => {
    await AppDataSource.destroy(); // Destruye la conexión después de las pruebas
});

beforeEach(async () => {
    await cleanDatabase(); // Limpia la base de datos antes de cada prueba
});

// PRUEBAS PARA EL LOGIN

describe("POST /login", () => {
    it("debe devolver 200 si las credenciales son correctas", async () => {
        await createUser("test@example.com", "hashedPassword");

        const response = await request(app)
            .post("/login")
            .send({ email: "test@example.com", password: "hashedPassword" })
            .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
    });

    it("debe devolver 401 si el email no está registrado", async () => {
        const response = await request(app)
            .post("/login")
            .send({ email: "nonexistent@example.com", password: "hashedPassword" })
            .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "email");
        expect(response.body.errors[0]).toHaveProperty("message", "Invalid credentials");
    });

    it("debe devolver 401 si la contraseña es incorrecta", async () => {
        await createUser("test@example.com", "hashedPassword");

        const response = await request(app)
            .post("/login")
            .send({ email: "test@example.com", password: "wrongPassword" })
            .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "password");
        expect(response.body.errors[0]).toHaveProperty("message", "Invalid credentials");
    });

    it("debe devolver 400 si el email tiene un formato inválido", async () => {
        const response = await request(app)
            .post("/login")
            .send({ email: "invalid-email", password: "hashedPassword" })
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "email");
        expect(response.body.errors[0]).toHaveProperty("message", "Invalid email format");
    });

    it("debe devolver 400 si no se proporciona una contraseña", async () => {
        const response = await request(app)
            .post("/login")
            .send({ email: "test@example.com" }) // Falta la contraseña
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "password");
        expect(response.body.errors[0]).toHaveProperty("message", "Password is required");
    });
});

// PRUEBAS PARA EL REGISTER

describe("POST /register", () => {
    it("debe devolver 201 y crear un usuario si los datos son correctos", async () => {
        const response = await request(app)
            .post("/register")
            .send({
                name: "John",
                lastname: "Doe",
                email: "john.doe@example.com",
                id_type: "CC",
                id_number: "1234567890",
                phone: "3001234567",
                password: "Password123!"
            })
            .set("Accept", "application/json");

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user.email).toBe("john.doe@example.com");
    });

    it("debe devolver 400 si falta algún campo requerido", async () => {
        const response = await request(app)
            .post("/register")
            .send({
                name: "John",
                lastname: "Doe",
                email: "john.doe@example.com",
                // Falta id_type, id_number, phone y password
            })
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "general");
        expect(response.body.errors[0]).toHaveProperty("message", "All fields are required");
    });

    it("debe devolver 400 si el email no es válido", async () => {
        const response = await request(app)
            .post("/register")
            .send({
                name: "John",
                lastname: "Doe",
                email: "invalid-email", // Email incorrecto
                id_type: "CC",
                id_number: "1234567890",
                phone: "3001234567",
                password: "Password123!"
            })
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "email");
        expect(response.body.errors[0]).toHaveProperty("message", "Invalid email format");
    });

    it("debe devolver 400 si el teléfono ya está registrado", async () => {
        await createUser("existing@example.com", "Password123!", "3001234567");

        const response = await request(app)
            .post("/register")
            .send({
                name: "Jane",
                lastname: "Doe",
                email: "jane.doe@example.com",
                id_type: "CC",
                id_number: "1234567891",
                phone: "3001234567", // Teléfono ya registrado
                password: "Password123!"
            })
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "phone");
        expect(response.body.errors[0]).toHaveProperty("message", "Phone already exists");
    });

    it("debe devolver 400 si el email ya está registrado", async () => {
        await createUser("john.doe@example.com", "Password123!");

        const response = await request(app)
            .post("/register")
            .send({
                name: "Jane",
                lastname: "Doe",
                email: "john.doe@example.com", // Email ya registrado
                id_type: "CC",
                id_number: "1234567891",
                phone: "3001234568",
                password: "Password123!"
            })
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "email");
        expect(response.body.errors[0]).toHaveProperty("message", "Email already exists");
    });

    it("debe devolver 400 si la contraseña no cumple con los requisitos", async () => {
        const response = await request(app)
            .post("/register")
            .send({
                name: "John",
                lastname: "Doe",
                email: "john.doe@example.com",
                id_type: "CC",
                id_number: "1234567890",
                phone: "3001234567",
                password: "123" // Contraseña demasiado corta
            })
            .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("field", "password");
        expect(response.body.errors[0]).toHaveProperty("message", "Password must be at least 8 characters long, contain one number, one uppercase letter, one lowercase letter, no spaces, and no special characters like '\\¡¿\"ºª·`´çñÑ, '");
    });
});