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

    validar();
}

// Validar botón
function validar() {
    let nombre = document.getElementById('nombre').value.trim();
    let boton = document.getElementById('btn');

    if (nombre !== '' && avatarSeleccionado !== null) {
        boton.classList.remove('inactivo');
        actualizarFeedback('');
    } else {
        boton.classList.add('inactivo');
        actualizarFeedback('Para continuar debes ingresar tu nombre y tu avatar.');
    }
}

// Ingresar
function ingresar() {
    let nombre = document.getElementById('nombre').value.trim();

    if (nombre === '' || avatarSeleccionado === null) {
        actualizarFeedback('Tienes que ingresar tu nombre y tu avatar.');
        return;
    }

    localStorage.setItem('nombreJugador', nombre);
    localStorage.setItem('avatarJugador', avatarSeleccionado);

    window.location.href = 'bienvenida.html';
}

// Inicializar al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    validar();
});