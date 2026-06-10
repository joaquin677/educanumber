const game = document.getElementById('game');
const mensaje = document.getElementById('mensaje');
const movimientosTexto = document.getElementById('movimientos');
const parejasTexto = document.getElementById('parejas');
const reiniciarBtn = document.getElementById('reiniciar');
const nombreJugador = document.getElementById('nombreJugador');
const puntajeJuego2 = document.getElementById('puntajeJuego2');
const puntajeJuego1 = document.getElementById('puntajeJuego1');
const puntajeTotal = document.getElementById('puntajeTotal');
const confettiContainer = document.getElementById('confetti-container');

const playerName = 'Jugador';
let playerScore = 0;
const previousGameScore = parseInt(localStorage.getItem('puntajeJuego1'), 10) || 0;
const previousGame2Score = parseInt(localStorage.getItem('puntajeJuego2'), 10) || 0;
let totalAcumulado = parseInt(localStorage.getItem('puntajeAcumulado'), 10);
if (isNaN(totalAcumulado)) {
    totalAcumulado = previousGameScore + previousGame2Score;
}
const pairCount = 6;
const pointsPerPair = 10;
const numbers = Array.from({ length: pairCount }, (_, i) => i + 11);
let cartas = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let movimientos = 0;
let matches = 0;

// Función para reproducir audio automático con voz femenina
function reproducirAudioAutomatico() {
    const texto = "Toca una carta para descubrir el número y memoriza dónde está para encontrar su pareja";
    const palabras = document.querySelectorAll('.palabra');
    
    // Configurar síntesis de voz en español con voz femenina
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 0.85;
    utterance.pitch = 1.5;
    utterance.volume = 1;
    
    // Seleccionar voz femenina si está disponible
    const voces = speechSynthesis.getVoices();
    const vozFemenina = voces.find(voz => voz.lang === 'es-ES' && voz.name.includes('Female'));
    if (vozFemenina) {
        utterance.voice = vozFemenina;
    } else {
        const vozEspanola = voces.find(voz => voz.lang === 'es-ES');
        if (vozEspanola) {
            utterance.voice = vozEspanola;
        }
    }
    
    // Animar cada palabra sincronizada exactamente con el audio
    let indice = 0;
    utterance.onboundary = (event) => {
        if (event.name === 'word' && indice < palabras.length) {
            palabras[indice].classList.add('animate');
            indice++;
        }
    };
    
    // Reproducir audio
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

// Ejecutar audio automáticamente cuando carga la página
window.addEventListener('load', () => {
    setTimeout(() => {
        reproducirAudioAutomatico();
    }, 500);
});

// Función para reproducir número en voz femenina
function reproducirNumero(numero) {
    const utterance = new SpeechSynthesisUtterance(numero.toString());
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.pitch = 1.5;
    utterance.volume = 1;
    
    const voces = speechSynthesis.getVoices();
    const vozFemenina = voces.find(voz => voz.lang === 'es-ES' && voz.name.includes('Female'));
    if (vozFemenina) {
        utterance.voice = vozFemenina;
    } else {
        const vozEspanola = voces.find(voz => voz.lang === 'es-ES');
        if (vozEspanola) {
            utterance.voice = vozEspanola;
        }
    }
    
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function saveScores() {
    const total = previousGameScore + playerScore;
    totalAcumulado = total;
    localStorage.setItem('puntajeJuego2', playerScore);
    localStorage.setItem('puntajeAcumulado', totalAcumulado);
}

function updatePlayerDisplay() {
    nombreJugador.textContent = playerName;
    puntajeJuego2.textContent = `⭐ Puntos Juego 2: ${playerScore}`;
    puntajeJuego1.textContent = `Puntos Juego 1: ${previousGameScore}`;
    puntajeTotal.textContent = `Total acumulado: ${totalAcumulado}`;
}

function lanzarConfetti() {
    if (!confettiContainer) return;
    confettiContainer.innerHTML = '';
    const colores = ['#ff4081', '#ffeb3b', '#7c4dff', '#43e97b', '#ff9800', '#7bdff2'];

    for (let i = 0; i < 40; i++) {
        const pieza = document.createElement('div');
        pieza.className = 'confetti-piece';
        const tamaño = Math.floor(Math.random() * 10) + 8;
        pieza.style.width = `${tamaño}px`;
        pieza.style.height = `${tamaño * 2}px`;
        pieza.style.left = `${Math.random() * 100}%`;
        pieza.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        pieza.style.animationDuration = `${Math.random() * 0.8 + 1.6}s`;
        pieza.style.opacity = `${0.8 + Math.random() * 0.2}`;
        pieza.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(pieza);

        pieza.addEventListener('animationend', () => {
            pieza.remove();
        });
    }
}

function updateStats() {
    movimientosTexto.textContent = movimientos;
    parejasTexto.textContent = `${matches}/${pairCount}`;
}

function createCard(number) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.number = number;
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-face card-front">?</div>
            <div class="card-face card-back">${number}</div>
        </div>
    `;

    card.addEventListener('click', () => {
        if (
            lockBoard ||
            card.classList.contains('matched') ||
            card === firstCard ||
            card.classList.contains('flipped')
        ) {
            return;
        }

        flipCard(card);

        if (!firstCard) {
            firstCard = card;
            return;
        }

        secondCard = card;
        lockBoard = true;
        movimientos += 1;
        updateStats();

        checkMatch();
    });

    return card;
}

function flipCard(card) {
    card.classList.add('flipped');
    reproducirNumero(card.dataset.number);
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
        mensaje.textContent = 'No coincide, intenta de nuevo.';
    }, 1000);
}

function markAsMatched() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    resetBoard();
    matches += 1;
    playerScore += 10;
    saveScores();
    updatePlayerDisplay();
    mensaje.textContent = '¡Perfecto! Encontraste una pareja.';

    if (matches === pairCount) {
        mensaje.textContent = '🎉 ¡Ganaste! Encontraste todas las parejas.';
        lanzarConfetti();
        setTimeout(() => {
            window.location.href = 'juego3.html';
        }, 2500);
    }
}

function resetBoard(clearLock = true) {
    [firstCard, secondCard] = [null, null];
    lockBoard = !clearLock;
}

function checkMatch() {
    if (firstCard.dataset.number === secondCard.dataset.number) {
        markAsMatched();
    } else {
        unflipCards();
    }
}

function createBoard() {
    game.innerHTML = '';
    mensaje.textContent = 'Encuentra todos los números ocultos.';
    cartas = [...numbers, ...numbers];
    shuffle(cartas);
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    movimientos = 0;
    matches = 0;
    playerScore = 0;
    updateStats();
    updatePlayerDisplay();

    cartas.forEach(number => {
        game.appendChild(createCard(number));
    });
}

reiniciarBtn.addEventListener('click', createBoard);
createBoard();