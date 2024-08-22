import { Router } from "express";
const router = Router();
import { customerRoutes } from "./customerRoutes";

router.use("/customers", customerRoutes);

export default router;