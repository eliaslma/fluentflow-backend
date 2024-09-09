import { Router } from "express";
const customerRoutes = Router();
import CustomerController from "../controllers/customerController";
import CustomerMiddleware from "../middlewares/customerMiddleware";

const customerController = new CustomerController();
const customerMiddleware = new CustomerMiddleware();

// Unauthenticated Routes
customerRoutes.post("/create", customerMiddleware.create, customerController.create);
customerRoutes.post("/auth", customerMiddleware.auth, customerController.auth)

export { customerRoutes };