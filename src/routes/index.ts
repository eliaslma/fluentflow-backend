import { Router } from "express";
const router = Router();
import { customerRoutes } from "./customer.routes";
import { wordsRoutes } from "./words.routes";

router.use("/customers", customerRoutes);
router.use("/words", wordsRoutes);

export default router;