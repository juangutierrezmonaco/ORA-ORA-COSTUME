// Variables globales
let codigosDescuento;
let cosplays;
let medidasPersona = [];
let carrito = new Carrito();

let thisURL = document.URL.split("/").pop();  // Ruta relativa de la página en la que estoy
let galeriaCosplays;
let carritoHtmlGaleria = document.querySelector("#galeria__carrito");
let carritoHtmlFooter = document.querySelector("#footer__carrito");

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

    cosplays.push(new Cosplay("Nobara Kugisaki", "Jujutsu Kaisen", "Cosplay", 7000, 0, 10, 5, "./assets/images/cosplays/hechos-a-medida/jujutsu-nobara.png", true));
    cosplays.push(new Cosplay("Rei Ayanami", "Evangelion", "Seifuku", 5500, 0, 2, 100, "./assets/images/cosplays/hechos-a-medida/evangelion-rei.png", true));
    cosplays.push(new Cosplay("Tradicional", "Anime", "Seifuku", 6000, 0, 100, 20, "./assets/images/cosplays/hechos-a-medida/school-girl.png", true));
    cosplays.push(new Cosplay("Legión de Reconocimiento", "Shingeki no Kyojin", "Chaqueta", 6500, 10, 100, 0, "./assets/images/cosplays/hechos-a-medida/shingeki-chaqueta.png", true));
    cosplays.push(new Cosplay("Legión de Reconocimiento", "Shingeki no Kyojin", "Saco", 9500, 25, 120, 5, "./assets/images/cosplays/hechos-a-medida/shigenki-saco.png", true));
    cosplays.push(new Cosplay("Kaonashi", "El viaje de Chihiro", "Cosplay", 8000, 15, 40, 7, "./assets/images/cosplays/chihiro-noface.png"));
    cosplays.push(new Cosplay("Legión de Reconocimiento", "Shingeki no Kyojin", "Cosplay", 8000, 0, 200, 20, "./assets/images/cosplays/snk-full.png"));
    cosplays.push(new Cosplay("Kaguya Ootsutsuki", "Naruto Shippuden", "Cosplay", 12000, 20, 10, 15, "./assets/images/cosplays/naruto-kaguya.png"));
    cosplays.push(new Cosplay("Ciel Phantomhive", "Kuroshitsuji", "Cosplay", 14000, 0, 5, 30, "./assets/images/cosplays/kuroshitsuji-ciel.png"));
    cosplays.push(new Cosplay("Gintoki Sakata", "Gintama", "Cosplay", 12000, 0, 40, 50, "./assets/images/cosplays/gintama-gintoki.png"));
    cosplays.push(new Cosplay("Sailor Moon", "Sailor Moon", "Cosplay", 10000, 20, 100, 100, "./assets/images/cosplays/sailormoon-sailormoon.png"));
    cosplays.push(new Cosplay("Draken", "Tokyo Revengers", "Chaqueta", 3900, 0, 45, 55, "./assets/images/cosplays/tokyo-revengers-draken-chaqueta.png"));
    cosplays.push(new Cosplay("Androide 18", "Dragon Ball Z", "Cosplay", 9000, 15, 25, 35, "./assets/images/cosplays/dbz-androide-18.png"));
    cosplays.push(new Cosplay("Joline Cujoh", "Jojo's Bizarre Adventure", "Cosplay", 14000, 0, 10, 20, "./assets/images/cosplays/jojo-jolyne-cujoh.png"));
    cosplays.push(new Cosplay("Kashuu Kiyomitsu", "Touken Ranbu", "Cosplay", 8000, 25, 5, 20, "./assets/images/cosplays/touken-ranbu-kashuu-kiyomitsu.png"));
    cosplays.push(new Cosplay("Kirito", "Sword Art Online", "Cosplay", 10000, 0, 30, 40, "./assets/images/cosplays/sao-kirito.png"));
    cosplays.push(new Cosplay("Raven", "Jóvenes Titanes", "Cosplay", 10000, 0, 45, 10, "./assets/images/cosplays/jovenes-titanes-raven.png"));
    cosplays.push(new Cosplay("Tsukasa Yugi", "Jibaku Shonen", "Cosplay", 9500, 50, 20, 5, "./assets/images/cosplays/jibaku-shonen-tsukasa-yugi.png"));
    cosplays.push(new Cosplay("Tanjiro Kamado", "Kimetsu No Yaiba", "Cosplay", 11000, 0, 60, 40, "./assets/images/cosplays/kimetsu-no-yaiba-tanjiro.png"));

    if (!thisURL.includes("index.html") && thisURL != ""){  // Si no estoy en el index, la ruta es otra
        for (const cosplay of cosplays) {
            cosplay.imagen = "." + cosplay.imagen;
        }
    }

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

function getMedidasFromDB () {
    let medidas = [];

    medidas.push(new Medida("Contorno de Cabeza", "img", "https://ss-static-01.esmsv.com/id/79166/galeriaimagenes/obtenerimagen/?id=19&tipoEscala=stretch&width=863&height=480"));
    medidas.push(new Medida("Contorno de Cuello", "iframe", "https://www.youtube.com/embed/TZzaGHdcCZ0"));
    medidas.push(new Medida("Largo Talle Trasero", "iframe", "https://www.youtube.com/embed/6-uzsyLYXkU"));
    medidas.push(new Medida("Largo Talle Delantero", "iframe", "https://www.youtube.com/embed/Z8MqsQPbg70"));
    medidas.push(new Medida("Ancho de Hombro", "iframe", "https://www.youtube.com/embed/MC_mGKA8z_I"));
    medidas.push(new Medida("Ancho de Espalda", "iframe", "https://www.youtube.com/embed/bZFsfsP6eg4" ));
    medidas.push(new Medida("Contorno de Pecho", "iframe", "https://www.youtube.com/embed/OM1PGABODys"));
    medidas.push(new Medida("Altura de Busto", "iframe", "https://www.youtube.com/embed/Eo2DlzDo7ko"));
    medidas.push(new Medida("Separación de Busto", "iframe", "https://www.youtube.com/embed/bqpSwMKQytI"));
    medidas.push(new Medida("Contorno de Cintura", "iframe", "https://www.youtube.com/embed/bgh9mdepiKI"));
    medidas.push(new Medida("Contorno de Cadera", "iframe", "https://www.youtube.com/embed/AoK47JJZ8w8"));
    medidas.push(new Medida("Altura de Cadera", "iframe", "https://www.youtube.com/embed/dDWjjlLYHl0"));
    medidas.push(new Medida("Largo de Brazo", "iframe", "https://www.youtube.com/embed/bnKqGqfcXYM"));
    medidas.push(new Medida("Bajada de Sisa Delantera", "iframe", "https://www.youtube.com/embed/QiUsB1tghK0" ));
    medidas.push(new Medida("Bajada de Sisa Espalda", "iframe", "https://www.youtube.com/embed/QiUsB1tghK0"));
    medidas.push(new Medida("Contorno de Brazo", "iframe", "https://www.youtube.com/embed/sG6yboMbpvg"));
    medidas.push(new Medida("Contorno de Muñeca", "iframe", "https://www.youtube.com/embed/BLQDhfmsa5g"));
    medidas.push(new Medida("Largo de Tiro", "iframe", "https://www.youtube.com/embed/B24TUok7g2w"));
    medidas.push(new Medida("Largo de Pierna", "iframe", "https://www.youtube.com/embed/_E1__Pbu-r8" ));
    medidas.push(new Medida("Altura de Rodilla", "iframe", "https://www.youtube.com/embed/kehweIM6KmY"));
    medidas.push(new Medida("Contorno de Pierna", "img", "https://ss-static-01.esmsv.com/id/79166/galeriaimagenes/obtenerimagen/?id=21&tipoEscala=stretch&width=911&height=683"));
    medidas.push(new Medida("Contorno de Rodilla", "img", "https://ss-static-01.esmsv.com/id/79166/galeriaimagenes/obtenerimagen/?id=33&tipoEscala=stretch&width=920&height=668"));
    medidas.push(new Medida("Contorno de Pantorrilla", "img", "https://ss-static-01.esmsv.com/id/79166/galeriaimagenes/obtenerimagen/?id=25&tipoEscala=stretch&width=803&height=603"));
    medidas.push(new Medida("Contorno de Tobillo", "img", "https://ss-static-01.esmsv.com/id/79166/galeriaimagenes/obtenerimagen/?id=35&tipoEscala=stretch&width=920&height=550"));
    medidas.push(new Medida("Largo de Tiro Delantero", "img", "https://ss-static-01.esmsv.com/id/79166/galeriaimagenes/obtenerimagen/?id=29&tipoEscala=stretch&width=771&height=1028" ));
    medidas.push(new Medida("Largo de Tiro Trasero", "img", "https://ss-static-01.esmsv.com/id/79166/galeriaimagenes/obtenerimagen/?id=31&tipoEscala=stretch&width=771&height=1028" ));

    return medidas;
}