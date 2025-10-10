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
    image: new Image()
};
// Asegúrate de que 'millennium-falcon.png' esté en la misma carpeta
ship.image.src = 'millennium-falcon.png'; 

let asteroids = [];
let score = 0;
let gameIsOver = false;
let startTime;
let puntaje = 25;
let gameStarted = 0; // 0 = juego no iniciado, 1 = juego iniciado
const TIME_LIMIT = 60;
const SHIP_VERTICAL_SPEED = 4; // Velocidad de movimiento

function initGame() {
    if (!ctx) {
        console.error('Error: No se pudo obtener el contexto del canvas.');
        return;
    }
    resetGame();
}

function startGame() {
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
}

// ------------------------------------------
// DIBUJO Y ACTUALIZACIÓN
// ------------------------------------------

function drawScoreAndTime() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const timeLeft = TIME_LIMIT - timeElapsed;

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Puntos: ${score}`, 10, 25);
    ctx.fillText(`Tiempo: ${timeLeft}`, 10, 50);

    if (timeLeft <= 0 && !gameIsOver) {
        // Fin del juego por tiempo
        gameOver(true); 
    }
}

function drawShip() {
    if (ship.image.complete && ship.image.naturalWidth !== 0) {
        ctx.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
    } else {
        // Dibujar un rectángulo si la imagen falla
        ctx.fillStyle = 'blue';
        ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
    }
}

function updateShip() {
    if (gameIsOver || gameStarted === 0) return;

    ship.y += ship.speedY;

    // Limites de la pantalla
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
}

function updateAsteroids() {
    if (gameIsOver || gameStarted === 0) return;
    asteroids.forEach(asteroid => {
        asteroid.x -= asteroid.speed;

        // Aumentar puntuación si el asteroide pasó
        if (!asteroid.passed && asteroid.x + asteroid.width < ship.x) {
            score++;
            asteroid.passed = true;
        }
    });

    // Eliminar asteroides que salieron de la pantalla
    asteroids = asteroids.filter(asteroid => asteroid.x + asteroid.width > 0);

    // Creación de nuevos asteroides
    if (Math.random() < 0.02) {
        createAsteroid();
    }
}

function drawAsteroids() {
    ctx.fillStyle = '#808080';
    asteroids.forEach(asteroid => {
        ctx.beginPath();
        // Dibujar el asteroide como un círculo
        ctx.arc(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, asteroid.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

function checkCollision() {
    if (gameIsOver || gameStarted === 0) return;
    asteroids.forEach(asteroid => {
        // Lógica de colisión simple AABB (Axis-Aligned Bounding Box)
        if (ship.x < asteroid.x + asteroid.width &&
            ship.x + ship.width > asteroid.x &&
            ship.y < asteroid.y + asteroid.height &&
            ship.y + ship.height > asteroid.y) {
            gameOver(false); // Fin del juego por colisión
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
    }
}

function gameOver(timeExpired) {
    gameIsOver = true;
    gameStarted = 0;
    
    let message;
    if (timeExpired) {
        message = `¡Misión Fallida! Se acabó el tiempo. Puntos: ${score}`;
    } else {
        message = `¡Misión Fallida! Has chocado con un asteroide. Puntos: ${score}`;
    }
    
    alert(message);
    
    // Reiniciar al estado inicial
    resetGame(); 
    startScreen.style.display = 'block';
    gameCanvas.style.display = 'none';
    gameTitle.style.display = 'none';
}

function gameLoop() {
    if (gameStarted === 0) {
        return;
    }
    // Limpiar el canvas. El fondo de estrellas es un estilo CSS persistente.
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

// ------------------------------------------
// CONTROLES
// ------------------------------------------

function movePlayer(direction) {
    if (gameIsOver || gameStarted === 0) return;

    if (direction === 'up') {
        ship.speedY = -SHIP_VERTICAL_SPEED;
    } else if (direction === 'down') {
        ship.speedY = SHIP_VERTICAL_SPEED;
    }
}

function stopPlayer() {
    if (gameIsOver || gameStarted === 0) return;
    ship.speedY = 0;
}

// Eventos de TECLADO
document.addEventListener('keydown', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    if (e.key === 'ArrowUp' || e.key === 'w') {
        ship.speedY = -SHIP_VERTICAL_SPEED;
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        ship.speedY = SHIP_VERTICAL_SPEED;
    }
});

document.addEventListener('keyup', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    // Detener el movimiento solo si la tecla soltada es la que estaba en uso
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ArrowDown' || e.key === 's') {
        ship.speedY = 0;
    }
});

// Eventos de CLIC/TÁCTIL en el CANVAS (Toma el lugar de los botones)
canvas.addEventListener('mousedown', (e) => {
    if (gameIsOver || gameStarted === 0) return;
    const clickY = e.clientY - canvas.getBoundingClientRect().top;
    
    // Si el clic es arriba del centro de la nave, sube.
    if (clickY < ship.y + ship.height / 2) {
        ship.speedY = -SHIP_VERTICAL_SPEED;
    } else {
        // Si el clic es abajo del centro de la nave, baja.
        ship.speedY = SHIP_VERTICAL_SPEED;
    }
});

canvas.addEventListener('mouseup', stopPlayer);
canvas.addEventListener('mouseleave', stopPlayer); // Detener si el mouse sale del canvas
canvas.addEventListener('touchend', stopPlayer);
canvas.addEventListener('touchcancel', stopPlayer);


// ------------------------------------------
// FINAL DEL JUEGO Y CORREO
// ------------------------------------------

function triggerConfetti() {
    if (typeof confetti === 'undefined') {
        return;
    }
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function enviarCorreo(jediElegido) {
    const email = 'gimenezyamili@gmail.com';
    const subject = `Elección de Jedi: ${jediElegido}`;
    const body = `El jugador ha elegido a: ${jediElegido}. Puntuación final: ${score}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

jediGirl.addEventListener('click', () => {
    enviarCorreo('Jedi -> niña');
});

jediBoy.addEventListener('click', () => {
    enviarCorreo('Jedi -> niño');
});

// EVENTO PRINCIPAL DE INICIO
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    gameTitle.style.display = 'block';
    startGame();
});

// Cargar la nave y empezar la inicialización
ship.image.onload = initGame;
ship.image.onerror = initGame;
if (ship.image.complete && ship.image.naturalWidth !== 0) {
    initGame();
}
