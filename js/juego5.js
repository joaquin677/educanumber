const contenedorNumeros = document.getElementById("numeros");
const canasta = document.getElementById("canasta");
const mensaje = document.getElementById("mensaje");
const btnRevisar = document.getElementById("btnRevisar");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnPuntuaciones = document.getElementById("btnPuntuaciones");
const pregunta = document.getElementById("pregunta");
const confettiContenedor = document.getElementById("confetti");
const puntuacionDisplay = document.getElementById("puntuacion");


let seleccionados = [];
let audioContext;
let vozFemenina = null;
let puntos = 0;
const textoInstruccion = "Arrastra solamente los números pares a la canasta";


function actualizarPuntuacion(cantidad) {
    puntos += cantidad;
    puntuacionDisplay.textContent = `Puntos: ${puntos}`;
    guardarPuntuacion();
}


function guardarPuntuacion() {
    const nombre = localStorage.getItem('nombreJugador') || 'Jugador';
    const puntuacionesJSON = localStorage.getItem('puntuaciones') || '[]';
    let puntuaciones = JSON.parse(puntuacionesJSON);
    puntuaciones.push({ nombre: nombre, puntos: puntos, tiempo: new Date().toLocaleTimeString(), bonus: '+50' });
    localStorage.setItem('puntuaciones', JSON.stringify(puntuaciones));
}


function iniciarAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}


function obtenerVozFemenina(voces) {
    const esp = voces.filter(v => /es|spanish/i.test(v.lang));
    const preferidas = esp.filter(v => /female|femenina|woman|mujer/i.test(v.name));
    if (preferidas.length) return preferidas[0];
    return esp[0] || voces[0] || null;
}


function inicializarVoz() {
    const voces = speechSynthesis.getVoices();
    vozFemenina = obtenerVozFemenina(voces);
}


speechSynthesis.onvoiceschanged = inicializarVoz;
inicializarVoz();


function hablar(texto, usarFemenina = false) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    utterance.pitch = usarFemenina ? 1.25 : 1.0;
    if (usarFemenina && vozFemenina) {
        utterance.voice = vozFemenina;
    }
    speechSynthesis.speak(utterance);
}


function reproducirTono(frecuencia, duracion) {
    iniciarAudio();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frecuencia, audioContext.currentTime);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duracion / 1000);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duracion / 1000);
}


function reproducirCorrecto() {
    reproducirTono(660, 120);
    setTimeout(() => reproducirTono(880, 90), 140);
    setTimeout(() => reproducirTono(1040, 80), 260);
}


function reproducirIncorrecto() {
    reproducirTono(220, 200);
    setTimeout(() => reproducirTono(180, 160), 180);
}


function lanzarConfeti() {
    const cantidad = 40;
    const colores = ["#ff4d4d", "#ffd700", "#4dff88", "#4db8ff", "#d84dff", "#ffffff"];


    for (let i = 0; i < cantidad; i++) {
        const pieza = document.createElement("div");
        pieza.classList.add("confetti-piece");
        const tamaño = Math.floor(Math.random() * 10) + 8;
        pieza.style.width = `${tamaño}px`;
        pieza.style.height = `${Math.floor(tamaño * 1.8)}px`;
        pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
        pieza.style.left = `${Math.random() * 100}%`;
        pieza.style.top = `-20px`;
        pieza.style.opacity = `${Math.random() * 0.4 + 0.6}`;
        pieza.style.transform = `rotate(${Math.random() * 360}deg)`;
        pieza.style.animationDelay = `${Math.random() * 300}ms`;
        pieza.style.animationDuration = `${1200 + Math.random() * 700}ms`;
        confettiContenedor.appendChild(pieza);


        pieza.addEventListener("animationend", () => {
            pieza.remove();
        });
    }
}


function mezclarArray(array) {
    return array.sort(() => Math.random() - 0.5);
}


function generarNumeros(cantidad) {
    const numeros = [];
    const paresNecesarios = Math.min(5, Math.floor(cantidad / 2));
    const imparesNecesarios = Math.min(4, Math.floor(cantidad / 3));


    while (numeros.filter(n => n % 2 === 0).length < paresNecesarios) {
        numeros.push((Math.floor(Math.random() * 15) + 1) * 2);
    }


    while (numeros.filter(n => n % 2 !== 0).length < imparesNecesarios) {
        numeros.push(Math.floor(Math.random() * 15) * 2 + 1);
    }


    while (numeros.length < cantidad) {
        numeros.push(Math.floor(Math.random() * 30) + 1);
    }


    return mezclarArray(numeros);
}


function construirInstruccion() {
    pregunta.innerHTML = "";
    const palabras = textoInstruccion.split(" ");
    palabras.forEach((palabra, index) => {
        const span = document.createElement("span");
        span.textContent = palabra;
        pregunta.appendChild(span);
        if (index < palabras.length - 1) {
            pregunta.appendChild(document.createTextNode(" "));
        }
    });
}


function reproducirInstruccion() {
    const spans = Array.from(pregunta.querySelectorAll("span"));
    let palabraActual = 0;


    function limpiarClases() {
        spans.forEach(span => span.classList.remove("activo"));
    }


    function avanzarPalabra() {
        limpiarClases();
        if (palabraActual < spans.length) {
            spans[palabraActual].classList.add("activo");
            palabraActual += 1;
        } else {
            clearInterval(intervalo);
            limpiarClases();
        }
    }


    const utterance = new SpeechSynthesisUtterance(textoInstruccion);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);


    limpiarClases();
    avanzarPalabra();
    const intervalo = setInterval(avanzarPalabra, 420);
    utterance.onend = () => {
        clearInterval(intervalo);
        limpiarClases();
    };
}


function crearNivel() {
    seleccionados = [];
    mensaje.textContent = "";
    mensaje.className = "";
    canasta.innerHTML = "🧺 CANASTA DE PARES";
    canasta.classList.remove("resaltado");
    contenedorNumeros.innerHTML = "";


    const cantidad = 10;
    const numeros = generarNumeros(cantidad);


    numeros.forEach((numero, index) => {
        const div = document.createElement("div");
        div.classList.add("numero");
        div.textContent = numero;
        div.draggable = true;
        div.dataset.id = `numero-${index}`;
        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("numero", numero);
            e.dataTransfer.setData("id", div.dataset.id);
        });
        contenedorNumeros.appendChild(div);
    });
}


canasta.addEventListener("dragover", (e) => {
    e.preventDefault();
    canasta.classList.add("resaltado");
});


canasta.addEventListener("dragleave", () => {
    canasta.classList.remove("resaltado");
});


canasta.addEventListener("drop", (e) => {
    e.preventDefault();
    canasta.classList.remove("resaltado");
    const numero = parseInt(e.dataTransfer.getData("numero"), 10);
    const id = e.dataTransfer.getData("id");
    if (Number.isNaN(numero)) return;


    const elementoOriginal = document.querySelector(`[data-id="${id}"]`);
    if (elementoOriginal) {
        elementoOriginal.remove();
    }


    seleccionados.push(numero);


    const ficha = document.createElement("div");
    ficha.classList.add("numero-canasta");
    ficha.textContent = numero;
    canasta.appendChild(ficha);
});


btnRevisar.addEventListener("click", () => {
    if (seleccionados.length === 0) {
        alert("Debes arrastrar números a la canasta.");
        return;
    }


    const seleccionImpar = seleccionados.some(numero => numero % 2 !== 0);
    const numerosRestantes = Array.from(contenedorNumeros.querySelectorAll(".numero")).map(div => parseInt(div.textContent, 10));
    const paresRestantes = numerosRestantes.filter(numero => numero % 2 === 0);


    if (seleccionImpar) {
        mensaje.textContent = "❌ Elegiste mal un número";
        mensaje.className = "incorrecto";
        hablar("Elegiste mal un número", true);
        reproducirIncorrecto();
        setTimeout(crearNivel, 2000);
        return;
    }


    if (paresRestantes.length > 0) {
        mensaje.textContent = "⚠️ Aún faltan números pares por elegir";
        mensaje.className = "incorrecto";
        hablar("Aún faltan números pares por elegir", true);
        reproducirIncorrecto();
        return;
    }


    mensaje.textContent = "🎉 ¡Excelente! Ganaste";
    mensaje.className = "correcto";
    hablar("Excelente", true);
    reproducirCorrecto();
    lanzarConfeti();
    btnPuntuaciones.style.display = "inline-block";
    setTimeout(() => {
        window.location.href = "juego6.html";
    }, 2200);
});


btnReiniciar.addEventListener("click", () => {
    mensaje.textContent = "🔄 Juego reiniciado";
    mensaje.className = "";
    crearNivel();
});


construirInstruccion();
crearNivel();
window.addEventListener("load", () => {
    setTimeout(reproducirInstruccion, 600);
});
