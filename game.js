const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const endScreen = document.getElementById('end-screen');
const jediGirl = document.getElementById('jedi-girl');
const jediBoy = document.getElementById('jedi-boy');
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameTitle = document.getElementById('game-title');

let ship = {
    x: 50,
    y: 0, // Se establecerá en resizeCanvas
    width: 60,
    height: 50,
    speedY: 0,
    image: new Image()
};
ship.image.src = 'assets/millennium-falcon.png';

let asteroids = [];
let score = 0;
let gameIsOver = false;
let startTime;
let puntaje = 25;
let gameStarted = 0; // 0 = no iniciado, 1 = iniciado
const TIME_LIMIT = 60;
const SHIP_VERTICAL_SPEED = 4;

// Ajustar canvas y posición inicial de la nave
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    canvas.width = Math.min(container.clientWidth, 600);
    canvas.height = Math.min(canvas.offsetHeight, 800);
    ship.y = canvas.height / 2; // Centrar nave al redimensionar
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initGame() {
    if (!ctx) {
        console.error('Error: No se pudo obtener el contexto del canvas.');
        return;
    }

    jediGirl.src = "assets/leia-caricatura.png";
    jediBoy.src = "assets/luke-caricatura.png";

    jediGirl.onload = () => console.log('Imagen de Princesa Leia cargada');
    jediBoy.onload = () => console.log('Imagen de Luke Skywalker cargada');
    jediGirl.onerror = () => console.error('Error al cargar leia-caricatura.png');
    jediBoy.onerror = () => console.error('Error al cargar luke-caricatura.png');

    resetGame();
    console.log('Juego inicializado, esperando botón de inicio.');
}

function startGame() {
    console.log('Botón de inicio presionado, comenzando el juego.');
    gameStarted = 1;
    resetGame();
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
    ctx.font = `clamp(14px, 4vw, 16px) Arial`;
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
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
        console.warn('Imagen de la nave no cargada, usando rectángulo dorado.');
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
    const asteroidSpeed = Math.random() * 1 + 0.5;
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
        canvas.style.display = 'none';
        gameTitle.style.display = 'none';
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
    canvas.style.display = 'none';
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

// Controles para teclado
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

// Controles para mouse
canvas.addEventListener('mousedown', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
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

// Controles táctiles
canvas.addEventListener('touchstart', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    if (touchY < ship.y + ship.height / 2) {
        ship.speedY = -SHIP_VERTICAL_SPEED;
        console.log('Toque arriba.');
    } else {
        ship.speedY = SHIP_VERTICAL_SPEED;
        console.log('Toque abajo.');
    }
});

canvas.addEventListener('touchend', () => {
    ship.speedY = 0;
    console.log('Toque soltado.');
});

// Botones virtuales para touch (opcional, descomentar si quieres botones en pantalla)
canvas.addEventListener('touchmove', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    ship.y = Math.max(0, Math.min(touchY - ship.height / 2, canvas.height - ship.height));
    ship.speedY = 0; // Seguimiento directo del dedo
    console.log('Toque moviendo nave a:', ship.y);
}, { passive: false });

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
    triggerConfetti();
    enviarCorreo('Jedi -> niña');
});

jediGirl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    triggerConfetti();
    enviarCorreo('Jedi -> niña');
});

jediBoy.addEventListener('click', () => {
    triggerConfetti();
    enviarCorreo('Jedi -> niño');
});

jediBoy.addEventListener('touchstart', (e) => {
    e.preventDefault();
    triggerConfetti();
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
    canvas.style.display = 'block';
    gameTitle.style.display = 'block';
    startGame();
});

ship.image.onload = () => {
    console.log('Imagen de la nave cargada correctamente');
    initGame();
};
ship.image.onerror = () => {
    console.error('Error al cargar millennium-falcon.png');
    initGame();
};
if (ship.image.complete && ship.image.naturalWidth !== 0) {
    console.log('Imagen de la nave ya cargada en caché');
    initGame();
}
