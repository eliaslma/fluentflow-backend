
import { Request, Response } from "express";
import { prismaClient } from "../database/prismaClient";

class WordsController {

    async createCategory(req: Request, res: Response) {

        const { description, total_words } = req.body;

        try {
            await prismaClient.wordCategory.create({ data: {
                description: description,
                total_words: total_words
            } })
            return res.status(200).json({ message: 'Categoria de palavras criada com sucesso!' });

        } catch (error) {
            return res.status(500).json({ error: 'Erro Interno do Servidor' });
        }

    }

}

export default WordsController;