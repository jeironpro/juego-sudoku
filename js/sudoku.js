const tablero = document.getElementById("tablero");
const mensaje = document.getElementById("mensaje");
const contenedorTeclado = document.getElementById("teclado");
const casillas = Array.from({ length: 9 }, () => Array(9));

let tableroCompleto = [];
let tableroVisible = [];
let tableroActual = Array.from({ length: 9 }, () => Array(9).fill(""));
let casillaActiva = null;

function crearTablero() {
    for (let i = 0; i < 9; i++) {
        const fila = document.createElement("div");
        fila.classList.add("fila", "fila-sudoku");

        for (let j = 0; j < 9; j++) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.readOnly = true;
            input.classList.add("casilla");
            input.dataset.fila = i;
            input.dataset.columna = j;

            if (i % 3 === 0) input.classList.add("borde-superior");
            if (j % 3 === 0) input.classList.add("borde-izquierdo");
            if (i === 8) input.classList.add("borde-inferior");
            if (j === 8) input.classList.add("borde-derecho");

            input.addEventListener("focus", () => {
                casillaActiva = input;
            });

            casillas[i][j] = input;
            fila.appendChild(input);
        }
        tablero.appendChild(fila);
    }
}

function mostrarTablero() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const input = casillas[i][j];
            input.value = tableroActual[i][j];

            input.classList.remove("casilla-llena");
            if (tableroActual[i][j] !== "") {
                input.classList.add("casilla-llena");
                input.disabled = true;
            } else {
                input.disabled = false;
            }
        }
    }
}

function cargarSudoku() {
    fetch("json/sudokus.json")
        .then(respuesta => {
            if (!respuesta.ok) {
                console.log(`Error al intentar cargar los tableros: ${respuesta.status}`);
                throw new Error("Error al cargar sudoku");
            }
            return respuesta.json();
        })
        .then(sudokus => {
            const id = Math.floor(Math.random() * sudokus.length);
            const sudoku = sudokus[id];

            tableroCompleto = sudoku.completo;
            tableroVisible = sudoku.visible;

            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    tableroActual[i][j] = tableroVisible[i][j];
                }
            }
            mostrarTablero();
        })
        .catch(error => {
            console.log(`Error al intentar cargar el JSON: ${error}`);
        });
}

function moverFocoSiguiente() {
    let fila = parseInt(casillaActiva.dataset.fila);
    let columna = parseInt(casillaActiva.dataset.columna);

    for (let i = fila; i < 9; i++) {
        for (let j = (i === fila ? columna + 1 : 0); j < 9; j++) {
            const siguiente = casillas[i][j];
            if (!siguiente.disabled) {
                siguiente.focus();
                casillaActiva = siguiente;
                return;
            }
        }
    }
}

function verificarNumerosCompletados() {
    for (let grupoFila = 0; grupoFila < 3; grupoFila++) {
        for (let grupoColumna = 0; grupoColumna < 3; grupoColumna++) {
            let grupoCompleto = true;
            const casillasDelGrupo = [];

            for (let i = grupoFila * 3; i < grupoFila * 3 + 3; i++) {
                for (let j = grupoColumna * 3; j < grupoColumna * 3 + 3; j++) {
                    casillasDelGrupo.push(casillas[i][j]);
                    
                    if (casillas[i][j].value !== tableroCompleto[i][j]) {
                        grupoCompleto = false;
                    }
                }
            }

            if (grupoCompleto) {
                casillasDelGrupo.forEach(casilla => {
                    casilla.classList.add("numero-completado");
                    casilla.classList.remove("invalido", "casilla-llena");
                    casilla.disabled = true;
                });
            }
        }
    }
}

function validarSudoku() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (casillas[i][j].value.trim() === "") return false;
            if (casillas[i][j].value !== tableroCompleto[i][j]) return false;
        }
    }
    return true;
}

function mostrarMensaje(texto, tipo = "") {
    mensaje.style.display = "block";
    mensaje.textContent = texto;
    mensaje.className = "mensaje";

    if (tipo) {
        mensaje.classList.add(tipo, "mensaje-sudoku");
    }

    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
        mensaje.style.display = "none";
    }, 5000);
}

const teclas = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["eliminar", "enviar"]
];

teclas.forEach(fila => {
    const filaTeclado = document.createElement("div");
    filaTeclado.classList.add("fila-teclado");

    fila.forEach(letra => {
        const boton = document.createElement("button");
        boton.classList.add("tecla");

        if (letra === "eliminar") {
            boton.classList.add("eliminar");
            const iconEliminar = document.createElement("span");
            iconEliminar.className = "material-symbols-outlined";
            iconEliminar.textContent = "backspace";
            boton.appendChild(iconEliminar);
        } else if (letra === "enviar") {
            boton.classList.add("enviar");
            const iconEnviar = document.createElement("span");
            iconEnviar.className = "material-symbols-outlined";
            iconEnviar.textContent = "keyboard_return";
            boton.appendChild(iconEnviar);
        } else {
            boton.textContent = letra;
        }
        boton.setAttribute("data-tecla", letra);
        filaTeclado.appendChild(boton);
    });

    contenedorTeclado.appendChild(filaTeclado);
});

contenedorTeclado.addEventListener("click", (e) => {
    const boton = e.target.closest("button");
    if (!boton) return;

    const tecla = boton.getAttribute("data-tecla");
    if (!casillaActiva || casillaActiva.disabled) return;

    if (tecla === "eliminar") {
        casillaActiva.value = "";
        casillaActiva.focus();
        casillaActiva.classList.remove("invalido");
    } else if (tecla === "enviar") {
        if (validarSudoku()) {
            mostrarMensaje("¡Has ganado!", "exito");
        } else {
            mostrarMensaje("Aún hay errores o casillas vacías", "error");
        }
    } else {
        if (/^[1-9]$/.test(tecla)) {
            casillaActiva.value = tecla;

            const fila = parseInt(casillaActiva.dataset.fila);
            const columna = parseInt(casillaActiva.dataset.columna);
            const valorCorrecto = tableroCompleto[fila][columna];

            if (tecla !== valorCorrecto) {
                casillaActiva.classList.add("invalido");
                casillaActiva.focus();
            } else {
                casillaActiva.classList.remove("invalido");
                verificarNumerosCompletados();
                moverFocoSiguiente();
            }
        }
    }
});

crearTablero();
cargarSudoku();