const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const endScreen = document.getElementById('end-screen');
const jediGirl = document.getElementById('jedi-girl');
const jediBoy = document.getElementById('jedi-boy');
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameTitle = document.getElementById('game-title');

// Proporción original del juego (400x600 = 2:3)
const GAME_ASPECT_RATIO = 2 / 3;
const BASE_WIDTH = 400; // Resolución base para cálculos
const BASE_HEIGHT = 600;
let scaleFactor = 1; // Factor de escala para coordenadas

let ship = {
    x: 50 / BASE_WIDTH, // Normalizamos a proporción relativa
    y: 0.5, // Centro del canvas (relativo)
    width: 60 / BASE_WIDTH,
    height: 50 / BASE_HEIGHT,
    speedY: 0,
    image: new Image()
};
ship.image.src = 'millennium-falcon.png';

let asteroids = [];
let score = 0;
let gameIsOver = false;
let startTime;
let puntaje = 25;
let gameStarted = 0;
const TIME_LIMIT = 60;
const SHIP_VERTICAL_SPEED = 4 / BASE_HEIGHT; // Normalizamos velocidad

// Función para redimensionar el canvas
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const dpr = window.devicePixelRatio || 1;
    
    let width = container.clientWidth;
    let height = width / GAME_ASPECT_RATIO;

    if (height > container.clientHeight) {
        height = container.clientHeight;
        width = height * GAME_ASPECT_RATIO;
    }

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    scaleFactor = width / BASE_WIDTH; // Factor para escalar coordenadas
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Ajusta para pantallas HD
}

// Llama a resizeCanvas al cargar y en redimensionamiento
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initGame() {
    if (!ctx) {
        console.error('Error: No se pudo obtener el contexto del canvas.');
        return;
    }

    jediGirl.src = "leia-caricatura.png";
    jediBoy.src = "luke-caricatura.png";

    jediGirl.onload = () => console.log('Imagen de Princesa Leia cargada');
    jediBoy.onload = () => console.log('Imagen de Luke Skywalker cargada');
    jediGirl.onerror = () => console.error('Error al cargar leia-caricatura.png.');
    jediBoy.onerror = () => console.error('Error al cargar luke-caricatura.png.');

    resetGame();
    console.log('Juego inicializado.');
}

function startGame() {
    console.log('Botón de inicio presionado.');
    gameStarted = 1;
    resetGame();
    gameLoop();
}

function resetGame() {
    ship.y = 0.5; // Centro relativo
    ship.speedY = 0;
    asteroids = [];
    score = 0;
    gameIsOver = false;
    endScreen.style.display = 'none';
    startTime = Date.now();
    console.log('Juego reiniciado. gameStarted:', gameStarted);
}

function drawScoreAndTime() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const timeLeft = TIME_LIMIT - timeElapsed;

    ctx.fillStyle = '#fff';
    ctx.font = `${20 * scaleFactor}px Arial`;
    ctx.fillText(`Puntos: ${score}`, 10 * scaleFactor, 25 * scaleFactor);
    ctx.fillText(`Tiempo: ${timeLeft}`, 10 * scaleFactor, 50 * scaleFactor);

    if (timeLeft <= 0 && !gameIsOver) {
        gameOver();
    }
}

function drawShip() {
    if (ship.image.complete && ship.image.naturalWidth !== 0) {
        ctx.drawImage(ship.image, ship.x * canvas.width, ship.y * canvas.height, ship.width * canvas.width, ship.height * canvas.height);
        console.log('Nave renderizada como imagen.');
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(ship.x * canvas.width, ship.y * canvas.height, ship.width * canvas.width, ship.height * canvas.height);
        console.warn('Imagen de la nave no cargada.');
    }
}

function updateShip() {
    if (gameIsOver || gameStarted === 0) return;

    ship.y += ship.speedY;

    if (ship.y < 0) ship.y = 0;
    if (ship.y + ship.height > 1) ship.y = 1 - ship.height;
}

function createAsteroid() {
    const asteroidSize = (Math.random() * 30 + 20) / BASE_WIDTH;
    const asteroidY = Math.random() * (1 - asteroidSize);
    const asteroidSpeed = (Math.random() * 1 + 0.5) / BASE_WIDTH;
    asteroids.push({
        x: 1, // Comienza al borde derecho (relativo)
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
        ctx.arc(
            (asteroid.x + asteroid.width / 2) * canvas.width,
            (asteroid.y + asteroid.height / 2) * canvas.height,
            (asteroid.width / 2) * canvas.width,
            0,
            Math.PI * 2
        );
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
        if (
            ship.x < asteroid.x + asteroid.width &&
            ship.x + ship.width > asteroid.x &&
            ship.y < asteroid.y + asteroid.height &&
            ship.y + ship.height > asteroid.y
        ) {
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
        triggerConfetti();
        console.log('Juego ganado. Confeti activado.');
    }
}

function gameOver() {
    gameIsOver = true;
    gameStarted = 0;
    alert(`¡Misión Fallida! Has chocado con un asteroide. Puntos: ${score}`);
    resetGame();
    startScreen.style.display = 'block';
    gameCanvas.style.display = 'none';
    gameTitle.style.display = 'none';
    console.log('Juego terminado (colisión).');
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
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    if (e.key === 'ArrowUp' || e.key === 'w') {
        ship.speedY = -SHIP_VERTICAL_SPEED;
        console.log('Tecla arriba presionada.');
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        ship.speedY = SHIP_VERTICAL_SPEED;
        console.log('Tecla abajo presionada.');
    }
});

document.addEventListener('keyup', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ArrowDown' || e.key === 's') {
        ship.speedY = 0;
        console.log('Tecla soltada.');
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    const clickY = (e.clientY - canvas.getBoundingClientRect().top) / canvas.height;
    if (clickY < ship.y + ship.height / 2) {
        ship.speedY = -SHIP_VERTICAL_SPEED;
        console.log('Clic arriba.');
    } else {
        ship.speedY = SHIP_VERTICAL_SPEED;
        console.log('Clic abajo.');
    }
});

canvas.addEventListener('mouseup', () => {
    ship.speedY = 0;
    console.log('Clic soltado.');
});

function triggerConfetti() {
    if (typeof confetti === 'undefined') {
        console.error('Error: canvas-confetti no está cargado.');
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
    console.error('Error al cargar millennium-falcon.png.');
    initGame();
};
if (ship.image.complete && ship.image.naturalWidth !== 0) {
    console.log('Imagen de la nave ya cargada en caché');
    initGame();
}
