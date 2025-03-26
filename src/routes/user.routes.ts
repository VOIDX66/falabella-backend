import { Router } from "express"
import { register, login} from "../controllers/auth"
import { get_user_profile, editProfile } from "../controllers/user.controllers"
import { authenticate_token } from "../middlewares/middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", authenticate_token, get_user_profile)
router.put("/editProfile/:id", editProfile)

export default router;