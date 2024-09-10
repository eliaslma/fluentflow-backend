import { Router } from "express";
import WordsMiddleware from "../middlewares/wordsMiddleware";
import WordsController from "../controllers/wordsController";
import path from "path";
import multer from 'multer';
import fs from 'fs';

const wordsRoutes = Router();

const wordsMiddleware = new WordsMiddleware();
const wordsController = new WordsController();

const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadsDir);
    },
    filename: (req, file, callback) => {
        const time = new Date().getTime();
        callback(null, `${time}_${file.originalname}`)
    }
})

const upload = multer({ storage: storage });

wordsRoutes.post("/createcategory", wordsMiddleware.create, wordsController.createCategory);
wordsRoutes.post("/upload", upload.single('file'), wordsController.uploadWords);
wordsRoutes.get("/getwordcategories", wordsController.getCategories)
wordsRoutes.post("/getwords", wordsMiddleware.getWordsFromCategory, wordsController.getWordsFromCategory)
wordsRoutes.post("/savewords", wordsController.saveWordsToLearn);
wordsRoutes.post("/getnew", wordsController.getNewWords);
wordsRoutes.post("/setwordreview", wordsController.setWordToReview);

export { wordsRoutes };
