import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from "zod";

class CustomerMiddleware {

    create(req: Request, res: Response, next: NextFunction) {
        const { name, email, password } = req.body;

        const schema = z.object({
            name: z.string().refine(value => /^[A-Za-z\s]+$/.test(value)),
            email: z.string().email({ message: 'Formato de e-mail inválido.' }),
            password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
        });

        try {
            schema.parse({ name, email, password });
            next();
        } catch (error) {

            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.errors });
            }

            return res.status(500).json({ error: 'Internal Server Error' });

        }
    }

    auth(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        const schema = z.object({
            email: z.string().email({ message: 'Formato de e-mail inválido.' }),
            password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
        });

        try {
            schema.parse({ email, password });
            next();
        } catch (error) {

            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            return res.status(500).json({ error: "ERR_INTERNAL_SERVER" });
        }
    }

}


export default CustomerMiddleware;