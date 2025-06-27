const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Armazenando mensagens dos emissores
let mensagens = [];

// Middleware para ler JSON
app.use(express.json());

// Endpoint para emissores enviarem mensagens
app.post('/enviar', (req, res) => {
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
}, 5000); // Intervalo de 5 segundos

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});
