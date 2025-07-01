const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://10.1.1.108:8080', 
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'], 
        credentials: true, 
    }
});

app.use(cors({
    origin: 'http://10.1.1.108:8080', 
    methods: ['GET', 'POST'],
}));

app.use(express.static('public'));  
app.use(express.json()); 


let mensagens = [];
let emissores = [];
let receptores = [];
let tempoInicial = null;  
let timeoutID = null; 

app.post('/criar-receptores', (req, res) => {
    const { quantidade } = req.body;

    for (let i = 1; i <= quantidade; i++) {
        receptores.push({ id: i, nome: `Receptor-${i}` });
    }

    res.status(200).send({ status: 'Receptores criados com sucesso!', receptores });
});

app.post('/enviar', (req, res) => {
    const { mensagem, emissorId } = req.body;
    
    mensagens.push({ mensagem, emissor: emissorId, timestamp: Date.now() });

    if (!tempoInicial) {
        tempoInicial = Date.now(); 
        console.log('Primeira mensagem recebida, começando a contagem de 10 segundos!');
        
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            console.log('10 segundos se passaram, enviando mensagens...');
            io.emit('mensagens', { mensagens, receptores });
            mensagens = [];  
            tempoInicial = null;  
        }, 10000); 
    }

    res.status(200).send({ status: 'Mensagem enviada com sucesso!' });
});

server.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});
