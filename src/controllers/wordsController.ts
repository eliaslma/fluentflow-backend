
import { Request, Response } from "express";
import { prismaClient } from "../database/prismaClient";
import { createReadStream, unlinkSync } from 'fs';
import csv from 'csv-parser';
import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";

interface WordStudyMap {
    [words_id: string]: string;
}

type WordData = {
    word_id: number;
    user_id: number;
    status: "NEW" | "LEARNED" | "STUDYING"
};

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
                word: true,
            },
            take: take,
            skip: skip,
        })

        const wordStudyResults = await prismaClient.wordStudy.findMany({
            where: {
                customer_id: customer_id,
                words_id: {
                    gte: skip,
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

    async saveWordsToLearn(req: Request, res: Response) {

        const { customer_id, words, status } = req.body;

        try {
            await prismaClient.wordStudy.createMany({
                data: words.map(word => ({
                    customer_id: customer_id,
                    words_id: word.id,
                    status: status
                }))
            });
            return res.status(200).json({ message: 'Palavra salva com sucesso!' });
        } catch (e) {
            return res.status(500).json({ error: 'Erro Interno do Servidor' });
        }

    }

    async getNewWords(req: Request, res: Response) {

        const { customer_id } = req.body;

        try {
            const wordsData = await prismaClient.wordStudy.findMany({
                where: {
                    customer_id: customer_id,
                    status: 'NEW',
                },
                select: {
                    words_id: true,
                    words: {
                        select: {
                            word: true,
                            translation: true,
                            portuguese_context: true,
                            english_example: true,
                            portuguese_example: true
                            
                        }
                    }
                }
            })

            return res.status(200).json(wordsData);

        } catch (e) {
            return res.status(500).json({ error: 'Erro Interno do Servidor' });
        }
    }

    async setWordToReview(req: Request, res: Response) {

        const { customer_id, words_id } = req.body;
        
        try {  
            if (customer_id && words_id) {
                await prismaClient.wordStudy.update({
                    where: {
                        words_id_customer_id: {
                            words_id: words_id,
                            customer_id: customer_id
                        }
                    },
                    data: {
                        status: 'STUDYING',
                        review_date: new Date()
                    }
                })

                return res.status(200).json({ message: 'Palavra adicionada a revisao com sucesso!' });

            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: 'Erro Interno do Servidor' });
        }

    }

    async getWordToReview(req: Request, res: Response) {
        const { customer_id } = req.body;
        try {
            if (customer_id) {
                const wordsToReview = await prismaClient.wordStudy.findMany({
                    where: {
                        customer_id: customer_id,
                        status: 'STUDYING',
                        review_date: {
                            lte: new Date()
                        }
                    },
                    select: {
                        id: true,
                        repetitions: true,
                        previous_interval: true,
                        previous_ease_factor: true,
                        words: {
                            select: {
                                word: true,
                                translation: true,
                                portuguese_context: true,
                                english_example: true,
                                portuguese_example: true,
                            }
                        }
                    }
                });
    
                return res.status(200).json(wordsToReview);
            } else {
                return res.status(400).json({ error: 'customer_id é necessário' });
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: 'Erro Interno do Servidor' });
        }
    }

    async setDataReview (req: Request, res: Response) {
        const { data, words_id, customer_id } = req.body;

        console.log(words_id)

        if(data.interval){

            const now = new Date();
            let reviewDate = addDays(now, data.interval);
            reviewDate = setHours(setMinutes(setSeconds(setMilliseconds(reviewDate, 0), 0), 0), 6);

            await prismaClient.wordStudy.update({
                where: {
                    id: words_id,
                    customer_id: customer_id
                },
                data: {
                    previous_interval: data.interval,
                    previous_ease_factor: data.easeFactor,
                    repetitions: data.repetitions,
                    review_date: reviewDate
                }
            })

            return res.status(200).json({ message: 'Sucesso!'});
        }

    }

    async getLearnedWords(req: Request, res: Response) {

        const { customer_id } = req.body;

        try {
            const learnedCount = await prismaClient.wordStudy.count({
                where: {
                    customer_id: customer_id,
                    status: 'LEARNED',
                }
            });

            const newCount = await prismaClient.wordStudy.count({
                where: {
                    customer_id: customer_id,
                    status: 'NEW',
                }
            });

            const learningCount = await prismaClient.wordStudy.count({
                where: {
                    customer_id: customer_id,
                    status: 'STUDYING',
                }
            })

            return res.status(200).json({ learnedCount, newCount, learningCount });

        } catch (e) {
            return res.status(500).json({ error: 'Erro Interno do Servidor' });
        }
    }

}

export default WordsController;