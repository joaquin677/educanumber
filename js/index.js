let avatarSeleccionado = null;
const synth = window.speechSynthesis;
let vozFemenina = null;

function cargarVoces() {
    const voces = synth.getVoices();
    if (!voces || voces.length === 0) {
        return;
    }

    vozFemenina = voces.find(voz => {
        const nombre = voz.name.toLowerCase();
        return voz.lang.toLowerCase().startsWith('es') && /maria|sofia|lucia|sofia|helena|ana|laura|clara|silvia|paola|valentina|carla/.test(nombre);
    }) || voces.find(voz => voz.lang.toLowerCase().startsWith('es')) || voces[0];
}

if ('speechSynthesis' in window) {
    cargarVoces();
    synth.onvoiceschanged = cargarVoces;
}

function hablar(texto) {
    if (!('speechSynthesis' in window)) {
        return;
    }
    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-ES';
    mensaje.rate = 1;
    mensaje.pitch = 1.1;
    if (vozFemenina) {
        mensaje.voice = vozFemenina;
    }
    synth.cancel();
    synth.speak(mensaje);
}

function actualizarFeedback(texto) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = texto;
    if (texto) {
        hablar(texto);
    }
}

// Seleccionar avatar
function seleccionar(elemento) {
    let avatars = document.querySelectorAll('.avatars img');
    avatars.forEach(img => img.classList.remove('activo'));

    elemento.classList.add('activo');
    avatarSeleccionado = elemento.src;

    reproducirSonidoAuto();
    validar();
}

function reproducirSonidoAuto() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
        return;
    }

    const ctx = new AudioCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);

    const startOsc = ctx.createOscillator();
    const startGain = ctx.createGain();
    const startFilter = ctx.createBiquadFilter();

    startOsc.type = 'square';
    startOsc.frequency.setValueAtTime(80, ctx.currentTime);
    startOsc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.18);

    startFilter.type = 'lowpass';
    startFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    startFilter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.18);

    startGain.gain.setValueAtTime(0, ctx.currentTime);
    startGain.gain.linearRampToValueAtTime(0.34, ctx.currentTime + 0.02);
    startGain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.2);

    startOsc.connect(startFilter);
    startFilter.connect(startGain);
    startGain.connect(masterGain);

    startOsc.start(ctx.currentTime);
    startOsc.stop(ctx.currentTime + 0.2);

    const runOsc = ctx.createOscillator();
    const runGain = ctx.createGain();
    const runFilter = ctx.createBiquadFilter();

    runOsc.type = 'sawtooth';
    runOsc.frequency.setValueAtTime(180, ctx.currentTime + 0.18);
    runOsc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.6);

    runFilter.type = 'lowpass';
    runFilter.frequency.setValueAtTime(900, ctx.currentTime + 0.18);
    runFilter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.6);

    runGain.gain.setValueAtTime(0, ctx.currentTime + 0.18);
    runGain.gain.linearRampToValueAtTime(0.26, ctx.currentTime + 0.24);
    runGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.0);

    runOsc.connect(runFilter);
    runFilter.connect(runGain);
    runGain.connect(masterGain);

    runOsc.start(ctx.currentTime + 0.18);
    runOsc.stop(ctx.currentTime + 1.0);
}

function mostrarConfeti() {
    const colores = ['#ff5ec5', '#ffd700', '#4dd0ff', '#8d7bff', '#ff8c42', '#46d4a1'];

    for (let i = 0; i < 35; i++) {
        const confeti = document.createElement('div');
        const tamaño = Math.floor(Math.random() * 10) + 8;
        const retraso = Math.random() * 0.4;
        const duracion = 1.5 + Math.random() * 1.2;
        const izquierda = Math.random() * 100;
        const rotacion = Math.random() * 360;

        confeti.className = 'confeti';
        confeti.style.width = `${tamaño}px`;
        confeti.style.height = `${tamaño * 0.5}px`;
        confeti.style.background = colores[Math.floor(Math.random() * colores.length)];
        confeti.style.left = `${izquierda}vw`;
        confeti.style.animationDuration = `${duracion}s`;
        confeti.style.animationDelay = `${retraso}s`;
        confeti.style.transform = `rotate(${rotacion}deg)`;
        confeti.style.opacity = String(0.8 + Math.random() * 0.2);

        document.body.appendChild(confeti);

        setTimeout(() => {
            confeti.remove();
        }, (duracion + retraso) * 1000 + 500);
    }
}

// Validar botón
function validar() {
    let nombre = document.getElementById('nombre').value.trim();
    let boton = document.getElementById('btn');

    if (nombre !== '' && avatarSeleccionado !== null) {
        boton.classList.remove('inactivo');
        actualizarFeedback('');
    } else if (nombre !== '' && avatarSeleccionado === null) {
        boton.classList.add('inactivo');
        actualizarFeedback('Elige un avatar.');
    } else if (nombre === '' && avatarSeleccionado !== null) {
        boton.classList.add('inactivo');
        actualizarFeedback('Ingresa tu nombre.');
    } else {
        boton.classList.add('inactivo');
        actualizarFeedback('Para continuar debes ingresar tu nombre y elegir un avatar.');
    }
}

// Ingresar
function ingresar() {
    let nombre = document.getElementById('nombre').value.trim();
    const boton = document.getElementById('btn');

    if (nombre === '' || avatarSeleccionado === null) {
        if (nombre === '' && avatarSeleccionado === null) {
            actualizarFeedback('Tienes que ingresar tu nombre y elegir un avatar.');
        } else if (nombre === '') {
            actualizarFeedback('Por favor ingresa tu nombre.');
        } else {
            actualizarFeedback('Elige un avatar.');
        }
        return;
    }

    boton.classList.add('animando');
    boton.disabled = true;

    localStorage.setItem('nombreJugador', nombre);
    localStorage.setItem('avatarJugador', avatarSeleccionado);

    mostrarConfeti();

    setTimeout(() => {
        window.location.href = 'bienvenida.html';
    }, 2200);
}

// Inicializar al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    validar();
});
