import { Router } from "express";
import WordsMiddleware from "../middlewares/wordsMiddleware";
import WordsController from "../controllers/wordsController";

const wordsRoutes = Router();

const wordsMiddleware = new WordsMiddleware();
const wordsController = new WordsController();

wordsRoutes.post("/createcategory", wordsMiddleware.create, wordsController.createCategory);

export { wordsRoutes };