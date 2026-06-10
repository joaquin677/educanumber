const numerosGrid = document.getElementById('numeros-grid');
const timerEl = document.getElementById('timer');
const scoreSpan = document.getElementById('score');
const comboSpan = document.getElementById('combo');
const mensaje = document.getElementById('mensaje');
const estado = document.getElementById('estado');
const reiniciarBtn = document.getElementById('reiniciar');
const siguienteBtn = document.getElementById('siguiente');
const botonesFinales = document.getElementById('botones-finales');
const progressFill = document.getElementById('progress-fill');
const remaining = document.getElementById('remaining');
const timerProgress = document.getElementById('timer-progress');
const confettiContainer = document.getElementById('confetti-container');
const playerName = document.getElementById('player-name');
const playerAccumulated = document.getElementById('player-accumulated');

let puntaje = 0;
let combo = 0;
let tiempo = 20;
let juegoActivo = false;
let proximoNumero = 0;
let numerosClickeados = [];
let numerosCorrectos = 0;
let tiempoInicial = 20;
let timerId = null;
let numerosTablero = [];
let errores = 0;

// Cargar datos del perfil
function cargarPerfil() {
    const nombre = localStorage.getItem('playerName') || 'Jugador';
    const acumulado = localStorage.getItem('puntajeAcumulado') || '0';
    playerName.textContent = nombre;
    playerAccumulated.textContent = acumulado;
}

// Animar y reproducir instrucciones con voz femenina
function reproducirInstrucciones() {
    const descElem = document.querySelector('.descripcion');
    if (!descElem || !('speechSynthesis' in window)) return;

    const texto = descElem.textContent.trim();
    const palabrasArr = texto.split(/\s+/);
    descElem.innerHTML = palabrasArr.map(w => `<span class="palabra">${w}</span>`).join(' ');
    const palabras = Array.from(descElem.querySelectorAll('.palabra'));

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const voces = speechSynthesis.getVoices();
    const vozFemenina = voces.find(v => (v.lang && v.lang.startsWith('es')) && /maria|sofia|lucia|ana|laura|clara|silvia|paola|valentina|carla|female|mujer/i.test(v.name)) || voces.find(v => v.lang && v.lang.startsWith('es')) || voces[0];
    if (vozFemenina) utterance.voice = vozFemenina;

    let indice = 0;
    utterance.onboundary = (event) => {
        if (event.name === 'word' && indice < palabras.length) {
            const el = palabras[indice];
            el.classList.add('animate');
            setTimeout(() => el.classList.remove('animate'), 600);
            indice += 1;
        }
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function reproducirAudio(texto) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        
        // Intentar usar voz femenina
        const voces = speechSynthesis.getVoices();
        const vozFemenina = voces.find(v => v.name.includes('Female') || v.name.includes('mujer') || v.name.includes('woman'));
        if (vozFemenina) {
            utterance.voice = vozFemenina;
        }
        
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }
}

function generarNumeros() {
    const numeros = [];
    while (numeros.length < 10) {
        const num = Math.floor(Math.random() * 200) + 1;
        if (!numeros.includes(num)) numeros.push(num);
    }
    numeros.sort((a, b) => b - a);
    return numeros.sort(() => Math.random() - 0.5);
}

let maxNumero = 0;

function crearTablero() {
    numerosGrid.innerHTML = '';
    const numeros = generarNumeros();
    numerosTablero = numeros.slice();
    maxNumero = Math.max(...numeros);
    proximoNumero = maxNumero;
    
    numeros.forEach(num => {
        const botoncito = document.createElement('button');
        botoncito.className = 'numero';
        botoncito.textContent = num;
        botoncito.dataset.valor = num;
        botoncito.dataset.correcto = false;
        
        botoncito.addEventListener('click', () => manejarClick(botoncito, num));
        numerosGrid.appendChild(botoncito);
    });
    
    remaining.textContent = '10';
}

function manejarClick(botoncito, valor) {
    if (!juegoActivo || botoncito.classList.contains('disabled')) return;
    
    if (valor === proximoNumero) {
        // ¡Correcto!
        botoncito.classList.add('correcto');
        botoncito.classList.add('disabled');
        combo += 1;
        puntaje += 10 + (combo * 2);
        numerosCorrectos += 1;
        
        const progreso = (numerosCorrectos / 10) * 100;
        progressFill.style.width = progreso + '%';
        remaining.textContent = 10 - numerosCorrectos;
        
        actualizarUI();
        
        if (numerosCorrectos === 10) {
            ganaste();
        } else {
            // Buscar el siguiente número más alto de los disponibles
            const numerosRestantes = numerosTablero.filter(num => {
                const botones = document.querySelectorAll('.numero');
                let encontrado = false;
                botones.forEach(btn => {
                    if (parseInt(btn.dataset.valor) === num && !btn.classList.contains('disabled')) {
                        encontrado = true;
                    }
                });
                return encontrado;
            });
            
            proximoNumero = Math.max(...numerosRestantes);
            mostrarMensaje(`🔍 Buscando: ${proximoNumero}`);
        }
    } else {
        // ¡Incorrecto!
        botoncito.classList.add('incorrecto');
        combo = 0;
        errores += 1;
        
        mostrarMensaje(`❌ ¡Error ${errores}/3! Debes buscar: ${proximoNumero}`);
        reproducirAudio('intentalo de nuevo');
        
        if (errores >= 3) {
            juegoActivo = false;
            clearInterval(timerId);
            estado.textContent = '😢 3 errores. Reiniciando números...';
            estado.style.color = '#d32f2f';
            
            setTimeout(() => {
                errores = 0;
                reiniciarNumeros();
            }, 1000);
        } else {
            setTimeout(() => {
                botoncito.classList.remove('incorrecto');
                if (juegoActivo) {
                    mostrarMensaje(`🔍 Buscando: ${proximoNumero}`);
                }
            }, 1200);
        }
    }
    
    actualizarUI();
}

function ganaste() {
    juegoActivo = false;
    clearInterval(timerId);
    
    const bonificacion = Math.max(0, tiempo * 5);
    puntaje += bonificacion;
    
    mostrarMensaje(`🎉 ¡GANASTE! Bonificación: ${bonificacion} pts`);
    estado.textContent = `¡Victoria! Total: ${puntaje} puntos`;
    estado.style.color = '#2e7d32';
    
    // Guardar puntuación
    const acumulado = parseInt(localStorage.getItem('puntajeAcumulado') || '0');
    localStorage.setItem('puntajeJuego4', puntaje);
    localStorage.setItem('puntajeAcumulado', acumulado + puntaje);
    
    lanzarConfetti();
    botonesFinales.style.display = 'flex';
}

function perdiste() {
    juegoActivo = false;
    clearInterval(timerId);
    
    estado.textContent = `¡Tiempo! Puntuación: ${puntaje}`;
    estado.style.color = '#d32f2f';
    mostrarMensaje('⏰ ¡Se acabó el tiempo!');
    
    // Guardar puntuación
    const acumulado = parseInt(localStorage.getItem('puntajeAcumulado') || '0');
    localStorage.setItem('puntajeJuego4', puntaje);
    localStorage.setItem('puntajeAcumulado', acumulado + puntaje);
    
    botonesFinales.style.display = 'flex';
}

function actualizarUI() {
    scoreSpan.textContent = puntaje;
    comboSpan.textContent = combo;
}

function mostrarMensaje(texto) {
    mensaje.textContent = texto;
}

function actualizarTiempo() {
    tiempo -= 1;
    timerEl.textContent = tiempo;
    
    const porcentaje = (tiempo / tiempoInicial) * 100;
    const offsetMax = 345.575;
    const offset = offsetMax - (porcentaje / 100) * offsetMax;
    timerProgress.style.strokeDashoffset = offset;
    
    if (tiempo <= 0) {
        perdiste();
    }
}

function lanzarConfetti() {
    if (!confettiContainer) return;
    confettiContainer.innerHTML = '';
    const colores = ['#ff4081', '#ffeb3b', '#7c4dff', '#43e97b', '#ff9800', '#7bdff2'];

    for (let i = 0; i < 50; i++) {
        const pieza = document.createElement('div');
        pieza.className = 'confetti-piece';
        const tamaño = Math.floor(Math.random() * 10) + 8;
        pieza.style.width = `${tamaño}px`;
        pieza.style.height = `${tamaño * 2}px`;
        pieza.style.left = `${Math.random() * 100}%`;
        pieza.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        pieza.style.animationDuration = `${Math.random() * 0.8 + 1.4}s`;
        pieza.style.opacity = `${0.8 + Math.random() * 0.2}`;
        pieza.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(pieza);
        pieza.addEventListener('animationend', () => pieza.remove());
    }
}

function reiniciarNumeros() {
    errores = 0;
    numerosCorrectos = 0;
    tiempo = tiempoInicial;
    juegoActivo = false;
    botonesFinales.style.display = 'none';
    crearTablero();
    actualizarUI();
    timerEl.textContent = tiempo;
    const offsetMax = 345.575;
    timerProgress.style.strokeDashoffset = offsetMax;
    mostrarMensaje(`🔄 Nuevos números. Busca: ${proximoNumero}`);
    clearInterval(timerId);
    timerId = setInterval(actualizarTiempo, 1000);
    setTimeout(() => {
        juegoActivo = true;
    }, 100);
}

function reiniciarJuego() {
    puntaje = 0;
    combo = 0;
    errores = 0;
    tiempo = tiempoInicial;
    numerosCorrectos = 0;
    juegoActivo = true;
    estado.textContent = '¡Empieza a jugar!';
    estado.style.color = '#4d4d4d';
    botonesFinales.style.display = 'none';
    crearTablero();
    actualizarUI();
    mostrarMensaje(`Buscando: ${proximoNumero}`);
    clearInterval(timerId);
    timerId = setInterval(actualizarTiempo, 1000);
}

reiniciarBtn.addEventListener('click', reiniciarJuego);
siguienteBtn.addEventListener('click', () => {
    window.location.href = 'juego5.html';
});

// Iniciar
cargarPerfil();
reiniciarJuego();
// Reproducir instrucciones y animar palabras al cargar
window.addEventListener('load', () => {
    setTimeout(() => reproducirInstrucciones(), 400);
});