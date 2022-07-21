/*        */
/* HEADER */
/*        */


let buscadorHeader = document.querySelector(".header__buscador");
buscadorHeader.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let buscadorHeaderInput = e.target.querySelector("input");
    
    if (thisURL.includes("tienda.html")){   // Si estoy en la tienda
        let buscadorTienda = document.querySelector("#buscadorTienda");
        let buscadorTiendaInput = buscadorTienda.querySelector("input");

        // Pongo la palabra en el input del buscador de la tienda, le hago focus y disparo el botón
        let buscadorTiendaBoton = buscadorTienda.querySelector("button");
        buscadorTiendaInput.focus();
        buscadorTiendaInput.value = buscadorHeaderInput.value; 
        buscadorTiendaBoton.click();
        
        // Luego limpio el input del buscador del header, le saco el focus y scrolleo hasta la sección
        buscadorHeaderInput.value = "";
        buscadorHeaderInput.blur();
        document.querySelector(".main--tienda .main__titulo").scrollIntoView();

    } else {    // Voy a la tienda y guardo la información para lanzar el evento en la carga
        localStorage.setItem("busquedaTermino", buscadorHeaderInput.value);

        // Para ir a la tienda veo desde donde estoy yendo (index o las otras páginas)
        let tiendaURL = thisURL.includes("index.html") ? document.URL.replace(thisURL, "pages/tienda.html") : document.URL.replace(thisURL, "tienda.html");
        location.href = tiendaURL;

    }
})

/*        */
/* FOOTER */
/*        */
let newsletter = document.querySelector(".footer__newsletter");
newsletter.addEventListener("submit", (e) => {
    e.preventDefault();

    let email = e.target.querySelector("input").value;
    validarEmail(email) ? alert("GRACIAS POR SUSCRIBIRTE! A PARTIR DE AHORA VAS A RECIBIR NUESTRAS NOVEDADES EN TU EMAIL") : 
                          alert("INGRESASTE UN EMAIL INVÁLIDO!");
})

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