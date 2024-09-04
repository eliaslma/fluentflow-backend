import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../database/prismaClient";
import bcrypt, { compare } from "bcrypt";
import { sign } from 'jsonwebtoken';

class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'Usuário não encontrado.',
    INCORRECT_PASSWORD: 'Senha incorreta.',
    INTERNAL_SERVER_ERROR: 'Erro interno do servidor.',
    AUTHENTICATION_ERROR: 'Erro ao realizar a autenticação.',
    EMAIL_ALREADY_EXISTS: 'Já existe um usuário com este e-mail.',
};

// Constantes para Mensagens de Sucesso
const SUCCESS_MESSAGES = {
    USER_REGISTERED: 'Usuário registrado com sucesso.',
};

class CustomerController {

    async create(req: Request, res: Response) {
        const newCustomer = req.body;
        const hashedPassword = await bcrypt.hash(newCustomer.password, 8);

        try {
            await prismaClient.customers.create({
                data: {
                    name: newCustomer.name,
                    email: newCustomer.email.toLowerCase(),
                    password: hashedPassword,
                }
            })
            return res.status(201).json({ message: SUCCESS_MESSAGES.USER_REGISTERED });
          } catch (error) {

            if(error instanceof Prisma.PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    return res.status(401).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS })
                }
            }

            return res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });

        }
    }

    async auth(req: Request, res: Response) {

        const { email, password } = req.body;

        try {
            const user = await prismaClient.customers.findUnique({
                where: {
                    email: email
                }
            });

            if (!user) {
                throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND);
            }

            const passwordMatch = await compare(password, user.password)

            if (!passwordMatch) {
                throw new AuthError(ERROR_MESSAGES.INCORRECT_PASSWORD);
            }

            const token = sign({}, "edf6f48a8cb5d68abd2df62e02c72b82", { subject: user.id, expiresIn: "365d" })

            return res.status(200).json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                token 
            })
            
        } catch (error) {
            if (error instanceof Prisma.PrismaClientInitializationError) {
                return res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
            }

            if (error instanceof AuthError) {
                return res.status(400).json({error: error.message});
            }
    
            return res.status(500).json({ error: ERROR_MESSAGES.AUTHENTICATION_ERROR })
        }
    }
}

export default CustomerController;