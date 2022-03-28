
const BGColor = "#231f20"
const SnakeColor = "#c2c2c2"
const FoodColor = "#e66916"

const socket = io('http://localhost:9090');
socket.on('init',handelInit);
socket.on('gameState',handelGameState);
socket.on('gameOver',handelGameOver);
socket.on('gameCode',handelGameCode);
socket.on('unknownGame',handelunknownGame);
socket.on('tooManyPlayer',handeltooManyPlayer);


const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click',newGame);
joinGameBtn.addEventListener('click',joinGame);

function newGame(){
    socket.emit('newGame');
    init();
};

function joinGame(){
    const Code = gameCodeInput.value;
    socket.emit('joinGame',Code);
    init();
};


let canvas, ctx;
let playerNumber;
let gameActive = false;




function init(){

    initialScreen.style.display = "none";
    gameScreen.style.display = "block";


    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BGColor;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    document.addEventListener('keydown',keyDown);
    gameActive=true;
};
function keyDown(e){
    console.log(e.keyCode)
    socket.emit('keyDown',e.keyCode)
};




function paintGame (state){
    ctx.fillStyle = BGColor;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const food = state.food;
    const gridSize = state.gridSize;
    const size = canvas.width/gridSize;

    ctx.fillStyle = FoodColor;
    ctx.fillRect(food.x*size,food.y*size,size,size);

    paintPlayer(state.players[0],size,SnakeColor);
    paintPlayer(state.players[1],size,'red');

};
function paintPlayer(playerState,size,color){
    const snake = playerState.snake;
    ctx.fillStyle=color;
    for(let cell of snake){
        ctx.fillRect(cell.x*size,cell.y*size,size,size);
    }

};

// (() => {

//     const socket = io.connect('http://localhost:9090');
  
// });

function handelInit(number){
    playerNumber = number;
}

function handelGameState(gameState){
    if(!gameActive){
        return;
    }
    gameState = JSON.parse(gameState);
        requestAnimationFrame(()=>paintGame(gameState));
 };

function handelGameOver(data){
if(!gameActive){
    return;
}

    data = JSON.parse(data);

    gameActive = false;

    if(data.winner === playerNumber){
    alert("you win!!");
    }else{
    alert("you loose");
    }
};

function handelGameCode(gameCode){
 gameCodeDisplay.innerText=gameCode;
};

function handelunknownGame(){
reset();
alert('Unknown game code')
};

function handeltooManyPlayer(){
    reset();
    alert('This game is already in progress');      
};

function reset(){
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
};