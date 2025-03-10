import { Router } from "express"
import { register, login} from "../controllers/auth"
import { get_user_profile } from "../controllers/user.controllers"
import { authenticate_token } from "../middlewares/middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", authenticate_token, get_user_profile)

export default router;