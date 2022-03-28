const http = require("http");
const express = require("express");
const socketio = require("socket.io");


const { createGameState, gameLoop, getUpdatedVelocity, initGame } = require('./game');
const { frameRate } = require('./constant');
const { makeid } = require('./makeid');
// const { emit } = require("process");

const app = express();
app.use(express.static(`${__dirname}/../frontend`));

const server = http.createServer(app);
const io = socketio(server);


const state = {};
const clientRoom = {};


io.on('connection', (client) => {

    client.on('keyDown', handelKeyDown);
    client.on('newGame', handelNewGame);
    client.on('joinGame', handeljoinGame);

    function handeljoinGame(gameCode) {
        const room = io.sockets.adapter.rooms[gameCode];

        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }
        let numOfClients = 0;
        if (allUsers) {
            numOfClients = Object.keys(allUsers).length;
        }
        if (numOfClients = 0) {
            client.emit('unknownGame');
            return;
        } else if (numOfClients > 1) {
            client.emit('tooManyPlayer');
            return;
        }

        clientRoom[client.id] = gameCode;
        client.join(gameCode);

        client.number = 2;
        client.emit('init', 2);

        startGameInterval(gameCode);
    };
    function handelNewGame() {
        let roomName = makeid(5);
        clientRoom[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);


    };



    function handelKeyDown(keyCode) {

        const roomName = clientRoom[client.id];
        if (!roomName) {
            return;
        }
        try {
            keyCode = parseInt(keyCode);
        } catch (e) {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if (vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    };


})

function startGameInterval(roomName) {
    const intervalID = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalID);
        }
    }, 1000 / frameRate);
};


function emitGameState(roomName, state) {
    io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
};

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
};






server.on("error", (err) => {
    console.error(err);
});

server.listen(9090, () => {
    console.log("server is ready");
});
