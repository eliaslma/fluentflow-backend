
import { Request, Response } from "express";
import { prismaClient } from "../database/prismaClient";
import { createReadStream, unlinkSync } from 'fs';
import csv from 'csv-parser';

interface WordStudyMap {
    [words_id: string]: string;
}

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

    async uploadWords(req: Request, res: Response) {

        const { word_category_id } = req.body;

        const wordCategory = await prismaClient.wordCategory.findFirst({
            where: {
                id: Number(word_category_id)
            }
        })

        if (!wordCategory) {
            return res.status(400).json({ error: "Lista de palavras nao encontrada!" });
        }

        if (req.file) {

            const filePath = req.file.path;
            let errorOccurred = false;
            const readStream = createReadStream(filePath);

            readStream
                .pipe(csv())
                .on('data', async (row) => {
                    try {
                        if (!errorOccurred) {
                            await prismaClient.words.create({
                                data: {
                                    word: row.word,
                                    translation: row.translation,
                                    word_category_id: Number(word_category_id)
                                }
                            });
                        }
                    } catch (e) {
                        errorOccurred = true;
                    }
                })
                .on('end', async () => {
                    unlinkSync(filePath);
                    if (!errorOccurred) {
                        return res.status(200).json({ message: "Dados da planilha inseridos com sucesso!" });
                    }
                    return res.status(400).json({ error: 'Erro ao importar palavra do arquivo CSV' });
                });
        }
    }

    async getCategories(req: Request, res: Response){
        try {
            const categories = await prismaClient.wordCategory.findMany();
            return res.status(200).json({ categories });

        } catch (error) {
            return res.status(500).json({ error: 'Erro Interno do Servidor' });
        }
    }

    async getWordsFromCategory(req: Request, res: Response) {

        const { customer_id, word_category_id, take, skip } = req.body;

        const lte = take + skip;

        const wordListResults = await prismaClient.words.findMany({
            where: {
                word_category_id: word_category_id
            },
            select: {
                id: true,
                word: true
            },
            take: take,
            skip: skip,
        })

        const wordStudyResults = await prismaClient.wordStudy.findMany({
            where: {
                customer_id: customer_id,
                words_id: {
                    gte: Number(skip),
                    lte: lte
                },
            }
        });

        const wordStudyMap = wordStudyResults.reduce<WordStudyMap>((acc, curr) => {
            if (curr.words_id !== null) {
                acc[curr.words_id] = curr.status;
            }
            return acc;
        }, {});

        const wordListWithStatus = wordListResults.map(word => {
            const status = wordStudyMap[word.id];
            return { ...word, status };
        });

        return res.status(200).json(wordListWithStatus);
    }

}

export default WordsController;