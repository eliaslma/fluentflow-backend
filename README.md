# Configuração do Projeto com Express, Prisma e Zod

Este projeto utiliza **Express** para a criação do servidor, **Prisma** para a conexão e manipulação do banco de dados, e **Zod** para validação de formulários.

## Requisitos

- Node.js instalado
- Docker instalado
- Yarn ou npm instalado
- MySQL como banco de dados

## Configuração do Projeto

1. **Crie o arquivo `.env` no diretório raiz:**

    No arquivo `.env`, adicione as variáveis de ambiente necessárias, como as credenciais do banco de dados:

    ```env
    DATABASE_URL="mysql://root:root@localhost:3306/mysql_db"
    ```

2. **Crie as tabelas no banco de dados com Prisma:**

    Execute o comando para gerar o cliente Prisma:

    ```bash
    npx prisma generate
    ```

3. **Crie o container MySQL no Docker:**

    Use o comando abaixo para rodar o container MySQL:

    ```bash
    docker run -d --name mysql_db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=mysql_db -p 3306:3306 mysql:latest
    ```

4. **Aplique as migrações no banco de dados:**

    Para aplicar as migrações e configurar o banco de dados:

    ```bash
    npx prisma migrate dev
    ```

5. **Inicie o servidor em ambiente de desenvolvimento:**

    Use o comando:

    ```bash
    yarn dev
    ```

## Testando Endpoints

### Criar Conta

- **Método:** `POST`
- **URL:** `http://localhost:3001/v1/customers/create/`
- **Corpo (JSON):**
  
    ```json
    {
      "name": "Seu Nome",
      "email": "seuemail@exemplo.com",
      "password": "sua_senha"
    }
    ```

### Autenticação

- **Método:** `POST`
- **URL:** `http://localhost:3001/v1/customers/auth/`
- **Corpo (JSON):**
  
    ```json
    {
      "email": "seuemail@exemplo.com",
      "password": "sua_senha"
    }
    ```

## Visualizar o Banco de Dados

Para abrir a interface do Prisma Studio e visualizar as tabelas no navegador, execute o comando:

```bash
npx prisma studio
