//Variables
let lastTime = 0;
let dropInterval = 1000; //valor por defecto de caida de la ficha
let dropCounter = 0;
let pause = true; //pausa al juego


//siguiente pieza
const canvasNext = document.getElementById("nextPiece");
const contexNext = canvasNext.getContext("2d");
contexNext.scale(19,19);

//colores 
const colors = [
                null,
                '#9f00ef',
                'yellow',
                'orange',
                'blue',
                '#00edef',
                'green',
                'red'
                ];


const canvas = document.getElementById("tetris");

//filas y clumnas
var rows = 10;
var columns = 20;
const contex = canvas.getContext("2d");


if(screen.height >= 992){
    //tamaño al canvas
    canvas.width = 400;
    canvas.height = 800;
    contex.scale(40, 40); //Filas y columnas
} else if (screen.height >=650 && screen.height <992){
  //tamaño al canvas
    canvas.width = 300;
    canvas.height = 600;
    contex.scale(30, 30); //Filas y columnas  
} else {
      //tamaño al canvas
      canvas.width = 200;
      canvas.height = 400;
      contex.scale(20, 20); //Filas y columnas 
}


//crea el tablero
function createMatriz(width, height) {
    const matriz = [];
    while (height--) {
        matriz.push(new Array(width).fill(0));
    }
    return matriz;
}
const grid = createMatriz(rows, columns);
/* console.table(grid);
 */

const player = {
    pos: {x:0, y:0},
    matriz: null,
    //puntaje
    score: 0,
    //nivel
    level: 0,
    //lineas
    lines: 0,
    //pieza siguiente
    next: null
}


//crea las piezas 
function createPiece(tipo) {
    switch (tipo) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ];
        case 'O':
            return [
                [2, 2],
                [2, 2]
            ]; 
        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3]
            ];
        case 'J':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0]
            ];  
        case 'I':
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0]
            ]; 
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ]; 
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ];
    }
}

//recorre la matriz y pinta la ficha
function drawMatriz(matriz, offset) {
    matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                //color a la ficha
                contex.fillStyle = colors[value];
                contex.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

//Dibuja la matriz de la siguiente pieza 
function drawMatrizNext(matriz, offset) {
    contexNext.fillStyle = "rgb(2, 10, 25)";
    contexNext.fillRect(0, 0, canvasNext.width, canvasNext.height);

    //recorre la matriz y pintla la ficha
    matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                //color a la ficha
                contexNext.fillStyle = colors[value];
                contexNext.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

//Color del lienzo
function draw() {
    contex.fillStyle = "#000";
    contex.fillRect(0, 0, canvas.width, canvas.height);
    drawMatriz(grid, {x:0, y:0});
    drawMatriz(player.matriz, player.pos);
    //dibuja la matriz de la ficha siguiente
    drawMatrizNext(player.next, {x : 1, y : 1});
}
//Colición
function collide(grid, player) {
    const matriz = player.matriz;
    const offset = player.pos;
    for(let y = 0; y < matriz.length; y++) {
        for(let x = 0; x < matriz[y].length; x++) {
            if(matriz[y][x] !== 0 && (grid[y + offset.y] && grid[y + offset.y][x + offset.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}


//Dibuja la figura en el tablero y la deja estática
function merge(grid, player) {
    player.matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
//Funcion para mostrar la modal y poner el fondo oscuro
function showModal(id) {
    //muestra la modal
    var modal = document.getElementById(id);
    modal.style.display = 'block';
    modal.classList.add('show');
    modal.setAttribute("role", "dialog");
    //Pone el fondo oscuro
    var body = document.getElementById("body");
    body.insertAdjacentHTML('afterend', '<div class="modal-backdrop"></div>');
    //retornamos la variable modal
    return modal;
}

//Da play al juego
function playGame(id, modal){
    //selecciona el elemento por su id
    var play = document.getElementById(id);
    play.addEventListener('click', () => {
        //quita el modal
        modal.style.display = 'none';
        //quita el fondo oscuro
        document.querySelector('div.modal-backdrop').remove();
        //quita el pause al juego
        pausar();
        //solo para el botón de jugar de nuevo
        if(id == "btn-again-yes") {
            //deja en ceros la matriz grande
            grid.forEach(row => row.fill(0));
            //resetea el valor del puntaje
            player.score = 0;
            //resetea el valor del nivel
            player.level = 0;
            //resetea el valor de la lineas
            player.lines = 0;

            updateScore();
        } 
    });

}
//función para salir del juego 
function exitGame(id){
    pausar();
    //selecciona el elemento por su id
    var play = document.getElementById(id);
    //le añadimos el evento click
    play.addEventListener('click', () => {
        //recargamos la página
        window.location.reload();
    });
}

//Resetea la posición de la ficha
function playerReset() {
    //piezas aleatorias
    const pieces = 'ILJOTSZ';
    //reduce el tiempo a medida que aumenta de niveles
    dropInterval = 1000 - (player.level * 50);
    //dibuja la pieza en la matriz de siguiente y/o grande
    if (player.next === null) {
        player.matriz = createPiece(pieces[pieces.length * Math.random() | 0]);
    } else {
        player.matriz = player.next;
    }
    player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
    //centra las piezas
    player.pos.x = (grid[0].length/2 | 0) - (player.matriz[0].length/2 | 0);
    player.pos.y = 0;
    //Juego terminado
    if(collide(grid, player)) {
        //mostramos la ventana modal
        var modal = showModal("myModal2");
        //añadimos el evento click al botón jugar de nuevo
        playGame("btn-again-yes",modal );
        //añadimos el evento click al botón no jugar de nuevo
        exitGame("btn-again-no");
    }

}

//Borra las lineas completadas
function gridSweep() {
    let rowCount = 1;
    outer : for (let y = grid.length - 1; y > 0; y--){
        for (let x = 0; x < grid[y].length; x++) {
            if(grid[y][x] === 0) {
                continue outer;
            }
            
        }

        const row = grid.splice(y,1)[0].fill(0);
        grid.unshift(row);
        y ++;
       
        //puntaje
        player.score += rowCount * 10;
        //lineas
        player.lines ++;
        //aumenta de nivel
        rowCount *= 2;
        if(player.lines % 3 === 0) player.level ++;
    }
}

playerReset();

//Función que muestra los valores de puntaje, lineas y nivel
function updateScore(){
    //Escribe el valor de puntaje en el elemento html con id="score"
    document.getElementById('score').innerHTML = player.score;
    //Escribe el valor de lineas en el elemento html con id="lines"
    document.getElementById('lines').innerHTML = player.lines;
    //Escribe el valor del nivel en el elemento html con id="level"
    document.getElementById('level').innerHTML = player.level;
}
//Ejecuta la función updateScore()
updateScore();

//movimiento de la ficha hacia abajo
function playerDrop() {
    player.pos.y ++;
    dropCounter = 0;
    //Colisión
    if(collide(grid, player)) {
        player.pos.y --;
        //Ponemos estática la pieza
        merge(grid, player);
        //Reseteamos los valores de posición de las fichas 
        playerReset();
        //borra las lineas
        gridSweep();
        //actualizamos los valores en la vista (html)
        updateScore();
    }
    
}

//movimiento ficha hacia la izquierda 
function playerMoveLeft() { 
    player.pos.x += -1; 
    //colisión 
    if(collide(grid, player)) { 
        player.pos.x -= -1; 
    } 
} 
//movimiento ficha hacia la derecha 
function playerMoveRight() { 
    player.pos.x += 1; 
    //colisión 
    if(collide(grid, player)) { 
        player.pos.x -= 1; 
    } 
}

//Rotación
function rotate (matriz) {
    for(let y = 0; y < matriz.length; y++) {
        for(let x = 0; x < y; x++) {
            [matriz[x][y], matriz[y][x]] = [matriz[y][x], matriz[x][y]];
        }
    }
    matriz.forEach(row => row.reverse());
}


//Rota la ficha
function playerRotate() {
    const pos = player.pos.x;
    rotate(player.matriz);
    //colición
    let offset = 1;
    while(collide(grid, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matriz[0].length) {
            rotate(player.matriz);
            player.pos.x = pos;
            return;
        }
    } 


}

//Establece el temporizador
function update(time = 0) {
    //se ejecuta solo si el juego no está pausado
    if(!pause) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if(dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
        requestAnimationFrame(update);
    }
}
//Ejecutamos la función update()
update();

//Función que añade el evento keydown a las teclas
document.addEventListener("keydown",event =>{
    //Mecanismo de control que determina las funciones a ejecutar segun la llave de
    //la tecla que disparó el evento 
    switch (event.key) {
        //Si la tecla es fecha abajo
        case "ArrowDown":
            //Ejecutamos la función playerDrop() para hacer que la ficha baje más rápido
            playerDrop();
            //finaliza la ejecución de la función
            break;
        //Si la tecla es fecha izquierda
        case "ArrowLeft":
            //Ejecutamos la función playerMove(-1) para hacer que la ficha
            //se mueva una posición a la izquierda
            playerMoveLeft();
            //finaliza la ejecución de la función
            break;
        //Si la tecla es fecha derecha
        case "ArrowRight":
            //Ejecutamos la función playerMove(1) para hacer que la ficha
            //se mueva una posición a la derecha
            playerMoveRight();
            //finaliza la ejecución de la función
            break;
        //Si la tecla es fecha arriba
        case "ArrowUp":
            //Ejecutamos la función playerRotate() para hacer que la ficha rote
            playerRotate();
            //finaliza la ejecución de la función
            break;
    };
});

//Pausa el juego
function pausar() {
    //Si la variable pause es verdadera
    if(pause) {
        //cambia el valor de la variable pause a falso
        pause = false;
        //Restablece el movimiento de la ficha y el temporizador
        update();
        document.getElementById("down").addEventListener('click',playerDrop ); 
        document.getElementById("left").addEventListener('click',playerMoveLeft); 
        document.getElementById("right").addEventListener('click',playerMoveRight); 
        document.getElementById("up").addEventListener('click', playerRotate );
    //Si la variable pause es falsa
    } else {
        //cambia el valor de la variable pause a verdadero
        pause = true;
        document.getElementById("down").removeEventListener('click', playerDrop ); 
        document.getElementById("left").removeEventListener('click',playerMoveLeft); 
        document.getElementById("right").removeEventListener('click',playerMoveRight ); 
        document.getElementById("up").removeEventListener('click', playerRotate );
    }
}

//Función que se ejecuta al cargar completamente la página
window.onload = function() {
    //Muestra la modal el mesanje de bienvenida con las instrucciones para jugar
    var modal = showModal("myModal");
    //Añadimos el evento click al boton con el id="btn-play" para ocultar el mensaje
    //de bienvenida (modal) e iniciar el juego
    playGame("btn-play",modal);
}




     
