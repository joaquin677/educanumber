const contenedor = document.getElementById('numeros');
const mensaje = document.getElementById('mensaje');
const scoreSpan = document.getElementById('score');
const attemptsSpan = document.getElementById('attempts');
const reiniciarBtn = document.getElementById('reiniciar');
const siguienteBtn = document.getElementById('siguiente');
const botonesFinales = document.getElementById('botones-finales');
const confettiContainer = document.getElementById('confetti-container');
const canastas = document.querySelectorAll('.canasta');

// Elementos de interfaz del jugador
const avatarJuego3 = document.getElementById('avatarJuego3');
const nombreJugadorElem = document.getElementById('nombreJugador');
const puntajeTotalElem = document.getElementById('puntajeTotal');
const puntajeJuego3Elem = document.getElementById('puntajeJuego3');

function cargarInfoJugador() {
    const nombre = localStorage.getItem('nombreJugador') || localStorage.getItem('playerName') || 'Jugador';
    const avatar = localStorage.getItem('avatarJugador') || '';
    const pj1 = parseInt(localStorage.getItem('puntajeJuego1') || '0', 10);
    const pj2 = parseInt(localStorage.getItem('puntajeJuego2') || '0', 10);
    const pj3 = parseInt(localStorage.getItem('puntajeJuego3') || '0', 10);
    const acumulado = pj1 + pj2 + pj3;

    nombreJugadorElem.textContent = nombre;
    if (avatar && avatarJuego3) {
        avatarJuego3.src = avatar;
        avatarJuego3.style.display = 'block';
    } else if (avatarJuego3) {
        avatarJuego3.style.display = 'none';
    }

    if (puntajeTotalElem) puntajeTotalElem.textContent = `Total acumulado: ${acumulado}`;
    if (puntajeJuego3Elem) puntajeJuego3Elem.textContent = `Puntos Juego 3: ${pj3}`;
}

// Audio de victoria (mismo que en juego2)
const audioVictoria = new Audio('sonidos/avatar.mp3');
audioVictoria.volume = 0.9;

// Reproducir audio automático de instrucciones al cargar
function reproducirAudioAutomatico() {
    const descElem = document.querySelector('.descripcion');
    if (!descElem) return;

    // Dividir el texto en palabras y envolver en spans.palabra
    const texto = descElem.textContent.trim();
    const palabrasArr = texto.split(/\s+/);
    descElem.innerHTML = palabrasArr.map(w => `<span class="palabra">${w}</span>`).join(' ');
    const palabras = Array.from(descElem.querySelectorAll('.palabra'));

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voces = speechSynthesis.getVoices();
    const vozEspanola = voces.find(voz => voz.lang === 'es-ES') || voces[0];
    if (vozEspanola) utterance.voice = vozEspanola;

    // Animar cada palabra cuando el TTS vaya avanzando
    let indice = 0;
    utterance.onboundary = (event) => {
        if (event.name === 'word' && indice < palabras.length) {
            const el = palabras[indice];
            el.classList.add('animate');
            setTimeout(() => el.classList.remove('animate'), 600);
            indice += 1;
        }
    };

    // Cancelar posibles síntesis previas y hablar
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

let numeroSeleccionado = null;
let puntaje = 0;
let intentos = 0;
let completados = 0;
let juegoTerminado = false;
const totalNumeros = 8;

function generarNumeros() {
    const lista = [];
    while (lista.length < totalNumeros) {
        const numero = Math.floor(Math.random() * 90) + 10;
        if (!lista.includes(numero)) lista.push(numero);
    }
    return lista;
}

function crearNumeros() {
    contenedor.innerHTML = '';
    const numeros = generarNumeros();

    numeros.forEach(valor => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('numero');
        tarjeta.textContent = valor;
        tarjeta.draggable = true;

        tarjeta.addEventListener('dragstart', () => {
            numeroSeleccionado = tarjeta;
        });

        contenedor.appendChild(tarjeta);
    });
}

function resetCanastas() {
    canastas.forEach(canasta => {
        const contenido = canasta.querySelector('.contenido');
        contenido.innerHTML = '';
    });
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
        pieza.style.animationDuration = `${Math.random() * 0.8 + 1.4}s`;
        pieza.style.opacity = `${0.8 + Math.random() * 0.2}`;
        pieza.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(pieza);
        pieza.addEventListener('animationend', () => pieza.remove());
    }
}

function updateStatus() {
    scoreSpan.textContent = puntaje;
    attemptsSpan.textContent = intentos;
}

function mostrarMensaje(texto, color = '#4d4d4d') {
    mensaje.textContent = texto;
    mensaje.style.color = color;
}

function validarResultado() {
    let esCorrect = true;
    const numerosArrastrados = new Set();

    canastas.forEach(canasta => {
        const contenido = canasta.querySelector('.contenido');
        const numeros = contenido.querySelectorAll('.numero');
        const tipoCanasta = canasta.dataset.tipo;

        numeros.forEach(numEl => {
            const valor = parseInt(numEl.textContent, 10);
            const esPar = valor % 2 === 0;
            numerosArrastrados.add(valor);

            if ((esPar && tipoCanasta === 'par') || (!esPar && tipoCanasta === 'impar')) {
                // Correcto, no hacer nada especial
            } else {
                esCorrect = false;
            }
        });
    });

    return esCorrect && numerosArrastrados.size === totalNumeros;
}

function mostrarResultado() {
    if (juegoTerminado) return;

    const esCorrect = validarResultado();

    if (esCorrect) {
        // ¡Ganó!
        mostrarMensaje('🎉 ¡Ganaste! Todos los números están en el lugar correcto.', '#2e7d32');
        lanzarConfetti();
        puntaje = totalNumeros * 10;
        updateStatus();
        // Guardar puntaje de este juego y recalcular acumulado
        try {
            localStorage.setItem('puntajeJuego3', String(puntaje));
            const pj1 = parseInt(localStorage.getItem('puntajeJuego1') || '0', 10);
            const pj2 = parseInt(localStorage.getItem('puntajeJuego2') || '0', 10);
            const total = pj1 + pj2 + puntaje;
            localStorage.setItem('puntajeAcumulado', String(total));
            if (puntajeTotalElem) puntajeTotalElem.textContent = `Total acumulado: ${total}`;
            if (puntajeJuego3Elem) puntajeJuego3Elem.textContent = `Puntos Juego 3: ${puntaje}`;
        } catch (e) {
            console.warn('No se pudo guardar puntaje en localStorage:', e);
        }
        try {
            audioVictoria.currentTime = 0;
            audioVictoria.play();
        } catch (e) {
            console.warn('No se pudo reproducir audio de victoria:', e);
        }
    } else {
        // Error
        mostrarMensaje('❌ Algunos números no están en el lugar correcto. Intenta de nuevo.', '#d32f2f');
    }

    juegoTerminado = true;
    botonesFinales.style.display = 'flex';
}

function crearJuego() {
    puntaje = 0;
    intentos = 0;
    completados = 0;
    juegoTerminado = false;
    resetCanastas();
    crearNumeros();
    updateStatus();
    mostrarMensaje('¡Clasifica todos los números para ganar!');
    botonesFinales.style.display = 'none';
}


canastas.forEach(canasta => {
    canasta.addEventListener('dragover', e => {
        e.preventDefault();
    });

    canasta.addEventListener('drop', () => {
        if (!numeroSeleccionado || juegoTerminado) return;

        intentos += 1;
        canasta.querySelector('.contenido').appendChild(numeroSeleccionado);
        completados += 1;
        updateStatus();

        if (completados === totalNumeros) {
            mostrarMensaje('✅ ¡Ordenaste todos los números! Verifica si está correcto.');
            mostrarResultado();
        }

        numeroSeleccionado = null;
    });
});

reiniciarBtn.addEventListener('click', crearJuego);
siguienteBtn.addEventListener('click', () => {
    window.location.href = 'juego4.html';
});
crearJuego();
// Reproducir instrucciones al cargar (si el navegador lo permite)
window.addEventListener('load', () => {
    setTimeout(() => reproducirAudioAutomatico(), 500);
    cargarInfoJugador();
});