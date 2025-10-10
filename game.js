const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const endScreen = document.getElementById('end-screen');
const jediGirl = document.getElementById('jedi-girl');
const jediBoy = document.getElementById('jedi-boy');
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameTitle = document.getElementById('game-title');
// NUEVAS REFERENCIAS A LOS BOTONES
const controlsDiv = document.getElementById('controls');
const upButton = document.getElementById('up-button');
const downButton = document.getElementById('down-button');

let ship = {
    x: 50,
    y: canvas.height / 2,
    width: 60,
    height: 50,
    speedY: 0,
    image: new Image()
};
ship.image.src = 'millennium-falcon.png';

let asteroids = [];
let score = 0;
let gameIsOver = false;
let startTime;
let puntaje = 25;
let gameStarted = 0; // Bandera de control: 0 = juego no iniciado, 1 = juego iniciado
const TIME_LIMIT = 60;
const SHIP_VERTICAL_SPEED = 4;

function initGame() {
    if (!ctx) {
        console.error('Error: No se pudo obtener el contexto del canvas. Verifica el elemento #gameCanvas.');
        return;
    }

    jediGirl.src = "leia-caricatura.png";
    jediBoy.src = "luke-caricatura.png";

    jediGirl.onload = () => console.log('Imagen de Princesa Leia cargada');
    jediBoy.onload = () => console.log('Imagen de Luke Skywalker cargada');
    jediGirl.onerror = () => console.error('Error al cargar leia-caricatura.png. Verifica el nombre y la ruta del archivo.');
    jediBoy.onerror = () => console.error('Error al cargar luke-caricatura.png. Verifica el nombre y la ruta del archivo.');

    resetGame();
    console.log('Juego inicializado, esperando que se presione el botón de inicio.');
}

function startGame() {
    console.log('Botón de inicio presionado, comenzando el juego.');
    gameStarted = 1; // Activa la bandera
    resetGame();
    // MOSTRAR CONTROLES
    controlsDiv.style.display = 'flex';
    gameLoop();
}

function resetGame() {
    ship.y = canvas.height / 2;
    ship.speedY = 0;
    asteroids = [];
    score = 0;
    gameIsOver = false;
    endScreen.style.display = 'none';
    startTime = Date.now();
    console.log('Juego reiniciado. Bandera gameStarted:', gameStarted);
}

function drawScoreAndTime() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const timeLeft = TIME_LIMIT - timeElapsed;

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Puntos: ${score}`, 10, 25);
    ctx.fillText(`Tiempo: ${timeLeft}`, 10, 50);

    if (timeLeft <= 0 && !gameIsOver) {
        gameOver();
    }
}

function drawShip() {
    if (ship.image.complete && ship.image.naturalWidth !== 0) {
        ctx.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
        console.log('Nave renderizada como imagen.');
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
        console.warn('Imagen de la nave no cargada, usando rectángulo azul.');
    }
}

function updateShip() {
    if (gameIsOver || gameStarted === 0) return;

    ship.y += ship.speedY;

    if (ship.y < 0) {
        ship.y = 0;
    }
    if (ship.y + ship.height > canvas.height) {
        ship.y = canvas.height - ship.height;
    }
}

function createAsteroid() {
    const asteroidSize = Math.random() * 30 + 20;
    const asteroidY = Math.random() * (canvas.height - asteroidSize);
    const asteroidSpeed = Math.random() * 1 + 0.5; // Velocidad reducida
    asteroids.push({
        x: canvas.width,
        y: asteroidY,
        width: asteroidSize,
        height: asteroidSize,
        speed: asteroidSpeed,
        passed: false
    });
    console.log('Asteroide creado:', asteroids.length);
}

function updateAsteroids() {
    if (gameIsOver || gameStarted === 0) return;
    asteroids.forEach(asteroid => {
        asteroid.x -= asteroid.speed;

        if (!asteroid.passed && asteroid.x + asteroid.width < ship.x) {
            score++;
            asteroid.passed = true;
        }
    });

    asteroids = asteroids.filter(asteroid => asteroid.x + asteroid.width > 0);

    if (Math.random() < 0.02) {
        createAsteroid();
    }
}

function drawAsteroids() {
    ctx.fillStyle = '#808080';
    asteroids.forEach(asteroid => {
        ctx.beginPath();
        ctx.arc(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, asteroid.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
    if (asteroids.length > 0) {
        console.log('Asteroides renderizados:', asteroids.length);
    }
}

function checkCollision() {
    if (gameIsOver || gameStarted === 0) return;
    asteroids.forEach(asteroid => {
        if (ship.x < asteroid.x + asteroid.width &&
            ship.x + ship.width > asteroid.x &&
            ship.y < asteroid.y + asteroid.height &&
            ship.y + ship.height > asteroid.y) {
            gameOver();
        }
    });
}

function checkWinCondition() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    if (score >= puntaje && timeElapsed < TIME_LIMIT) {
        gameIsOver = true;
        gameStarted = 0;
        endScreen.style.display = 'block';
        // OCULTAR CONTROLES
        controlsDiv.style.display = 'none';
        triggerConfetti();
        console.log('Juego ganado. Confeti activado. Bandera gameStarted:', gameStarted);
    }
}

function gameOver() {
    gameIsOver = true;
    gameStarted = 0;
    // OCULTAR CONTROLES
    controlsDiv.style.display = 'none';
    alert(`¡Misión Fallida! Has chocado con un asteroide. Puntos: ${score}`);
    resetGame();
    startScreen.style.display = 'block';
    gameCanvas.style.display = 'none';
    gameTitle.style.display = 'none';
    console.log('Juego terminado (colisión). Bandera gameStarted:', gameStarted);
}

function gameLoop() {
    if (gameStarted === 0) {
        console.log('gameLoop detenido: gameStarted es 0');
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateShip();
    updateAsteroids();
    checkCollision();
    drawAsteroids();
    drawShip();
    drawScoreAndTime();
    checkWinCondition();
    console.log('gameLoop ejecutándose. Puntos:', score, 'Asteroides:', asteroids.length, 'Tiempo:', Math.floor((Date.now() - startTime) / 1000));
    requestAnimationFrame(gameLoop);
}

// ==========================================================
// NUEVA FUNCIÓN DE CONTROL POR BOTONES/TÁCTIL
// ==========================================================
/**
 * Controla el movimiento vertical de la nave (ship) cuando se presionan los botones.
 * @param {string} direction - 'up' o 'down'.
 */
function movePlayer(direction) {
    if (gameIsOver || gameStarted === 0) {
        return;
    }

    // Usar la misma lógica de velocidad que el control de teclado
    if (direction === 'up') {
        ship.speedY = -SHIP_VERTICAL_SPEED;
    } else if (direction === 'down') {
        ship.speedY = SHIP_VERTICAL_SPEED;
    }
    console.log(`Botón ${direction} presionado. Velocidad: ${ship.speedY}`);
}

/**
 * Detiene el movimiento de la nave cuando se suelta el botón.
 */
function stopPlayer() {
    if (gameIsOver || gameStarted === 0) return;
    ship.speedY = 0;
    console.log('Botón o toque soltado, deteniendo nave.');
}

// ==========================================================
// ADICIÓN DE EVENT LISTENERS PARA BOTONES (MOUSE & TOUCH)
// ==========================================================

// Eventos de MOUSE para control continuo (mantener presionado)
upButton.addEventListener('mousedown', () => movePlayer('up'));
downButton.addEventListener('mousedown', () => movePlayer('down'));
upButton.addEventListener('mouseup', stopPlayer);
downButton.addEventListener('mouseup', stopPlayer);

// Eventos TÁCTILES para dispositivos móviles
upButton.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer('up'); });
downButton.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer('down'); });
upButton.addEventListener('touchend', stopPlayer);
downButton.addEventListener('touchend', stopPlayer);
upButton.addEventListener('touchcancel', stopPlayer); 
downButton.addEventListener('touchcancel', stopPlayer);

// ==========================================================
// EVENTOS DE TECLADO (EXISTENTES)
// ==========================================================
document.addEventListener('keydown', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    if (e.key === 'ArrowUp' || e.key === 'w') {
        ship.speedY = -SHIP_VERTICAL_SPEED;
        console.log('Tecla arriba presionada, moviendo nave.');
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        ship.speedY = SHIP_VERTICAL_SPEED;
        console.log('Tecla abajo presionada, moviendo nave.');
    }
});

document.addEventListener('keyup', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ArrowDown' || e.key === 's') {
        ship.speedY = 0;
        console.log('Tecla soltada, deteniendo nave.');
    }
});

// ==========================================================
// EVENTOS DE CLIC EN CANVAS (EXISTENTES)
// ==========================================================
canvas.addEventListener('mousedown', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    const clickY = e.clientY - canvas.getBoundingClientRect().top;
    if (clickY < ship.y + ship.height / 2) {
        ship.speedY = -SHIP_VERTICAL_SPEED;
        console.log('Clic arriba en canvas, moviendo nave.');
    } else {
        ship.speedY = SHIP_VERTICAL_SPEED;
        console.log('Clic abajo en canvas, moviendo nave.');
    }
});

canvas.addEventListener('mouseup', () => {
    ship.speedY = 0;
    console.log('Clic en canvas soltado, deteniendo nave.');
});


function triggerConfetti() {
    if (typeof confetti === 'undefined') {
        console.error('Error: canvas-confetti no está cargado. Verifica la inclusión del script.');
        return;
    }
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    console.log('Confeti disparado.');
}

jediGirl.addEventListener('click', () => {
    enviarCorreo('Jedi -> niña');
});

jediBoy.addEventListener('click', () => {
    enviarCorreo('Jedi -> niño');
});

function enviarCorreo(jediElegido) {
    const email = 'gimenezyamili@gmail.com';
    const subject = `Elección de Jedi: ${jediElegido}`;
    const body = `El jugador ha elegido a: ${jediElegido}.`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

startButton.addEventListener('click', () => {
    console.log('Botón de inicio clicado');
    startScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    gameTitle.style.display = 'block';
    startGame();
});

ship.image.onload = () => {
    console.log('Imagen de la nave cargada correctamente');
    initGame();
};
ship.image.onerror = () => {
    console.error('Error al cargar millennium-falcon.png. Verifica el nombre y la ruta del archivo.');
    initGame();
};
if (ship.image.complete && ship.image.naturalWidth !== 0) {
    console.log('Imagen de la nave ya cargada en caché');
    initGame();
}
