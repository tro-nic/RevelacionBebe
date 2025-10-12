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
    y: canvas.height / 2,
    width: 60,
    height: 50,
    speedY: 0,
    speedX: 0, // Nueva variable para movimiento horizontal
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
const SHIP_HORIZONTAL_SPEED = 4; // Velocidad para movimiento adelante/atrás

function initGame() {
    if (!ctx) {
        console.error('Error: No se pudo obtener el contexto del canvas. Verifica el elemento #gameCanvas.');
        return;
    }

    jediGirl.src = "leia-caricatura.png";
    jediBoy.src = "luke-caricatura.png";

    jediGirl.onload = () => console.log('Imagen de Princesa Leia cargada');
    jediBoy.onload = () => console.log('Imagen de Luke Skywalker cargada');
    jediGirl.onerror = () => console.error('Error al cargar leia-caricatura.png');
    jediBoy.onerror = () => console.error('Error al cargar luke-caricatura.png');

    resetGame();
    console.log('Juego inicializado, esperando que se presione el botón de inicio.');
}

function startGame() {
    console.log('Botón de inicio presionado, comenzando el juego.');
    gameStarted = 1;
    resetGame();
    gameLoop();
}

function resetGame() {
    ship.x = 50; // Resetear posición X
    ship.y = canvas.height / 2;
    ship.speedY = 0;
    ship.speedX = 0; // Resetear velocidad X
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

    // Actualizar posición en ambos ejes
    ship.y += ship.speedY;
    ship.x += ship.speedX;

    // Límites verticales
    if (ship.y < 0) ship.y = 0;
    if (ship.y + ship.height > canvas.height) ship.y = canvas.height - ship.height;

    // Límites horizontales
    if (ship.x < 0) ship.x = 0;
    if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;
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
        triggerConfetti();
        console.log('Juego ganado. Confeti activado. Bandera gameStarted:', gameStarted);
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

// Evitar comportamiento predeterminado de la pantalla táctil
function preventDefaultTouch() {
    document.addEventListener('touchstart', (e) => {
        if (gameStarted === 1 && e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Control táctil para mover la nave (arriba/abajo y adelante/atrás)
canvas.addEventListener('touchstart', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    e.preventDefault();
    const touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
    const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;

    // Priorizar movimiento vertical si el toque está más cerca de la mitad superior/inferior
    if (Math.abs(touchY - (ship.y + ship.height / 2)) > Math.abs(touchX - (ship.x + ship.width / 2))) {
        if (touchY < ship.y + ship.height / 2) {
            ship.speedY = -SHIP_VERTICAL_SPEED;
            ship.speedX = 0;
            console.log('Toque arriba, moviendo nave.');
        } else {
            ship.speedY = SHIP_VERTICAL_SPEED;
            ship.speedX = 0;
            console.log('Toque abajo, moviendo nave.');
        }
    } else {
        // Movimiento horizontal si el toque está más cerca de la mitad izquierda/derecha
        if (touchX < ship.x + ship.width / 2) {
            ship.speedX = -SHIP_HORIZONTAL_SPEED;
            ship.speedY = 0;
            console.log('Toque izquierda, moviendo nave atrás.');
        } else {
            ship.speedX = SHIP_HORIZONTAL_SPEED;
            ship.speedY = 0;
            console.log('Toque derecha, moviendo nave adelante.');
        }
    }
});

canvas.addEventListener('touchend', () => {
    if (gameIsOver || gameStarted === 0) return;
    ship.speedY = 0;
    ship.speedX = 0;
    console.log('Toque soltado, deteniendo nave.');
});

// Control con ratón (arriba/abajo y adelante/atrás)
canvas.addEventListener('mousedown', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    const clickY = e.clientY - canvas.getBoundingClientRect().top;
    const clickX = e.clientX - canvas.getBoundingClientRect().left;

    // Priorizar movimiento vertical si el clic está más cerca de la mitad superior/inferior
    if (Math.abs(clickY - (ship.y + ship.height / 2)) > Math.abs(clickX - (ship.x + ship.width / 2))) {
        if (clickY < ship.y + ship.height / 2) {
            ship.speedY = -SHIP_VERTICAL_SPEED;
            ship.speedX = 0;
            console.log('Clic arriba, moviendo nave.');
        } else {
            ship.speedY = SHIP_VERTICAL_SPEED;
            ship.speedX = 0;
            console.log('Clic abajo, moviendo nave.');
        }
    } else {
        // Movimiento horizontal si el clic está más cerca de la mitad izquierda/derecha
        if (clickX < ship.x + ship.width / 2) {
            ship.speedX = -SHIP_HORIZONTAL_SPEED;
            ship.speedY = 0;
            console.log('Clic izquierda, moviendo nave atrás.');
        } else {
            ship.speedX = SHIP_HORIZONTAL_SPEED;
            ship.speedY = 0;
            console.log('Clic derecha, moviendo nave adelante.');
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (gameIsOver || gameStarted === 0) return;
    ship.speedY = 0;
    ship.speedX = 0;
    console.log('Clic soltado, deteniendo nave.');
});

// Opcional: Seguir el dedo directamente
// canvas.addEventListener('touchmove', (e) => {
//     if (gameIsOver || gameStarted === 0) return;
//     e.preventDefault();
//     const touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
//     const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
//     ship.y = touchY - ship.height / 2;
//     ship.x = touchX - ship.width / 2;
//     if (ship.y < 0) ship.y = 0;
//     if (ship.y + ship.height > canvas.height) ship.y = canvas.height - ship.height;
//     if (ship.x < 0) ship.x = 0;
//     if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;
//     console.log('Toque movido, actualizando posición de la nave:', ship.x, ship.y);
// });

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
    console.error('Error al cargar millennium-falcon.png');
    initGame();
};
if (ship.image.complete && ship.image.naturalWidth !== 0) {
    console.log('Imagen de la nave ya cargada en caché');
    initGame();
}
