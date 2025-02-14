const mazeLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 5, 1, 0, 0, 0, 0, 1],
    [1, 1, 2, 1, 0, 3, 1, 3, 1, 1, 0, 1],
    [1, 5, 0, 3, 0, 0, 2, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 3, 1, 0, 3, 0, 1],
    [1, 0, 0, 2, 0, 0, 5, 1, 0, 1, 0, 1],
    [1, 1, 1, 3, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 5, 1, 0, 3, 1, 1, 0, 1],
    [1, 0, 1, 1, 2, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 3, 1, 1, 1, 0, 2, 0, 1],
    [1, 5, 0, 0, 0, 0, 0, 5, 0, 3, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 1, 0, 5, 1, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 0, 3, 1, 3, 1, 1, 0, 1],
    [1, 5, 0, 3, 0, 0, 2, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 3, 1, 0, 3, 0, 1],
    [1, 0, 0, 2, 0, 0, 5, 1, 0, 1, 0, 1],
    [1, 1, 1, 3, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 5, 1, 0, 3, 1, 1, 0, 1],
    [1, 0, 1, 1, 2, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 3, 1, 1, 1, 0, , 0, 1],
    [1, 5, 0, 0, 0, 0, 0, 5, 0, 3, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Mapeo de preguntas a coordenadas de puertas
const doorMappings = [
    {x: 3, y: 3},  // Primera puerta
    {x: 6, y: 4},  // Segunda puerta
    {x: 3, y: 6},  // Tercera puerta
    {x: 7, y: 7},  // Cuarta puerta
    {x: 4, y: 9},  // Quinta puerta
    {x: 9, y: 4},  // Sexta puerta
    {x: 9, y: 10}, // Séptima puerta
    {x: 9, y: 10}  // Octava puerta (misma que la séptima para la última pregunta)
];

let playerPos = { x: 1, y: 1 };
let score = 0;
let openDoors = new Set();
let currentQuestionIndex = 0;
let answeredQuestions = new Set();
let timeLeft = 180; // 3 minutos
let timerInterval;
let lives = 3;


const questions = [
    {
        question: "¿En qué año se descubrió América?",
        options: ["1492", "1489", "1495", "1488"],
        correct: 0
    },
    {
        question: "¿Cuál es el resultado de (15 × 8) + (12 ÷ 3)?",
        options: ["116", "124", "132", "140"],
        correct: 1
    },
    {
        question: "¿Quién escribió 'Don Quijote de la Mancha'?",
        options: ["Lope de Vega", "Miguel de Cervantes", "Francisco de Quevedo", "García Lorca"],
        correct: 1
    },
    {
        question: "¿Cuál es la velocidad de la luz en km/s (aproximadamente)?",
        options: ["200,000", "250,000", "300,000", "350,000"],
        correct: 2
    },
    {
        question: "¿Cuál es el símbolo químico del oro?",
        options: ["Ag", "Fe", "Au", "Cu"],
        correct: 2
    },
    {
        question: "¿En qué año comenzó la Revolución Francesa?",
        options: ["1789", "1790", "1788", "1791"],
        correct: 0
    },
    {
        question: "¿Cuál es el resultado de √(144) + 5³?",
        options: ["125", "137", "145", "157"],
        correct: 1
    },
    {
        question: "¿Cuál es el hueso más pequeño del cuerpo humano?",
        options: ["Martillo", "Yunque", "Estribo", "Falange"],
        correct: 2
    }
];
// Agregar movimiento a las trampas
const traps = [];
function initTraps() {
    for (let y = 0; y < mazeLayout.length; y++) {
        for (let x = 0; x < mazeLayout[y].length; x++) {
            if (mazeLayout[y][x] === 5) {
                traps.push({
                    x: x,
                    y: y,
                    direction: Math.random() < 0.5 ? 'horizontal' : 'vertical',
                    moving: true
                });
            }
        }
    }
}

async function saveScore(score) {
    try {
        // Obtener userId del localStorage
        const userId = localStorage.getItem('userId');
        
        // Verificar si hay un usuario logueado
        if (!userId) {
            alert('Debes iniciar sesión para guardar tu puntuación');
            window.location.href = 'login.html';
            return;
        }

        // Enviar puntuación al backend
        const response = await fetch('http://localhost:4000/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                score: score
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al guardar la puntuación');
        }

        // Redirigir a puntuaciones después de guardar
        window.location.href = 'scores.html';

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo guardar la puntuación');
    }
}

function updateTraps() {
    traps.forEach(trap => {
        if (!trap.moving) return;
        
        const oldX = trap.x;
        const oldY = trap.y;
        
        if (trap.direction === 'horizontal') {
            trap.x += Math.random() < 0.5 ? 1 : -1;
        } else {
            trap.y += Math.random() < 0.5 ? 1 : -1;
        }
        
        // Verificar colisiones
        if (mazeLayout[trap.y][trap.x] === 1 || mazeLayout[trap.y][trap.x] === 3) {
            trap.x = oldX;
            trap.y = oldY;
            trap.direction = trap.direction === 'horizontal' ? 'vertical' : 'horizontal';
        }
        
        // Actualizar posición en el layout
        mazeLayout[oldY][oldX] = 0;
        mazeLayout[trap.y][trap.x] = 5;
    });
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        alert('¡Se acabó el tiempo! Juego terminado.');
        window.location.href = 'index.html';
    }
    timeLeft--;
}

function startGame() {
    initTraps();
    timerInterval = setInterval(() => {
        updateTimer();
        updateTraps();
        renderMaze();
    }, 1000);
}

function renderMaze() {
    const mazeElement = document.getElementById('maze');
    mazeElement.innerHTML = '';
    
    for (let y = 0; y < mazeLayout.length; y++) {
        for (let x = 0; x < mazeLayout[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (x === playerPos.x && y === playerPos.y) {
                cell.textContent = '😊';
            } else {
                switch (mazeLayout[y][x]) {
                    case 1: cell.classList.add('wall'); break;
                    case 2: cell.textContent = '❓'; break;
                    case 3: cell.textContent = openDoors.has(`${x},${y}`) ? '🚪' : '🔒'; break;
                    case 4: cell.textContent = '🏁'; break;
                    case 5: cell.textContent = '💀'; cell.classList.add('trap'); break;
                }
            }
            mazeElement.appendChild(cell);
        }
    }
}
function updateLivesDisplay() {
    const livesDisplay = document.getElementById('lives');
    if (livesDisplay) {
        livesDisplay.innerHTML = '❤️'.repeat(lives);
    }
}
function checkCollisionWithTraps() {
    return mazeLayout[playerPos.y][playerPos.x] === 5;
}

function move(direction) {
    const newPos = {...playerPos};
    let moved = false;
    
    switch (direction) {
        case 'ArrowUp': 
            if (mazeLayout[playerPos.y - 1][playerPos.x] !== 1) {
                newPos.y--;
                moved = true;
            }
            break;
        case 'ArrowDown': 
            if (mazeLayout[playerPos.y + 1][playerPos.x] !== 1) {
                newPos.y++;
                moved = true;
            }
            break;
        case 'ArrowLeft': 
            if (mazeLayout[playerPos.y][playerPos.x - 1] !== 1) {
                newPos.x--;
                moved = true;
            }
            break;
        case 'ArrowRight': 
            if (mazeLayout[playerPos.y][playerPos.x + 1] !== 1) {
                newPos.x++;
                moved = true;
            }
            break;
    }
    
    if (!moved) return;
    if (mazeLayout[newPos.y][newPos.x] === 3 && !openDoors.has(`${newPos.x},${newPos.y}`)) return;
    
    playerPos = newPos;
    
   if (checkCollisionWithTraps()) {
    lives--;
    updateLivesDisplay(); // Agregamos esta línea para actualizar el display
    if (lives <= 0) {
        alert('¡Has perdido todas tus vidas! Juego terminado.');
        window.location.href = 'index.html';
        return;
    }
    // Regresar al inicio después de perder una vida
    playerPos = { x: 1, y: 1 };
}
    if (mazeLayout[newPos.y][newPos.x] === 2) {
        showQuestion();
    }
    
    if (mazeLayout[newPos.y][newPos.x] === 4) {
        clearInterval(timerInterval);
        const bonusPoints = Math.floor(timeLeft / 10);
        const finalScore = score + bonusPoints;
        saveScore(finalScore);
        alert(`¡Felicidades! Has completado el laberinto.\nPuntos por preguntas: ${score}\nPuntos bonus por tiempo: ${bonusPoints}\nPuntuación final: ${finalScore}`);
        window.location.href = 'scores.html'; // Redirige a la página de puntuaciones
    }
    
    renderMaze();
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) return;
    
    const modal = document.getElementById('questionModal');
    const questionText = document.getElementById('questionText');
    const optionsDiv = document.getElementById('options');
    
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.question;
    optionsDiv.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        optionsDiv.appendChild(button);
    });
    
    modal.style.display = 'flex';
}

function checkAnswer(selectedIndex) {
    const modal = document.getElementById('questionModal');
    const question = questions[currentQuestionIndex];
    
    if (selectedIndex === question.correct && !answeredQuestions.has(currentQuestionIndex)) {
        score++;
        document.getElementById('score').textContent = score;
        answeredQuestions.add(currentQuestionIndex);
        
        // Abrir la puerta correspondiente
        const door = doorMappings[currentQuestionIndex];
        openDoors.add(`${door.x},${door.y}`);
    }
    
    currentQuestionIndex++;
    modal.style.display = 'none';
    renderMaze();
}


document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        move(e.key);
    }
});


startGame();
renderMaze();