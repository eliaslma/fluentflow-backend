import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import router from './src/routes';

dotenv.config();

const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use('/v1', router);

const port = process.env.NODE_LOCAL_PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running.. ${port}`);
});