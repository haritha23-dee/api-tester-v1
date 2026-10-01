//auth route setup
import { Router } from "express";
import {register, login, refresh, logout, me} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/me", authenticate, me);

export default router;