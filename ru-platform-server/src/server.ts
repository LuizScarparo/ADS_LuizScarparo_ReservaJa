import express from 'express';
import dotenv from 'dotenv';
import router from './routes';
import { setupSwagger } from './config/swagger';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));


//configuração swagger
setupSwagger(app);

// Rotas
app.use('/', router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/ru-platform/swagger`);
});
