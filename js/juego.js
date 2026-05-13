const contenedor = document.getElementById("numeros");
const nombreJugadorElemento = document.getElementById('nombreJugadorJuego1');
const avatarJugadorElemento = document.getElementById('avatarJugadorJuego1');

function mostrarJugador() {
    const nombre = localStorage.getItem('nombreJugador');
    const avatar = localStorage.getItem('avatarJugador');

    if (!nombre || !avatar) {
        window.location.href = 'index.html';
        return;
    }

    nombreJugadorElemento.textContent = nombre;
    avatarJugadorElemento.src = avatar;
    avatarJugadorElemento.alt = `${nombre} avatar`;
}

mostrarJugador();

// Crear números del 1 al 10
for(let i = 1; i <= 10; i++){

    const div = document.createElement("div");

    div.classList.add("numero");

    div.textContent = i;

    // Al hacer clic
    div.addEventListener("click", () => {

        hablarNumero(i);

        animarNumero(div);

    });

    contenedor.appendChild(div);

}

// Voz femenina
function hablarNumero(numero){

    const mensaje = new SpeechSynthesisUtterance(numero);

    mensaje.lang = "es-ES";

    mensaje.pitch = 1.2;

    mensaje.rate = 1.5;

    // Buscar voz femenina
    const voces = speechSynthesis.getVoices();

    const vozFemenina = voces.find(voz =>
        voz.lang.includes("es") &&
        voz.name.toLowerCase().includes("female")
    );

    if(vozFemenina){
        mensaje.voice = vozFemenina;
    }

    speechSynthesis.speak(mensaje);

}

// Animación
function animarNumero(elemento){

    elemento.classList.add("activo");

    setTimeout(() => {

        elemento.classList.remove("activo");

    }, 300);

}

// Siguiente juego
function siguiente(){

    window.location.href = "juego2.html";

}