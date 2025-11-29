const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Игровые переменные
let player = {
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    speed: 3,
    color: '#e74c3c'
};

let score = 0;
let level = 1;
let timeLeft = 60;
let gameRunning = true;
let treasures = [];
let obstacles = [];
let guards = [];

// Управление
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keydown', (e) => {
    keys[e.key] = false;
});

// Создание сокровищ
function createTreasures(count) {
    treasures = [];
    for (let i = 0; i < count; i++) {
        treasures.push({
            x: Math.random() * (canvas.width - 30) + 15,
            y: Math.random() * (canvas.height - 30) + 15,
            width: 25,
            height: 25,
            value: Math.floor(Math.random() * 50) + 10,
            type: Math.random() > 0.5 ? 'gold' : 'diamond'
        });
    }
}

// Создание препятствий
function createObstacles(count) {
    obstacles = [];
    for (let i = 0; i < count; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            width: 50 + Math.random() * 50,
            height: 50 + Math.random() * 50
        });
    }
}

// Создание охранников
function createGuards(count) {
    guards = [];
    for (let i = 0; i < count; i++) {
        guards.push({
            x: Math.random() * (canvas.width - 40),
            y: Math.random() * (canvas.height - 40),
            width: 35,
            height: 35,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2
        });
    }
}

// Движение игрока
function movePlayer() {
    let newX = player.x;
    let newY = player.y;

    if (keys['ArrowUp'] || keys['w']) newY -= player.speed;
    if (keys['ArrowDown'] || keys['s']) newY += player.speed;
    if (keys['ArrowLeft'] || keys['a']) newX -= player.speed;
    if (keys['ArrowRight'] || keys['d']) newX += player.speed;

    // Проверка границ
    if (newX >= 0 && newX <= canvas.width - player.width) {
        if (!checkObstacleCollision(newX, player.y)) {
            player.x = newX;
        }
    }
    if (newY >= 0 && newY <= canvas.height - player.height) {
        if (!checkObstacleCollision(player.x, newY)) {
            player.y = newY;
        }
    }
}

// Проверка столкновения с препятствиями
function checkObstacleCollision(x, y) {
    for (let obstacle of obstacles) {
        if (x < obstacle.x + obstacle.width &&
            x + player.width > obstacle.x &&
            y < obstacle.y + obstacle.height &&
            y + player.height > obstacle.y) {
            return true;
        }
    }
    return false;
}

// Движение охранников
function moveGuards() {
    guards.forEach(guard => {
        guard.x += guard.speedX;
        guard.y += guard.speedY;

        // Отскок от стен
        if (guard.x <= 0 || guard.x >= canvas.width - guard.width) {
            guard.speedX *= -1;
        }
        if (guard.y <= 0 || guard.y >= canvas.height - guard.height) {
            guard.speedY *= -1;
        }
    });
}

// Проверка столкновений с сокровищами
function checkTreasureCollision() {
    treasures = treasures.filter(treasure => {
        if (player.x < treasure.x + treasure.width &&
            player.x + player.width > treasure.x &&
            player.y < treasure.y + treasure.height &&
            player.y + player.height > treasure.y) {
            score += treasure.value;
            document.getElementById('score').textContent = score;
            return false;
        }
        return true;
    });

    // Переход на следующий уровень
    if (treasures.length === 0) {
        level++;
        document.getElementById('level').textContent = level;
        timeLeft += 30;
        initLevel();
    }
}

// Проверка столкновений с охранниками
function checkGuardCollision() {
    for (let guard of guards) {
        if (player.x < guard.x + guard.width &&
            player.x + player.width > guard.x &&
            player.y < guard.y + guard.height &&
            player.y + player.height > guard.y) {
            endGame();
            return;
        }
    }
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем препятствия (стены сейфа)
    ctx.fillStyle = '#34495e';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Рисуем сокровища
    treasures.forEach(treasure => {
        if (treasure.type === 'gold') {
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(treasure.x + treasure.width/2, treasure.y + treasure.height/2, treasure.width/2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#3498db';
            ctx.save();
            ctx.translate(treasure.x + treasure.width/2, treasure.y + treasure.height/2);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-treasure.width/2, -treasure.height/2, treasure.width, treasure.height);
            ctx.restore();
        }
        
        // Значение сокровища
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(treasure.value, treasure.x + treasure.width/2, treasure.y + treasure.height/2 + 4);
    });

    // Рисуем охранников
    ctx.fillStyle = '#e74c3c';
    guards.forEach(guard => {
        ctx.fillRect(guard.x, guard.y, guard.width, guard.height);
        // Глаза
        ctx.fillStyle = '#fff';
        ctx.fillRect(guard.x + 8, guard.y + 10, 6, 6);
        ctx.fillRect(guard.x + 21, guard.y + 10, 6, 6);
        ctx.fillStyle = '#e74c3c';
    });

    // Рисуем игрока (вор)
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Маска вора
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 5, player.y + 8, 20, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 7, player.y + 10, 5, 4);
    ctx.fillRect(player.x + 18, player.y + 10, 5, 4);
}

// Инициализация уровня
function initLevel() {
    createTreasures(5 + level * 2);
    createObstacles(3 + level);
    createGuards(level);
}

// Таймер
let timerInterval = setInterval(() => {
    if (gameRunning) {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }
}, 1000);

// Завершение игры
function endGame() {
    gameRunning = false;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
}

// Перезапуск игры
function restartGame() {
    score = 0;
    level = 1;
    timeLeft = 60;
    gameRunning = true;
    player.x = 50;
    player.y = 50;
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('gameOver').classList.add('hidden');
    
    initLevel();
}

document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('playAgainBtn').addEventListener('click', restartGame);

// Игровой цикл
function gameLoop() {
    if (gameRunning) {
        movePlayer();
        moveGuards();
        checkTreasureCollision();
        checkGuardCollision();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Запуск игры
initLevel();
gameLoop();
