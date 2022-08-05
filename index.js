// Variables globales
let codigosDescuento;   // Guarda los códigos de descuento recuperados de la base de datos
let cosplaysBackup;     // Guarda los cosplays recuperados de la base de datos
let cosplaysTienda;     // Lleva una constancia de los cosplays que están en la tienda (Por si se filtran o se buscan)
let indiceUltimoCosplayVisto = 0;   // Es una variable para la tienda, para llevar una constancia de cuántos se están mostrando

let carrito = new Carrito();    // Carrito de cosplays
let clienteLoggeado = new User();   // Se usa para llevar el usuario loggeado la última vez y recuperarlo
let thisURL = document.URL.split("/").pop();  // Ruta relativa de la página en la que estoy


// MAIN --> Función que representa la carga de todos los elementos dinámicos de la página
async function main () {
    try {
        // Recupero información de la base de datos
        codigosDescuento = await getCodigosFromDB();    // --> Lo necesito en todas las páginas porque el carrito está en todas
        cosplaysTienda = await getCosplaysFromDB();     // --> Lo necesito en todas las páginas porque el carrito (que tiene cosplays) está en todas
        cosplaysBackup = cosplaysTienda.map(x => x);    // --> Hago un backup para poder recuperar lo que había sin ir a la base de datos
        
        // Carga de elementos dinámicos de las páginas que lo tienes
        switch (true) {
            case estoyEnIndex():
                cargarIndex();
                break;
            case thisURL.includes("tienda.html"):
                cargarTienda();
                break;
            case thisURL.includes("medidas.html"):
                cargarMedidas();
                break;
        }
        
        // Recupero información del localStorage del carrito
        carrito.recuperarCarrito();
        cargarCarrito();    // Se cargan todos los eventos del carrito una vez que se recupero toda la información  

        // Recupero datos del usuario y si todavía no está loggeado muestro un cartel de bienvenida 
        if ( clienteLoggeado.recuperarUser()) {
            if (!usuarioEstaLoggeado()) {   // Si es la primera vez que se abre la página después de loggearse
                // Disparo el evento de login
                let formLogin = document.querySelector(".formLogin");
                
                formLogin.querySelector("#formInicioSesionEmail").value = clienteLoggeado.email;
                formLogin.querySelector("#formInicioSesionPassword").value = clienteLoggeado.password;

                formLogin.querySelector("button").click();
            } else {
                switchBotonesUsuario(); // Si ya está loggeado sólo cambio los botones
            }
        }
        
    } catch (error) {
        mostrarCartelError();
        console.log(error);
    }      
}

main();

/**************************************************************/
/*                      INDEX Y TIENDA                        */
/**************************************************************/
let galeriaCosplays;    // Galeria en el html de la tienda o el index, como se usa en muchas funciones lo deje de variable global para comodidad.

// Convierte los cosplays al formato que tienen que tener en el html y los agrega
function cargarGaleria (arrCosplays) {
    for (const cosplay of arrCosplays) {
        let cosplayHtml = cosplay.toHtml();

        if (estoyEnIndex()) {    // Si estoy en el index, que sean más grandes los cosplays
            cosplayHtml.classList.remove("col-lg-2") 
            cosplayHtml.classList.remove("d-none"); // Muestro todos (Por defecto no se ven)
        } 
        galeriaCosplays.append(cosplayHtml);
    }
}

function cargarIndex(){
    // Referencia a la galería del index
    galeriaCosplays = document.querySelector(".main--index .galeriaCosplays");

    // Creación de galería y muestra
    let cosplaysIndex = cosplaysTienda.filter((c) => c.especial);
    cargarGaleria(cosplaysIndex);
}

function cargarTienda(){  
    // Referencia a la galería de la tienda
    galeriaCosplays = document.querySelector(".main--tienda .galeriaCosplays");
    cargarGaleria(cosplaysTienda);   
    mostrarCosplaysTienda(); 
    
    // Si alguien buscó en el header DE OTRA PÁGINA, recupero la búsqueda del localStorage y disparo el evento de búsqueda
    if (localStorage.getItem("busquedaTermino") != null){
        let buscadorBoton = buscadorHeader.querySelector("button");
        let buscadorInput = buscadorHeader.querySelector("input");
        
        // Pongo la palabra en el input y la borro del storage
        buscadorInput.focus();
        buscadorInput.value = localStorage.getItem("busquedaTermino");
        localStorage.removeItem("busquedaTermino");

        buscadorBoton.click();  
    }
}

function mostrarCosplaysTienda (mult = 2) {     // Por defecto se muestran dos filas de cosplays
    // Obtengo la cantidad de cosplays que entran en una fila
    let resolucion = window.innerWidth;
    let cantPorFila;
    switch (true) {
        case (resolucion < 576):
            cantPorFila = 1 * 4;    // Entra uno pero muestro de a 4
            break;
        case (resolucion >= 576 && resolucion < 768):
            cantPorFila = 2 * 2;        // Entran 2 pero muestro de a 4
            break;
        case (resolucion >= 768 && resolucion < 992):
            cantPorFila = 3;
            break;
        case (resolucion >= 992 && resolucion < 1400):
            cantPorFila = 4;
            break;
        case (resolucion >= 1400):
            cantPorFila = 5;
            break;
    }

    let quieroMostrar = cantPorFila * mult;    // Cantidad de filas que se quieren mostrar

    let quedanPorMostrar = galeriaCosplays.querySelectorAll(".cosplay.d-none").length;  // Cantidad de cosplays que quedan para mostrar

    let cant = quedanPorMostrar < quieroMostrar ? quedanPorMostrar : quieroMostrar; // Muestro dependiendo de los que me quedan para mostrar
    quedanPorMostrar -= cant;   // Actualizo quedanPorMostrar
    
    for (let i = indiceUltimoCosplayVisto; i < indiceUltimoCosplayVisto + cant; i++) {
        galeriaCosplays.childNodes[i + 1].classList.remove("d-none");
    }

    // Actualizo índice del último cosplay visible
    indiceUltimoCosplayVisto += cant;

    // Por último si no tengo más desactivo el botón y si, se restaura el arreglo original (por un filtro por ejemplo), se vuelve a activar.
    let botonMas = document.querySelector(".main--tienda .botonMasTienda");
    botonMas.disabled = quedanPorMostrar == 0 ? true : false;
}

// Modificación de galería, se puede pasar un cartel para mostrar antes de la galeria
function actualizarGaleria (cosplaysModificados, mensaje = "") {
    galeriaCosplays.innerHTML = ""; // Borro lo que ya estaba

    let titulo = document.createElement("h2");
    titulo.innerHTML = `<h2>${mensaje}</h2>`;
    galeriaCosplays.append(titulo);

    if (estoyEnIndex()) {
        cargarIndex();  // Cargo de vuelta todos porque el index muestra todos los que cumplen cierta condición
    } else {
        cargarGaleria(cosplaysModificados);
        indiceUltimoCosplayVisto = 0;  // Actualizo porque se actualizó la galeria
        mostrarCosplaysTienda(); // Cuando carga por primera vez, muestro 2 filas
    }
}

// Esta función es para obtener el estado actual de los cosplays en la galería  (Por ejemplo: si se quiere ordenar cosplays ya filtrados o filtrar cosplays buscados) --> Devuelve los que están seleccionados en el DOM (inclusive los que no se ven)
function getCosplaysFromHtml () {
    let cosplaysModificados = [];
    let cosplaysHtml = galeriaCosplays.querySelectorAll(".cosplay");

    for (const cosplay of cosplaysHtml) {
        let thisId = getIdCosplayHtml(cosplay);
        cosplaysModificados.push(searchCosplayById(thisId));
    }

    return cosplaysModificados;
}

// Eventos de la tienda
if (thisURL.includes("tienda.html")){
    // Orden en la galería  - Ordena lo que está a la vista (o sea, lo que está en el html), si se filtra o se busca, ordena eso y no el arreglo original.
    let opcionesOrden = document.querySelector("#ordenCosplaysTienda");
    opcionesOrden.onchange = () => {
        let cosplaysOrdenados = getCosplaysFromHtml();

        switch (opcionesOrden.value) {
            case "nombre-asc-anime":
                cosplaysOrdenados.sort((a, b) => {
                    if (a.anime > b.anime) {
                        return 1;
                    } else if (a.anime < b.anime) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                break;
            case "nombre-des-anime":
                cosplaysOrdenados.sort((a, b) => {
                    if (a.anime > b.anime) {
                        return -1;
                    } else if (a.anime < b.anime) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                break;
            case "nombre-asc-personaje":
                cosplaysOrdenados.sort((a, b) => {
                    if (a.personaje > b.personaje) {
                        return 1;
                    } else if (a.personaje < b.personaje) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                break;
            case "nombre-des-personaje":
                cosplaysOrdenados.sort((a, b) => {
                    if (a.personaje > b.personaje) {
                        return -1;
                    } else if (a.personaje < b.personaje) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                break;
            case "menor-precio":
                cosplaysOrdenados.sort((a, b) => a.calcularPrecio() - b.calcularPrecio());
                break;
            case "mayor-precio":
                cosplaysOrdenados.sort((a, b) => b.calcularPrecio() - a.calcularPrecio());
                break;
            case "pred":
                cosplaysOrdenados.sort((a, b) => b.popularidad - a.popularidad); // No hay default porque la opción ya está validada
        }
        actualizarGaleria(cosplaysOrdenados);
    }

    // Aplicación de filtros a la galería
    let opcionesFiltro = document.querySelector("#filtroCosplaysTienda");

    opcionesFiltro.onchange = () => {
        let checkBoxes = document.querySelectorAll('input[name=filtrado-articulos]');

        // Genero un filtro que retorna una función que es la conjunción de los 3 filtros, por si se aplican 1, 2 o n filtros al mismo tiempo o algunos.
        const filtro = (c) => {
            let funcion = true;
            for (const checkBox of checkBoxes) {
                if (checkBox.checked) {
                    switch (checkBox.id) {
                        case "oferta":
                            funcion = funcion & c.oferta > 0;
                        break;
                        case "stock":
                            funcion = funcion & c.stock > 0;
                        break;  
                        case "especial":
                            funcion = funcion & c.especial > 0;
                        break;
                    }
                }
            }

            return funcion;
        }

        let cosplaysFiltrados = cosplaysTienda.filter(filtro);
        actualizarGaleria(cosplaysFiltrados); 
    }
    
    // Búsqueda en la galería
    let buscadorTienda = document.querySelector("#buscadorTienda");
    let buscadorTiendaInput = buscadorTienda.querySelector("input");

    buscadorTienda.addEventListener("submit", buscar);    // Para hacer click en la lupa y que busque

    buscadorTiendaInput.addEventListener("change", buscar);    // En caso de que se desenfoque

    buscadorTiendaInput.addEventListener("keydown", (e) => {  
        if (e.key == "\n") {    // Para hacer click en enter y que busque
            buscar(e);
        } 

        // Si se borra, se restaura el arreglo al original y se busca nuevamente (porque en la búsqueda modifico el arreglo). También aplica para el caso que no se ponga nada en la búsqueda, se restaura el arreglo. Luego de que se restaura se disparan los otros eventos para buscar.
        if (e.key = "\r") {     
            cosplaysTienda = cosplaysBackup;
        }
    });

    function buscar (e) {
        e.preventDefault();
        let word;
        let form = e.target;
        /* form.querySelector("button").blur();  // Saco el focus del botón */

        if (e.type == "submit") {   // Se llamó haciendo click en el botón
            word = form.children[0].value;
        } else {                    // Se llamó desenfocando el input
            word = form.value;
        }

        cosplaysTienda = cosplaysTienda.filter(c => 
            c.personaje.toLowerCase().includes(word.toLowerCase()) ||
            c.anime.toLowerCase().includes(word.toLowerCase())  ||
            c.tipo.toLowerCase().includes(word.toLowerCase())
        )
    
        let mensaje = "";
        if (cosplaysTienda.length == 0) {
            mensaje = "No hay coincidencias con la búsqueda";
        }
    
        actualizarGaleria(cosplaysTienda, mensaje);
    
        // Por último, cuando se busca se borran todos los filtros.
        // Esto es porque se puede buscar y filtrar esos resultados, pero no buscar en los resultados filtrados.
        let checkBoxes = document.querySelectorAll('input[name=filtrado-articulos]');
        for (const cb of checkBoxes) {
            cb.checked = false;
        }
        
        // A su vez también el orden, lo vuelvo a predeterminado.
        let opcionesOrden = document.querySelector("#ordenCosplaysTienda");
        opcionesOrden.value = "pred"; 
    }

    // Click en el botón de mostrar más de la galería
    let botonMas = document.querySelector(".main--tienda .botonMasTienda");
    botonMas.addEventListener("click", (e) => {
        efectoCarga(galeriaCosplays).then(() => {
            mostrarCosplaysTienda(1);
        });
        e.target.blur();    // Remuevo el focus del botón
    });
}

/**************************************************************/
/*                         MEDIDAS                            */
/**************************************************************/
let medidasPersona;    // Luego será un arreglo con las medidas ya cargadas

async function cargarMedidas(){
    // Recupero las medidas ya cargadas
    medidasPersona = recuperarMedidas();

    let galeriaDeMedidas = document.querySelector(".main--medidas .galeriaMedidas");
    
    try {
        let medidas = await getMedidasFromDB();

        for (const medida of medidas) {
            // Si estaba guardada la recupero
            let medidaGuardada = medidasPersona.find( (m) => numbersInString(m.idMedida) == medida.id);

            let medidaHTML;

            if (medidaGuardada != undefined) {  // Si estaba guardada pongo el valor en el input y la coloreo
                medidaHTML = medida.toHtml(medidaGuardada.valorMedida);

                let medidaTitulo = medidaHTML.querySelector(".medida__titulo");
                medidaTitulo.classList.add("medida__cargada");    // Se colorea
            } else {                            // Sino la agrego por defecto
                medidaHTML = medida.toHtml();
            }

            galeriaDeMedidas.append(medidaHTML);
        }
    } catch (error) {
        console.log(error);
    }
}

function sendMailMedidas (form) {   // Manda un mail al dueño de la página con las medidas que se cargaron y los datos pedidos
    let nombre = form.querySelector("#nombre").value.toUpperCase();
    let boton = form.querySelector(".botonMedidas");

    boton.innerText = 'Enviando...';

    const Toast = Swal.mixin({
        toast: true,
        showConfirmButton: false,   
        timer: 5000,
        position: "top-end",
        color: "#645899"
    });

    emailjs.init('9oAkw-6MONbCSxNDH');
    const serviceID = "service_hopw67s";
    const templateID = "template_gunk3ul";

    emailjs.send(serviceID, templateID, {   
        name_cosplay: form.querySelector("#nombre-cosplay").value,
        age: form.querySelector("#edad").value,
        name: form.querySelector("#nombre").value,
        phone: form.querySelector("#celular").value,
        message: form.querySelector("#comentario").value,
        html: tablaConMedidasCargadas(medidasPersona)
    }).then(() => {
        Toast.fire({
            icon: 'success',
            title: `${nombre}! Vamos a estar comunicandonos con vos lo antes posible!`,
        })
        boton.innerText  = 'Enviar';
    }).catch(error => {
        Toast.fire({
            icon: 'error',
            title: "Hubo un error. Espera un rato e intenta nuevamente."
        });
        console.log(error);
        boton.innerText  = 'Enviar';
    });
}

if (thisURL.includes("medidas.html")){
    // Carga de medidas
    let galeriaDeMedidas = document.querySelector(".main--medidas .galeriaMedidas");
    galeriaDeMedidas.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Obtengo el valor ingresado
        let valorMedida = e.target.querySelector("input").value;

        // Obtengo el id de la medida
        let padreMayor = e.target;
        while (padreMayor.id == "") {       // Escalo hasta hallar un elemento con id (el padre)
            padreMayor = padreMayor.parentElement;
        }

        let idMedida = padreMayor.id;

        // Y obtengo el titulo de la medida para cambiar el color y designar que la medida ya está cargada
        let medidaTitulo = padreMayor.parentElement.querySelector(".medida__titulo");

        medidaTitulo.classList.remove("medida__cargada");      // Se descolorea */

        const Toast = Swal.mixin({  // Alerta que se dispara según cómo se completó más abajo
                toast: true,
                showConfirmButton: false,   
                timer: 5000,
                position: "top-end",
                color: "#645899"
        })
        
        if (valorMedida != ""){         // Si ingreso algo 

            medidaTitulo.classList.add("medida__cargada");    // Se colorea

            // Lo guardo en el array de medidas. Si ya estaba guardado en el arreglo tengo que modificar el valor guardado
            let medidaGuardada = medidasPersona.find( (m) => m.idMedida == idMedida);
            
            if (medidaGuardada != undefined){   // Estaba guardada de antes
                medidaGuardada.valorMedida = valorMedida;
            } else {    // No estaba guardada
                let nombreMedida = padreMayor.parentElement.querySelector(".medida__titulo").innerText;
                medidasPersona.push({idMedida, valorMedida, nombreMedida});
            }
            
            guardarMedidas();   // Se guarda el arreglo en el localStorage
            
            Toast.fire({
                icon: 'success',
                title: 'Se guardo correctamente la medida!'
            });

        } else {
            Toast.fire({
                    icon: 'error',
                    title: 'No ingresaste nada! No se guardo la medida.'
            });
        }

        // Cuando termino cierro la ventana abierta de la medida
        document.querySelector(`#${idMedida} .btn-close`).click();
    })

    // Formulario con las medidas y la información complementaria
    let formMedidas = document.querySelector(".formMedidas");
    formMedidas.addEventListener("submit", (e) => {
        e.preventDefault();

        sendMailMedidas(e.target);
    })

}

function tablaConMedidasCargadas(arrMedidas) {  // Función que genera una tabla con las medidas en formato html para mandar por mail
    let tabla = document.createElement("table");

    tabla.innerHTML = `<thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Nombre de la medida</th>
                                <th scope="col">Valor de la medida (cm)</th>
                            </tr>
                        </thead>

                        <tbody>
                        </tbody>`

    let bodyTabla = tabla.querySelector("tbody");

    let i = 1;
    for (const medida of arrMedidas) {
        let fila = document.createElement("tr");
        fila.innerHTML = `  <th scope="row">${i++}</th>
                            <td>${medida.nombreMedida}</td>
                            <td>${medida.valorMedida}</td>`
        bodyTabla.append(fila)
    }

    return tabla.outerHTML;
}

/**************************************************************/
/*                          ENVIOS                            */
/**************************************************************/
if (thisURL.includes("envios.html")){
    let formEnvios = document.querySelector(".main--envios .formEnvios");
    let goToOCA = formEnvios.querySelector(`button[type = "button"]`);
    
    goToOCA.addEventListener("click", (e) => {
        e.target.blur();    // Saco el focus del botón

        Swal.fire({
            title: "Esta siendo redireccionado a la página de OCA",
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
        }).then(() => {
            window.open('https://www.oca.com.ar/Busquedas/CodigosPostales', '_blank');
        })
        Swal.showLoading();
    })

    formEnvios.addEventListener("submit", (e) => {
        e.preventDefault();
        e.target.querySelector(".btn").blur();      // Saco el focus del botón
        // De momento lo dejo así porque no sé cómo validar códigos postales y hallar su valor.
        let codigoPostal = e.target.querySelector("#codigo-postal").value;
        let costoEnvio = 1000;

        Swal.fire({
            title: `El envío al código postal ${codigoPostal} tiene un valor de $${costoEnvio}`,
            showCancelButton: true,
            confirmButtonText: 'Guardar como mi código postal',
            denyButtonText: `Volver atrás`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Código postal guardado!', '', 'success')
                carrito.codigoPostal = codigoPostal;
                carrito.envio = costoEnvio;
                actualizarCarrito();
            }
        })
    })
}

/**************************************************************/
/*                        CONTACTO                            */
/**************************************************************/
function sendMailContacto (form) {  // Manda el mail al dueño de la página con la información de la persona
    let nombre = form.querySelector("#nombre--contacto").value.toUpperCase();
    let boton = form.querySelector(".boton--contacto");
    
    boton.innerText = 'Enviando...';

    const Toast = Swal.mixin({
        toast: true,
        showConfirmButton: false,   
        timer: 5000,
        position: "top-end",
        color: "#645899"
    });
    
    emailjs.init('9oAkw-6MONbCSxNDH');
    const serviceID = "service_hopw67s";
    const templateID = "template_wyd82p8";

    emailjs.send(serviceID, templateID, {
        name: form.querySelector("#nombre--contacto").value,
        email: form.querySelector("#email--contacto").value,
        phone: form.querySelector("#telefono--contacto").value,
        message: form.querySelector("#mensaje--contacto").value,
    })
    .then(() => {
        Toast.fire({
            icon: 'success',
            title: `${nombre}! Vamos a estar comunicandonos con vos lo antes posible!`,
        })
        boton.innerText  = 'Enviar';
    }).catch(error => {
        Toast.fire({
            icon: 'error',
            title: "Hubo un error. Espera un rato e intenta nuevamente."
        });
        console.log(error);
        boton.innerText  = 'Enviar';
    });
}

if (thisURL.includes("contacto.html")){
    let formContacto = document.querySelector(".main--contacto .formContacto");
    formContacto.addEventListener("submit", (e) => {
        e.preventDefault();
        let email = e.target.querySelector("#email--contacto").value;
        
        if (validarEmail(email)){
            sendMailContacto(e.target);
        } else {
            const Toast = Swal.mixin({
                toast: true,
                showConfirmButton: false,   
                timer: 5000,
                position: "top-end",
                color: "#645899"
            }).fire({
                icon: 'error',
                title: 'Vamos a necesitar un email válido para poder comunicarnos con vos!'
            });
        }
    })
}

/**************************************************************/
/*                          CARRITO                           */
/**************************************************************/
let carritoHtmlGaleria = document.querySelector("#galeria__carrito");   // Cosplays en el carrito
let carritoHtmlFooter = document.querySelector("#footer__carrito");     // Footer del carrito

// Se encarga de transportar todas las modificaciones en el carrito al html.
function actualizarCarrito (inputCodigoText = localStorage.getItem("inputCodigoDesc")) {
    // Guardo en localStorage
    carrito.guardarCarrito();

    // Si pasa algo por parámetro tengo que actualizar el localStorage del código de descuento
    localStorage.removeItem("inputCodigoDesc");
    localStorage.setItem("inputCodigoDesc", inputCodigoText);
    
    // Actualizo cartel 
    let carritoVacio = document.querySelector("#carritoVacio");
    let mensaje = document.createElement("h5");
    mensaje.innerText = (carrito.length() == 0) ?  "No hay productos en su carrito!" : "";

    carritoVacio.innerHTML = '';
    carritoVacio.append(mensaje);

    // Actualizo galeria carrito
    carritoHtmlGaleria.innerHTML = ''; // Ya que voy a recorrer todo nuevamente

    for (cosplay of carrito.cosplays) {
        carritoHtmlGaleria.append(carrito.cosplayToHtml(cosplay));
    }

    // Actualizo el footer
    carritoHtmlFooter.innerHTML = '';
    if (carrito.getCantidadTotal() != 0) {
        carritoHtmlFooter.append(carrito.footerToHtml());
    }

    // Actualizo el carrito del header
    let carritoHeader = document.querySelector(".header__carrito span");
    carritoHeader.innerHTML = `CARRITO (${carrito.getCantidadTotal()}) $${carrito.total}`;

    // Como actualicé todo, borré el código ingresado pero quiero que quede a la vista para el usuario.
    let inputCodigo = carritoHtmlFooter.querySelector("#codigoDescuento");
    if (inputCodigo != null) { 
        inputCodigo.value = localStorage.getItem("inputCodigoDesc");
    }

    // Por último actualizo el localStorage si se borró el carrito o está vacío
    if (carrito.length() == 0) {
        localStorage.removeItem("inputCodigoDesc");
        localStorage.setItem("inputCodigoDesc", ""); 
        carrito.descuento = 0;
        carrito.codigoPostal = "";
    }
}

function cargarCarrito () {     // EVENTOS DEL CARRITO
    // Paso código de descuento si existía de antes
    let codigoTexto = localStorage.getItem("inputCodigoDesc") == null ? "" : localStorage.getItem("inputCodigoDesc");
    actualizarCarrito(codigoTexto);

    // Click en carrito de los cosplays
    if(estoyEnIndex() || thisURL.includes("tienda.html")) {
        galeriaCosplays.addEventListener("submit", (e) => {
            e.preventDefault();
            let thisId = getIdCosplayHtml(e.submitter.parentElement);
            let selectedCosplay = searchCosplayById(thisId);

            // Primero veo si existe en el carrito
            if (!carrito.existeCosplay(selectedCosplay)) {
                carrito.agregarCosplay(selectedCosplay);
                actualizarCarrito();
            } else {
                // Ahora necesito ir a la galería del carrito y buscar el cosplay que coincida y disparar el evento del botón más de ese,
                // para validar si se puede agregar y mostrar el cartel de que no hay stock, y funcionalidades ya hechas ahí.
                let nodosCarrito = carritoHtmlGaleria.childNodes;
        
                let nodoCosplay = "";   // Este sería el encontrado
                let i = 0;
                
                // Mientras no lo encuentre o se recorran todos los nodos y no lo encuentre (error que no tendría que pasar, pero evito el loop infinito)
                while (nodoCosplay == "" && i < nodosCarrito.length) {  
                    let thisCosplay = nodosCarrito[i++].querySelector(".header__carrito__offcanvas__producto__info");
        
                    if (getIdCosplayHtml(thisCosplay) == selectedCosplay.id) {
                        nodoCosplay = thisCosplay;
                    }
                }
        
                // Accedo a su botón de más y lo clickleo
                let botonMas = nodoCosplay.querySelector(".carritoMas");
                botonMas.click();
            }
        })
    }

    // Click en el más, menos, o tachito
    carritoHtmlGaleria.addEventListener("submit", (e) => {
        e.preventDefault();

        // Recupero la información del cosplay actual y para eso necesito llegar al nodo padre que tiene el id.
        let parent = e.submitter;
        while (parent.className != "header__carrito__offcanvas__producto") {
            parent = parent.parentNode;
        }

        let id = getIdCosplayHtml(parent.querySelector(".header__carrito__offcanvas__producto__info"));
        let thisCosplay = searchCosplayById(id);
        
        let cantidad = parseInt(parent.querySelector(".carritoCantidad").innerText);

        if (e.submitter.className.includes("carritoMas")) {
            
            if (cantidad == thisCosplay.stock) {
                // Escalo hasta llegar a la info del cosplay y voy stockAgotado para mostrar el cartel.
                let mensaje = parent.querySelector(".stockAgotado"); 
            
                if (mensaje.innerText == "") {  // Si todavía no saltó el cartel
                    mensaje.innerText = "¡UY! NO TENEMOS MÁS STOCK DE ESTE PRODUCTO PARA AGREGARLO AL CARRITO.";
                } else {
                    mensaje.classList.remove("shake-vertical");
                    window.requestAnimationFrame(() => {
                        mensaje.classList.add("shake-vertical");
                    });
                }
            } else {
                carrito.agregarCosplay(thisCosplay);
                actualizarCarrito();
            }

        }

        if (e.submitter.className.includes("carritoMenos")) {
            if (cantidad > 1) {
                carrito.eliminarCosplay(thisCosplay);
                actualizarCarrito();
            }
        }   

        if (e.submitter.className.includes("tachito")) {
            carrito.eliminarCosplayCompleto(thisCosplay);
            actualizarCarrito();
        }    
    })

    // Click en el aplicar descuento o iniciar compra
    carritoHtmlFooter.addEventListener("submit", (e) => {
        e.preventDefault();

        if (e.submitter.className.includes("aplicarCodigo")) {
            let inputCodigo = carritoHtmlFooter.querySelector("#codigoDescuento");
            let codigoDesc = inputCodigo.value.toUpperCase();   // Me traigo el código en el input
            let desc = codigosDescuento.get(codigoDesc);
            

            let mensaje;
            let color;

            if (desc != undefined) {    // Si lo encontró
                carrito.descuento = desc;
                mensaje = `DESCUENTO APLICADO (${desc}% OFF) <i class="fa-solid fa-face-grin-stars"></i>`;
                color = "text-success";
            } else {
                carrito.descuento = 0; 
                mensaje = `CUPÓN INVÁLIDO <i class="fa-solid fa-face-grin-beam-sweat"></i> `;
                color = "text-danger";
            }
            
            actualizarCarrito(inputCodigo.value);    // Como reimprimo todo el carrito, necesito pasar el valor ingresado por el usuario para que perdure 

            // Por último muestro un cartel si el código es o no inválido
            let mensajeDescuento = document.querySelector(".cartelCodigoDescuento"); 
            mensajeDescuento.innerHTML = mensaje;

            mensajeDescuento.classList.remove("fade-out", color);
            window.requestAnimationFrame(() => {
                mensajeDescuento.classList.add("fade-out", color);
            });
        }

        if (e.submitter.className.includes("iniciarCompra")) {

            // Cierro la ventana del carrito
            document.querySelector("#offcanvasCarrito .btn-close").click();
            
            // Lanzo una alerta para ir a mercado pago
            Swal.fire({
                title: `Esta por ser redireccionado a la página de MERCADO PAGO para abonar el monto de $ ${carrito.calcularTotal()}`,
                text: "Fijate de permitir las pop-ups"
            }).then(() => {
                // Cartel que va a comunicar el resultado de la operación
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    width: 500,
                    showConfirmButton: false,
                    timer: 5000,
                    timerProgressBar: true
                });

                // Función que ejecuta la compra
                compra(carrito.calcularTotal())
                    .then(() => {   // Si la compra fue exitosa
                        // Actualizo stock
                        actualizarStock();

                        // Borro el carrito
                        carrito.borrarCarrito();
                        actualizarCarrito();

                        // Por último, si estoy en la tienda o en el index, actualizo la galería por si alguno se quedó sin stock
                        if (estoyEnIndex() || thisURL.includes("tienda.html")){
                            actualizarGaleria(cosplaysTienda);
                        }

                        // Alerta de que todo está correcto
                        Toast.fire({
                            icon: 'success',
                            title: 'Felicitaciones! Dentro de poco te vamos a estar mandando el detalle de tu compra!'
                        });
                    })
                    . catch(error => {
                        Toast.fire({
                            icon: 'error',
                            title: 'Hubo un error con tu compra y no pudo ser procesada.'
                        });
                        console.log(error);
                    })
            })
        }
    })
}

// De momento esto simula el sistema de compra, devuelve una promesa (de momento resuelta para simular el éxito)
async function compra (monto) {
    let wnd = window.open('https://www.mercadopago.com.ar/', '_blank');
    let later =  () => {
        return new Promise((resolve) => {
            setTimeout(resolve, 1500);
        })
    };
    
    await later().then(() => {
        wnd.close();
    });

    return Promise.resolve();   // Devuelvo una promesa resuelta para hacer el then afuera 
}

/**************************************************************/
/*              EVENTOS DEL HEADER Y EL FOOTER                */
/**************************************************************/

let buscadorHeader = document.querySelector(".header__buscador");    
buscadorHeader.addEventListener("submit", (e) => {
    e.preventDefault();
    // Antes que nada restauro los cosplays y luego busco (Porque acá no tengo el evento de que se borre "\r" en el input. O sea, si se escribe algo en el header y se busca anda, pero si luego se vuelve a buscar no se restauran los cosplays)
    cosplaysTienda = cosplaysBackup;
    
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
        let tiendaURL;
        switch (true) {
            case (thisURL == ""):    // Estoy en el index pero sin la direccion index.html
                tiendaURL = document.URL += "pages/tienda.html"; 
                break;
            case (thisURL.includes("index.html")):    // Estoy en el index
                tiendaURL = document.URL.replace(thisURL, "pages/tienda.html")
                break;
            default:    // Estoy al mismo nivel que tienda.html
                tiendaURL = document.URL.replace(thisURL, "tienda.html")    
                break;
        }

        location.href = tiendaURL;
    }
});

// Botón en vista mobile que redirige al buscador de la tienda
let buscadorHeaderMobile = document.querySelector("#headerBuscadorMobile");
buscadorHeaderMobile.addEventListener("click", () => {
    buscadorHeader.querySelector("input").value = " ";
    buscadorHeader.querySelector("button").click();
})

// Eventos de usuario
function usuarioEstaLoggeado () {
    let estaLoggeado = JSON.parse(localStorage.getItem("usuarioLoggeado")) || false;
    
    return estaLoggeado;
}

// Cambia el estado de visibilidad de los botones de usuario
function switchBotonesUsuario () {  
    let botonesCuenta = document.querySelectorAll(".header__cuenta button");

    for (const boton of botonesCuenta) {
        if (boton.classList.contains("d-none")){
            boton.classList.remove("d-none");
        } else {
            boton.classList.add("d-none");
        }
    }
}

// Evento de registro
let formRegistro = document.querySelector(".formRegistro");
formRegistro.addEventListener("submit", (e) => {

    e.preventDefault();
    
    // Veo si ya está registrado --> De momento el localStorage simula la base de datos
    let clientesRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    let thisEmail = e.target.querySelector("#userEmailRegister").value;
    let clienteDB = clientesRegistrados.find(c => c.email == thisEmail);
    
    
    // Cierro el modal
    let form = e.target;
    form.parentElement.parentElement.querySelector(".btn-close").click();
    efectoCargaPagina().then(() => {
        if (clienteDB) {    // Si ya está registrado
            // Alerta
            Swal.fire({
                title: `${clienteDB.nombre} ya estás registrado con este mail!`,
                icon: 'error',
                showClass: {
                popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
                }
            });
        } else {    // Si no está registrado
            // Guardo al usuario
            clienteLoggeado = new User(form.querySelector("#userNameRegister").value, form.querySelector("#userEmailRegister").value, form.querySelector("#userPasswordRegister").value);
    
            clienteLoggeado.guardarUser();
            
            // Guardo en el arreglo de clientes del localStorage el nuevo usuario
            clientesRegistrados.push(clienteLoggeado);
            localStorage.setItem("usuariosRegistrados", JSON.stringify(clientesRegistrados));
    
            // Cambio los botones simulando que se ingresó
            switchBotonesUsuario();
    
            // Alerta
            Swal.fire({
                title: `${clienteLoggeado.nombre} gracias por registrarte! Te va a llegar un email de confirmación`,
                showClass: {
                popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
                }
            });
        }
    })
});

// Evento de Login
let formLogin = document.querySelector(".formLogin");
formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Alerta
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });

    // Veo si está registrado --> De momento el localStorage simula la base de datos
    let clientesRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    
    let thisEmail = e.target.querySelector("#formInicioSesionEmail").value;
    let clienteDB = clientesRegistrados.find(c => c.email == thisEmail);

    if (clienteDB) {    // Si el cliente está registrado

        let thisPassword = e.target.querySelector("#formInicioSesionPassword").value;
        if (clienteDB.password == thisPassword){        // Si matchea la constraseña
                
            // Cierro el modal
            let form = e.target;  
            form.parentElement.parentElement.querySelector(".btn-close").click();

            efectoCargaPagina().then(() => {
                Object.assign(clienteLoggeado, clienteDB);
    
                clienteLoggeado.guardarUser();
    
                localStorage.setItem("usuarioLoggeado", JSON.stringify(true));  // Setteo que está loggeado
                
                // Cambio los botones
                switchBotonesUsuario();
    
                Toast.fire({
                    icon: 'success',
                    title: `Bienvenido de nuevo ${clienteLoggeado.nombre.toUpperCase()}!`
                });
    
                // Guardo que el usuario está loggeado
                localStorage.setItem("usuarioLoggeado", JSON.stringify(true));
            });
        } else {
            Toast.fire({
                icon: 'error',
                title: 'Contraseña incorrecta.'
            });
        }
    } else {
        Toast.fire({
            icon: 'error',
            title: 'No hay ningún usuario registrado con ese email.'
        });
    }
})

// Botón de salir de la cuenta(Está dos veces por el que está en la vista mobile escondido)
let botonesSalir = document.querySelectorAll(".botonSalir");
for (const boton of botonesSalir) {
    boton.addEventListener("click", () => {
        efectoCargaPagina().then(() => {
            switchBotonesUsuario();
            clienteLoggeado.borrarUser();
            
            // Guardo que el usuario se desloggeo
            localStorage.setItem("usuarioLoggeado", JSON.stringify(false));
        })
    })
}

// Botón de opciones de cuenta (Está dos veces por el que está en la vista mobile escondido)
let botonesCuenta = document.querySelectorAll(".botonCuenta");
for (const boton of botonesCuenta) {
    boton.addEventListener("click", () => {
        
        Swal.fire({
            title: 'La página está en desarrollo actualmente. Próximamente vas a poder ver tu cuenta y tus compras!',
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
        })
    })
}

// Manda un mail a una persona de que se suscribió correctamente al newsletter
function sendMailNewsletter (form) {
    let emailUser = form.querySelector("input").value;
    let boton = form.querySelector("button");
    let codigoDesc = "ORA10";

    const Toast = Swal.mixin({
        toast: true,
        showConfirmButton: false,   
        timer: 5000,
        position: "top-end",
        color: "#645899"
    });
    
    // Cambio estilos botón mientras se envía y después lo vuelvo a la normalidad
    boton.classList.remove("btn-dark", "text-white");
    boton.classList.add("btn-light", "text-dark", "border", "border-dark", "border-3");

    // Nota: Inicio de nuevo porque esto es otra cuenta de emailjs (por el limite de 2 templates)
    emailjs.init('p76buhZlK6AVJngU4');
    const serviceID = "service_2pdul4c";
    const templateID = "template_4o3fb4l";

    emailjs.send(serviceID, templateID, {   
        email: emailUser,
        code: codigoDesc,
        desc: codigosDescuento.get(codigoDesc)
    }).then(() => {
        Toast.fire({
            icon: 'success',
            title: `Gracias por suscribirte. Te van a llegar todas nuestras novedades!`,
        })
        boton.classList.remove("btn-light", "text-dark", "border", "border-dark", "border-3");
        boton.classList.add("btn-dark", "text-white");
    }).catch(error => {
        Toast.fire({
            icon: 'error',
            title: "Hubo un error. Espera un rato e intenta nuevamente."
        });
        console.log(error);
        boton.classList.remove("btn-light", "text-dark", "border", "border-dark", "border-3");
        boton.classList.add("btn-dark", "text-white");
    });
}

// Evento de newsletter
let newsletter = document.querySelector(".footer__newsletter");
newsletter.addEventListener("submit", (e) => {
    e.preventDefault();

    let email = e.target.querySelector("input").value;

    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 5000,
        color: "#645899"
    })

    if (validarEmail(email)) {
        sendMailNewsletter(e.target);
    } else {
        Toast.fire({
            icon: 'error',
            title: 'Vamos a necesitar un email válido para poder comunicarnos con vos!'
        })
    }
})