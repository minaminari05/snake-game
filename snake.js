const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const grid = 20;
let snake, apple, score, gameOver, speed, minSpeed, speedStep, loopId;
let username = '';
const scoreDiv = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const userForm = document.getElementById('userForm');
const usernameInput = document.getElementById('username');
const rankingList = document.getElementById('rankingList');

function resetGame() {
    snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };
    apple = { x: getRandomInt(0, 20) * grid, y: getRandomInt(0, 20) * grid };
    score = 0;
    gameOver = false;
    speed = 120; // ms
    minSpeed = 40;
    speedStep = 6; // ms 감소폭
    updateScore();
    if (loopId) clearTimeout(loopId);
    gameLoop();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function updateScore() {
    scoreDiv.textContent = `Score: ${score}`;
}

function gameLoop() {
    if (gameOver) return;
    loopId = setTimeout(gameLoop, speed);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.x += snake.dx;
    snake.y += snake.dy;

    // 화면 밖으로 나가지 않도록
    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
        endGame();
        return;
    }

    snake.cells.unshift({ x: snake.x, y: snake.y });
    if (snake.cells.length > snake.maxCells) snake.cells.pop();

    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x, apple.y, grid-1, grid-1);
    ctx.fillStyle = '#0f0';
    snake.cells.forEach((cell, index) => {
        ctx.fillRect(cell.x, cell.y, grid-1, grid-1);
        // 사과 먹었을 때
        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score++;
            updateScore();
            apple.x = getRandomInt(0, 20) * grid;
            apple.y = getRandomInt(0, 20) * grid;
            // 속도 증가 (최소 속도 제한)
            if (speed > minSpeed) speed -= speedStep;
        }
        // 자기 몸에 부딪히면 게임 오버
        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                endGame();
                return;
            }
        }
    });
}

function endGame() {
    gameOver = true;
    scoreDiv.textContent += '  |  Game Over!';
    saveRanking(username, score);
    renderRanking();
    // 이름 입력 폼 다시 표시
    setTimeout(() => {
        userForm.style.display = '';
        canvas.style.display = 'none';
        scoreDiv.style.display = 'none';
        restartBtn.style.display = 'none';
        usernameInput.value = '';
        usernameInput.focus();
    }, 800);
}

document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' && snake.dx === 0) {
        snake.dx = -grid; snake.dy = 0;
    } else if (e.key === 'ArrowUp' && snake.dy === 0) {
        snake.dy = -grid; snake.dx = 0;
    } else if (e.key === 'ArrowRight' && snake.dx === 0) {
        snake.dx = grid; snake.dy = 0;
    } else if (e.key === 'ArrowDown' && snake.dy === 0) {
        snake.dy = grid; snake.dx = 0;
    }
});

restartBtn.addEventListener('click', resetGame);

userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    username = usernameInput.value.trim() || 'Anonymous';
    userForm.style.display = 'none';
    canvas.style.display = '';
    scoreDiv.style.display = '';
    restartBtn.style.display = '';
    resetGame();
    renderRanking();
});

function saveRanking(name, score) {
    let rankings = JSON.parse(localStorage.getItem('snakeRankings') || '[]');
    rankings.push({ name, score });
    rankings.sort((a, b) => b.score - a.score);
    rankings = rankings.slice(0, 5);
    localStorage.setItem('snakeRankings', JSON.stringify(rankings));
}

function renderRanking() {
    let rankings = JSON.parse(localStorage.getItem('snakeRankings') || '[]');
    rankingList.innerHTML = '';
    rankings.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.textContent = `${entry.name} - ${entry.score}`;
        rankingList.appendChild(li);
    });
    if (rankings.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No records yet.';
        rankingList.appendChild(li);
    }
}

// 최초 랭킹 표시
renderRanking();