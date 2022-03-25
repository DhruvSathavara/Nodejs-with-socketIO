const add = (text) => {
    const ul = document.querySelector("#events");
    const li = document.createElement("li");
    li.innerHTML = text;

    ul.appendChild(li);
};

const onSubmit = (sock) => (e) => {
    e.preventDefault();
    const input = document.querySelector("#chat");
    const text = input.value;
    input.value = " ";

    sock.emit("message", text);
}

const getCoordinates = (ele, eve) => {
    const { top, left } = ele.getBoundingClientRect();
    const { clientX, clientY } = eve;

    return {
        x: clientX - left,
        y: clientY - top
    };
};


const canvas = document.querySelector("canvas");

const getBoard = (canvas, numCell = 20) => {
    const ctx = canvas.getContext("2d");
    const cellsize = Math.floor(canvas.width / numCell);

    const fillCell = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellsize, y * cellsize, cellsize, cellsize);
    };
    const drawGreed = () => {

        ctx.beginPath();

        for (let i = 0; i <= numCell; i++) {
            ctx.moveTo(i * cellsize, 0);
            ctx.lineTo(i * cellsize, cellsize * numCell);

            ctx.moveTo(0, i * cellsize);
            ctx.lineTo(cellsize * numCell, i * cellsize);
        }
        ctx.stroke();
    };

    const clear = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    };
    const renderBoard = (board = []) => {
        board.forEach((row, y) => {
            row.forEach((color, x) => {
                color && fillCell(x, y, color);
            });
        });
    };

    const reset = (board) => {
        clear();
        drawGreed();
        renderBoard(board);
    };


    const getCellCoordinate = (x, y) => {
        return {
            x: Math.floor(x / cellsize),
            y: Math.floor(y / cellsize)
        }
    };
    return { fillCell, reset, getCellCoordinate };
};



(() => {

    const { fillCell, reset, getCellCoordinate } = getBoard(canvas);
    const sock = io();


    const onclick = (e) => {
        const { x, y } = getCoordinates(canvas, e);
        sock.emit("turn", getCellCoordinate(x, y));
    };

    sock.on("board",reset);
    sock.on("message", add);
    sock.on("turn", ({ x, y, color }) => fillCell(x, y, color));

    document.querySelector("#chat-form").addEventListener("submit", onSubmit(sock));
    canvas.addEventListener("click", onclick);
})();