import { Router } from "express"
import { register, login} from "../controllers/auth"
import { get_user_profile, editProfile, deleteAccount, addAddress, toggleFavoriteAddress, deleteAddress, getUserAddresses } from "../controllers/user.controllers"
import { forgotPassword, verifyCodeAndResetPassword, sendVerificationCodeForPurchase, verifyPurchaseCodeAndGenerateToken } from "../controllers/auth"
import { authenticate_token } from "../middlewares/middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", authenticate_token, get_user_profile)
router.put("/editProfile/:id", editProfile)
router.delete("/deleteAccount", deleteAccount) // Recibe userId
router.post("/forgot_password", forgotPassword); // Recibe email
router.post("/verify_reset_code", verifyCodeAndResetPassword); // Recibe email, code y la nueva contraseña
router.post("/send_code_purchase", sendVerificationCodeForPurchase); // Recibe email
router.post("/verify_purchase_code", verifyPurchaseCodeAndGenerateToken); // Recibe email, code
router.post("/add_address", addAddress) // Recibe address y userId
router.patch("/favorite_address", toggleFavoriteAddress) // Recibe addressId y userId
router.delete("/delete_address", deleteAddress) // Recibe addressId y userId
router.post("/get_addresses", getUserAddresses) // Recibe userId
export default router;