    const contenedor = document.getElementById("numeros");
    const mensaje = document.getElementById("mensaje");

    let numeros = [1,2,3,4,5,6,7,8,9,10];

    function mezclar(array){
    for(let i = array.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    }

    function mostrarNumeros(){

    contenedor.innerHTML = "";

    numeros.forEach((num, index) => {

        const div = document.createElement("div");

        div.classList.add("numero");
        div.textContent = num;

        div.draggable = true;

        div.addEventListener("dragstart", () => {
        div.classList.add("arrastrando");
        });

        div.addEventListener("dragend", () => {
        div.classList.remove("arrastrando");
        });

        div.addEventListener("dragover", e => {
        e.preventDefault();
        });

        div.addEventListener("drop", () => {

        const arrastrando = document.querySelector(".arrastrando");

        const valor1 = parseInt(arrastrando.textContent);
        const valor2 = parseInt(div.textContent);

        const index1 = numeros.indexOf(valor1);
        const index2 = numeros.indexOf(valor2);

        [numeros[index1], numeros[index2]] =
        [numeros[index2], numeros[index1]];

        mostrarNumeros();
        });

        contenedor.appendChild(div);
    });
    }

    function verificarOrden(){

    let correcto = true;

    for(let i = 0; i < numeros.length; i++){

        if(numeros[i] !== i + 1){
        correcto = false;
        break;
        }
    }

    if(correcto){
        mensaje.textContent = "🎉 ¡Correcto! Los números están ordenados.";
        mensaje.style.color = "green";
    }else{
        mensaje.textContent = "❌ Todavía no están en orden.";
        mensaje.style.color = "red";
    }
    }

    document.getElementById("verificar")
    .addEventListener("click", verificarOrden);

    document.getElementById("reiniciar")
    .addEventListener("click", () => {

    mezclar(numeros);
    mostrarNumeros();

    mensaje.textContent = "";
    });

    mezclar(numeros);
    mostrarNumeros();