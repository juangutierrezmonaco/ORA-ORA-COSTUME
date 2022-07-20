/**
 *  Funciones que son de uso general para todas las clases y funciones.
 */

function ingresarNumero (mensaje) {
    let num = parseInt(prompt(mensaje));
    while (isNaN(num)) {
        alert("Ingreso incorrecto. Intente nuevamente.");
        num = parseInt(prompt(mensaje));
    }

    return num;
}

function ingresarTexto (mensaje) {
    let word = prompt(mensaje);
    while (word == undefined || word == "") {
        if (word == undefined) {
            alert("Ingreso incorrecto. Intente nuevamente.");
        } else {
            alert("No ha ingresado nada. Intente nuevamente.");
        }

        word = prompt(mensaje);
    }
    
    return word;
}

function ingresarOpcion(limInf, limSup, mensaje, mensajeError = "Opción Incorrecta. Intente nuevamente!") {
    alert(mensaje);
    let opcion = parseInt(prompt("Elección: "));

    while (opcion < limInf || opcion > limSup || isNaN(opcion)) {
        alert(mensajeError);

        alert(mensaje);    
        opcion = parseInt(prompt("Elección: "));
    }

    return opcion;
}

function numbersInString (str) {    // Retorna los números de un string o NaN
    let result = str.split("").filter(c => !(isNaN(c)));
    return parseInt(result.join(""));
}

function calcularDescuento (total, desc) {
    return total * desc/100;
}

function calcularPrecioConDescuento (total, desc) {  // Se le pasa un total y un descuento en porcentaje, por ejemplo, si se le pasa un 10 significa 10%.
    return total * (1 - desc/100);
}

function actualizarStock () {
    for (const cosplay of carrito.cosplays) {
        cosplay.stock -= carrito.getCantidad(cosplay);
    }
}

// Estas funciones simulan cómo se recupera la data de la base de datos
function getCosplaysFromDB () {
    let cosplays = [];
    cosplays.push(new Cosplay("Nobara Kugisaki", "Jujutsu Kaisen", "Cosplay", 7000, 0, 10, 5, "./assets/images/cosplays/hechos-a-medida/jujutsu-nobara.png"));
    cosplays.push(new Cosplay("Rei Ayanami", "Evangelion", "Seifuku", 5500, 0, 2, 100, "./assets/images/cosplays/hechos-a-medida/evangelion-rei.png", true));
    cosplays.push(new Cosplay("Tradicional", "Anime", "Seifuku", 6000, 0, 100, 20, "./assets/images/cosplays/hechos-a-medida/school-girl.png"));
    cosplays.push(new Cosplay("Legión de Reconocimiento", "Shingeki no Kyojin", "Chaqueta", 6500, 10, 100, 0, "./assets/images/cosplays/hechos-a-medida/shingeki-chaqueta.png"));
    cosplays.push(new Cosplay("Legión de Reconocimiento", "Shingeki no Kyojin", "Saco", 9500, 25, 120, 5, "./assets/images/cosplays/hechos-a-medida/shigenki-saco.png", true));
    cosplays.push(new Cosplay("Kaonashi", "El viaje de Chihiro", "Cosplay", 8000, 15, 40, 7, "./assets/images/cosplays/chihiro-noface.png", true));

    return cosplays;
}

function getCodigosFromDB () {
    let codigosDescuento = new Map();
    codigosDescuento.set("ORA10", 10);
    codigosDescuento.set("ORA25", 25);
    codigosDescuento.set("CODERHOUSE", 30);
    codigosDescuento.set("JUAN50", 50);

    return codigosDescuento;
}