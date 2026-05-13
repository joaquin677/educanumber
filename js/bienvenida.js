const synth = window.speechSynthesis;
let vozFemenina = null;

function cargarVoces() {
    const voces = synth.getVoices();
    if (!voces || voces.length === 0) {
        return;
    }

    vozFemenina = voces.find(voz => {
        const nombre = voz.name.toLowerCase();
        return voz.lang.toLowerCase().startsWith('es') && /maria|sofia|lucia|helena|ana|laura|clara|silvia|paola|valentina|carla/.test(nombre);
    }) || voces.find(voz => voz.lang.toLowerCase().startsWith('es')) || voces[0];
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

function lanzarConfeti() {
    const colores = ['#ff4081', '#ffea00', '#00e676', '#2979ff', '#ff6d00', '#d500f9'];
    const cantidad = 35;

    for (let i = 0; i < cantidad; i++) {
        const confeti = document.createElement('div');
        confeti.className = 'confeti';
        confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        confeti.style.left = `${Math.random() * 100}vw`;
        confeti.style.width = `${Math.random() * 8 + 6}px`;
        confeti.style.height = `${Math.random() * 8 + 6}px`;
        confeti.style.animationDuration = `${Math.random() * 1.2 + 1.4}s`;
        confeti.style.opacity = `${Math.random() * 0.6 + 0.4}`;
        document.body.appendChild(confeti);

        confeti.addEventListener('animationend', () => {
            confeti.remove();
        });
    }
}

function mostrarBienvenida() {
    const nombre = localStorage.getItem('nombreJugador') || '';
    const nombreJugador = document.getElementById('nombreJugador');
    const mensajeVoz = document.getElementById('mensajeVoz');

    nombreJugador.textContent = nombre;
    mensajeVoz.textContent = nombre ? `Bienvenido, ${nombre}! Si estás preparado, presiona Empezar.` : 'Bienvenido! Si estás preparado, presiona Empezar.';

    const textoHablar = nombre ? `Bienvenido, ${nombre}. Si estás preparado, presiona empezar.` : 'Bienvenido. Si estás preparado, presiona empezar.';
    hablar(textoHablar);
}

if ('speechSynthesis' in window) {
    cargarVoces();
    synth.onvoiceschanged = cargarVoces;
}

// Obtener datos guardados e iniciar bienvenida
window.addEventListener('DOMContentLoaded', () => {
    const avatar = localStorage.getItem('avatarJugador');
    if (avatar) {
        document.getElementById('avatar').src = avatar;
    }
    mostrarBienvenida();
});

// Ir al juego
function empezar() {
    lanzarConfeti();
    setTimeout(() => {
        window.location.href = 'juego1.html';
    }, 700);
}