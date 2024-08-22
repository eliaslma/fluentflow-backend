import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../database/prismaClient";
import bcrypt from "bcrypt";

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
            return res.status(201).json({ message: 'Usuário registrado com sucesso.' });
          } catch (error) {

            if(error instanceof Prisma.PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    return res.status(401).json({ error: 'Já existe um usuário com este e-mail.' })
                }
            }

            return res.status(500).json({ error: 'Erro interno do servidor.' });

        }
    }

    async auth(req: Request, res: Response) {

    }
}

export default CustomerController;