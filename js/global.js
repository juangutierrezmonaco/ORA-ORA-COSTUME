
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

function estoyEnIndex () {
    if (thisURL == "" || thisURL == "?" || thisURL.includes("index.html")){
        return true;
    }
    return false;
}

async function efectoCarga(sectionNode, delay = 1000){
    try {
        // Hago efecto de carga
        let efectoCarga = document.createElement("div");
        efectoCarga.classList.add("row", "d-flex", "justify-content-center");
        efectoCarga.innerHTML = `<div class="lds-spinner">
                                    <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                                </div>`;

        // Lo agrego al elemento pasado
        sectionNode.append(efectoCarga);

        let later =  (delay) => {
            return new Promise((resolve) => {
                setTimeout(resolve, delay);
            })
        }
        
        await later(delay).then(() => {
            galeriaCosplays.removeChild(efectoCarga);
        });

        return Promise.resolve();   // Devuelvo una promesa resuelta para hacer el then afuera
    } catch (error) {
        console.log(error);
    }
}


async function getCosplaysFromDB(){
    let res = await axios("../server/cosplays.json");
    let cosplays = res.data;

    let cosplaysObj = [];
    for (const c of cosplays) {
        let cosplay = new Cosplay();
        Object.assign(cosplay, c);

        if (!thisURL.includes("index.html") && thisURL != ""){  // Si no estoy en el index, la ruta es otra
            cosplay.imagen = "." + cosplay.imagen;
        }

        cosplaysObj.push(cosplay);
    }
    
    return cosplaysObj;
}

async function getCodigosFromDB () {
    let res = await axios("../server/codigosDesc.json");
    let codigosDescuento = res.data;

    codigosDescuento = new Map(codigosDescuento);

    return codigosDescuento;
}


async function getMedidasFromDB () {
    let res = await axios("../server/medidasSolicitadas.json");
    let medidas = res.data;

    let medidasObj = [];
    for (const m of medidas) {
        let medida = new Medida();
        Object.assign(medida, m);

        medidasObj.push(medida);
    }

    return medidasObj;
}