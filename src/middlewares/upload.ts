import multer from "multer";
import path from "path";
import fs from "fs";

// Asegura que exista el directorio de destino
const uploadPath = path.resolve("src/images");
if (!fs.existsSync(uploadPath)) {
	fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const { productId, userId } = req.body;
		const ext = path.extname(file.originalname); // .jpg, .png
		const index = Date.now(); // Para que no se repitan
		const filename = `comment_${productId}_${userId}_${index}${ext}`;
		cb(null, filename);
	},
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
	const allowed = ["image/jpeg", "image/png"];
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Solo se permiten imágenes JPG o PNG"), false);
	}
};

export const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB por archivo
		files: 6,
	},
	fileFilter,
});
