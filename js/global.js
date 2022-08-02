
/**
 *  Funciones que son de uso general para todas las clases y funciones.
 */

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

/**
 * Acceptable email prefix formats
 *      Allowed characters: letters (a-z), numbers, underscores, periods, and dashes.
 *      An underscore, period, or dash must be followed by one or more letter or number.
 */
 function _isPrefixValid (prefix) {
    if ("_-.".includes(prefix.slice(-1)) || "_-.".includes(prefix.slice(0, 1))) return false; // No puede terminar ni empezar con un símbolo
    if (prefix.length >= 64) return false   // No puede tener má de 64 caracteres

    let str = prefix.split("");
    let validChars = "abcdefghijklmnopqrstuvwxyz0123456789_-."
    let numbersAndLetters = validChars.replace("_-.", "");

    let flagNext = false;

    for (const c of str) {
        if (!validChars.includes(c)){   // Si tiene un caracter inválido
            return false;
        }

        if (flagNext && !numbersAndLetters.includes(c)){    // Acá entra si el anterior es "_-." y no sigue una letra
            return false;
        } else {                                            // Sino setteo la flag de vuelta a false
            flagNext = false;
        }

        if ("_-.".includes(c)){     // Si es un símbolo permitido, tiene que seguir por una letra o número
            flagNext = true;
        }
    }

    return true;
}

/**
 * Acceptable email domain formats
 *      Allowed characters: letters, numbers, dashes.
 *      The last portion of the domain must be at least two characters, for example: .com, .org, .cc
 */
function _isDomainValid (domain) {
    let afterDot = domain.split(".").pop();
    let beforeDot = domain.replace(afterDot, "").slice(0, -1);
    
    if (afterDot.length == 0 || beforeDot.length == 0) return false;    

    let validChars = "abcdefghijklmnopqrstuvwxyz0123456789-"
    let numbersAndLetters = validChars.replace("-", "");

    // Primera mitad - Si empieza o termina con símbolo ya no es válido
    if (!numbersAndLetters.includes(beforeDot.slice(-1)) || !numbersAndLetters.includes(beforeDot.slice(0, 1))) return false; 

    let strBD = beforeDot.split("");
    let flagNext = false;
    for (const c of strBD) {
        if (!validChars.includes(c)){   // Si tiene un caracter inválido
            return false;
        }

        if (flagNext && !numbersAndLetters.includes(c)){    // Acá entra si el anterior es "-" y no sigue una letra
            return false;
        } else {                                            // Sino setteo la flag de vuelta a false
            flagNext = false;
        }

        if ("-".includes(c)){     // Si es un símbolo permitido, tiene que seguir por una letra o número
            flagNext = true;
        }
    }

    // Segunda mitad - Si la longitud es menor a 2 ya no es válido.
    if (afterDot.length < 2) return false;  // La longitud de la última parte debe ser de al menos 2 caracteres

    let strAD = afterDot.split("");
    for (const c of strAD) {
        if (!numbersAndLetters.includes(c)) return false;
    }

    return true;
    
}

// De momento sólo valida los mails que tienen un solo dominio, con .com.ar se rompe. Pero era para tener algo momentaneamente.
function validarEmail (email){
    email = email.toLowerCase();    // Primero lo paso todo a minúscula

    let domain = email.split("@").pop();
    let prefix = email.replace(domain, "").slice(0, -1);    // Saco el dominio y el arroba que separa al dominio y el prefijo

    return _isDomainValid(domain) && _isPrefixValid(prefix);
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