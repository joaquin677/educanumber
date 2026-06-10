const contenedor = document.getElementById("numeros");
const mensaje = document.getElementById("mensaje");
const puntajeTexto = document.getElementById("puntaje");
const puntajeAcumuladoTexto = document.getElementById("puntajeAcumulado");
const nombreJuego = document.getElementById("nombreJuego");
const avatarJuego = document.getElementById("avatarJuego");
const confettiContainer = document.getElementById("confetti-container");

let puntaje = 0;

// Función para reproducir audio automático con voz femenina
function reproducirAudioAutomatico() {
    const texto = "Elige tus números y lánzalos para ordenarlos de mayor a menor";
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

const nombreGuardado = localStorage.getItem('nombreJugador') || 'Jugador';
const avatarGuardado = localStorage.getItem('avatarJugador');
const savedGame1 = parseInt(localStorage.getItem('puntajeJuego1'), 10) || 0;
const savedGame2 = parseInt(localStorage.getItem('puntajeJuego2'), 10) || 0;
let puntajeAcumulado = parseInt(localStorage.getItem('puntajeAcumulado'), 10);
if (isNaN(puntajeAcumulado)) {
    puntajeAcumulado = savedGame1 + savedGame2;
}

if (nombreJuego) {
    nombreJuego.textContent = nombreGuardado;
}

if (avatarJuego) {
    if (avatarGuardado) {
        avatarJuego.src = avatarGuardado;
        avatarJuego.alt = nombreGuardado;
    } else {
        avatarJuego.src = '';
        avatarJuego.alt = 'Avatar';
    }
}

if (puntajeAcumuladoTexto) {
    puntajeAcumuladoTexto.textContent = `Total acumulado: ${puntajeAcumulado}`;
}

// Crear números de 3 cifras distintos
function generarNumeros() {

    let lista = [];

    while (lista.length < 5) {

        let numero = Math.floor(Math.random() * 900) + 100;

        if (!lista.includes(numero)) {
            lista.push(numero);
        }
    }

    return lista;
}

const numeros = generarNumeros();

mezclar(numeros);

numeros.forEach(numero => {

    const tarjeta = document.createElement("div");

    tarjeta.classList.add("numero");

    tarjeta.textContent = numero;

    tarjeta.draggable = true;

    contenedor.appendChild(tarjeta);

});

let elementoArrastrado = null;

contenedor.addEventListener("dragstart", e => {

    if (e.target.classList.contains("numero")) {
        elementoArrastrado = e.target;
    }

});

contenedor.addEventListener("dragover", e => {

    e.preventDefault();

});

contenedor.addEventListener("drop", e => {

    if (
        e.target.classList.contains("numero") &&
        elementoArrastrado
    ) {

        const temp = elementoArrastrado.textContent;

        elementoArrastrado.textContent =
            e.target.textContent;

        e.target.textContent = temp;
    }

});

function verificarOrden() {

    const tarjetas =
        document.querySelectorAll(".numero");

    const valores =
        [...tarjetas].map(t =>
            parseInt(t.textContent)
        );

    const ordenado =
        [...valores].sort((a, b) => b - a);

    const correcto =
        JSON.stringify(valores) ===
        JSON.stringify(ordenado);

    if (correcto) {

        puntaje += 10;

        puntajeTexto.textContent =
            `⭐ Puntos: ${puntaje}`;

        localStorage.setItem('puntajeJuego1', puntaje);
        puntajeAcumulado = puntaje + savedGame2;
        localStorage.setItem('puntajeAcumulado', puntajeAcumulado);
        if (puntajeAcumuladoTexto) {
            puntajeAcumuladoTexto.textContent = `Total acumulado: ${puntajeAcumulado}`;
        }

        mensaje.innerHTML =
            "🏆 ¡Excelente! Los ordenaste correctamente.";

        mensaje.style.color = "#2ecc71";

        lanzarConfeti();
        reproducirSonidoVictoria();
        hablar("Excelente trabajo");

        setTimeout(() => {
            window.location.href = 'juego2.html';
        }, 2500);

    } else {

        mensaje.innerHTML =
            "❌ Todavía no están ordenados de mayor a menor.";

        mensaje.style.color = "#e74c3c";

        hablar("Inténtalo otra vez");
    }
}

function hablar(texto) {

    const voz =
        new SpeechSynthesisUtterance(texto);

    voz.lang = "es-ES";

    speechSynthesis.speak(voz);
}

// Función para reproducir sonido de victoria
function reproducirSonidoVictoria() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Crear notas musicales de victoria (do, mi, sol - Do Mayor)
    const notas = [
        { frecuencia: 523.25, duracion: 0.2 },  // Do
        { frecuencia: 659.25, duracion: 0.2 },  // Mi
        { frecuencia: 783.99, duracion: 0.4 }   // Sol
    ];
    
    let tiempoActual = audioContext.currentTime;
    
    notas.forEach(nota => {
        const oscilador = audioContext.createOscillator();
        const ganancia = audioContext.createGain();
        
        oscilador.connect(ganancia);
        ganancia.connect(audioContext.destination);
        
        oscilador.frequency.value = nota.frecuencia;
        oscilador.type = 'sine';
        
        ganancia.gain.setValueAtTime(0.3, tiempoActual);
        ganancia.gain.exponentialRampToValueAtTime(0.01, tiempoActual + nota.duracion);
        
        oscilador.start(tiempoActual);
        oscilador.stop(tiempoActual + nota.duracion);
        
        tiempoActual += nota.duracion + 0.05;
    });
}

function lanzarConfeti() {
    if (!confettiContainer) return;
    confettiContainer.innerHTML = "";

    const colores = [
        '#ff5252', '#ffeb3b', '#4caf50', '#2196f3', '#7c4dff', '#ff9800'
    ];

    for (let i = 0; i < 40; i++) {
        const pieza = document.createElement('div');
        pieza.classList.add('confetti-piece');
        const tamaño = Math.floor(Math.random() * 14) + 8;
        pieza.style.width = `${tamaño}px`;
        pieza.style.height = `${tamaño * 1.8}px`;
        pieza.style.left = `${Math.random() * 100}%`;
        pieza.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        pieza.style.animationDuration = `${Math.random() * 0.8 + 1.2}s`;
        pieza.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(pieza);
    }

    setTimeout(() => {
        if (confettiContainer) confettiContainer.innerHTML = "";
    }, 2200);
}

function mezclar(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }
}