const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Importando o CORS

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://10.1.1.108:8080', // Permitir que a origem do frontend acesse o backend
        methods: ['GET', 'POST'], // Permite métodos GET e POST
        allowedHeaders: ['Content-Type'], // Cabeçalhos permitidos
        credentials: true, // Permite o envio de credenciais (se necessário)
    }
});

app.use(cors({
    origin: 'http://10.1.1.108:8080', // Permitir o frontend com esse IP e porta
    methods: ['GET', 'POST'],
}));

app.use(express.static('public'));  // Para servir arquivos estáticos, como HTML, CSS e JS
app.use(express.json()); // Permite que o express leia o corpo da requisição no formato JSON

// Armazenando as mensagens dos emissores e os receptores
let mensagens = [];
let emissores = [];
let receptores = [];
let tempoInicial = null;  // Para armazenar o tempo da primeira mensagem
let timeoutID = null;  // ID para o setTimeout que limpa as mensagens após 10s

// Endpoint para criar receptores
app.post('/criar-receptores', (req, res) => {
    const { quantidade } = req.body;

    // Cria receptores com nomes automáticos
    for (let i = 1; i <= quantidade; i++) {
        receptores.push({ id: i, nome: `Receptor-${i}` });
    }

    res.status(200).send({ status: 'Receptores criados com sucesso!', receptores });
});

// Endpoint para emissores enviarem mensagens
app.post('/enviar', (req, res) => {
    const { mensagem, emissorId } = req.body;
    
    // Armazenando a mensagem com a identificação do emissor
    mensagens.push({ mensagem, emissor: emissorId, timestamp: Date.now() });

    // Se for a primeira mensagem, armazena o tempo
    if (!tempoInicial) {
        tempoInicial = Date.now();  // Armazena o tempo da primeira mensagem
        console.log('Primeira mensagem recebida, começando a contagem de 10 segundos!');
        
        // Limpa as mensagens após 10 segundos
        clearTimeout(timeoutID);  // Limpar qualquer temporizador anterior
        timeoutID = setTimeout(() => {
            console.log('10 segundos se passaram, enviando mensagens...');
            // Envia as mensagens para todos os receptores
            io.emit('mensagens', { mensagens, receptores });
            mensagens = [];  // Limpa a lista de mensagens
            tempoInicial = null;  // Reinicia o tempo para esperar uma nova primeira mensagem
        }, 10000);  // Configura o timeout para 10 segundos
    }

    res.status(200).send({ status: 'Mensagem enviada com sucesso!' });
});

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});
