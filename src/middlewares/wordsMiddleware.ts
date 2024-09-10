import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from "zod";

class WordsMiddleware {

    create(req: Request, res: Response, next: NextFunction) {
        const { description, total_words } = req.body;

        const schema = z.object({
            description: z.string().min(8, { message: 'A descricao deve ter pelo menos 8 caracteres.' }),
            total_words: z.number({ message: 'O total de palavras da categoria e obrigatorio'})
        });

        try {
            schema.parse({ description, total_words });
            next();
        } catch (error) {

            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.errors });
            }

            return res.status(500).json({ error: 'Internal Server Error' });

        }
    }

    getWordsFromCategory(req: Request, res: Response, next: NextFunction) {
        const { customer_id, word_category_id, take, skip } = req.body;

        const schema = z.object({
            customer_id: z.string({message: 'Faltando customer id'}),
            word_category_id: z.number({ message: 'Categoria da palavra faltando' }),
            take: z.number({ message: 'Quantidade de palavras que deseja'}),
            skip: z.number({ message: 'Quantidade de palavras que deseja pular'})
        });

        try {
            schema.parse({ customer_id, word_category_id, take, skip });
            next();
        } catch (error) {

            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.errors });
            }

            return res.status(500).json({ error: 'Internal Server Error' });

        }
    }

}


export default WordsMiddleware;