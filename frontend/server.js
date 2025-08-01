import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

app.post('/api/messages', (req, res) => {
  const { message } = req.body;
  console.log('Получено сообщение:', message);

  res.status(200).json({ status: 'ok', received: message });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
