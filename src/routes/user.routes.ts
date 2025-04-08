import { Router } from "express"
import { register, login} from "../controllers/auth"
import { get_user_profile, editProfile, deleteAccount } from "../controllers/user.controllers"
import { forgotPassword, verifyCodeAndResetPassword } from "../controllers/auth"
import { authenticate_token } from "../middlewares/middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", authenticate_token, get_user_profile)
router.put("/editProfile/:id", editProfile)
router.delete("/deleteAccount", deleteAccount) // Recibe userId
router.post("/forgot_password", forgotPassword); // Recibe email
router.post("/verify_reset_code", verifyCodeAndResetPassword); // Recibe email, code y la nueva contraseña
export default router;