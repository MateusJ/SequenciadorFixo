const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Importando o CORS

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:8080",  // Permite conexões apenas de http://127.0.0.1:8080
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// Armazenando mensagens dos emissores
let mensagens = [];

// Middleware para ler JSON
app.use(express.json());

// Ativando o CORS para permitir requisições de qualquer origem
app.use(cors());  // Habilita CORS para todos os domínios

// Endpoint para emissores enviarem mensagens
app.post('/enviar', (req, res) => {
    console.log('Requisição recebida:', req.body);
    const { mensagem, emissor } = req.body;
    
    if (!mensagem || !emissor) {
        return res.status(400).send({ error: 'Mensagem e emissor são obrigatórios.' });
    }
    
    // Adiciona a mensagem com o tempo de chegada (para ordenação)
    mensagens.push({ mensagem, emissor, timestamp: Date.now() });

    res.status(200).send({ status: 'Mensagem recebida e aguardando sequenciamento.' });
});

// Enviar as mensagens para o frontend a cada 5 segundos
setInterval(() => {
    if (mensagens.length > 0) {
        const mensagensSequenciadas = mensagens.sort((a, b) => a.timestamp - b.timestamp);
        io.emit('mensagens', mensagensSequenciadas); // Envia para todos os clientes conectados
        mensagens = []; // Limpa a lista após envio
    }
}, 10000); // Intervalo de 5 segundos

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});
