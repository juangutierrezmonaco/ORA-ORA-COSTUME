function main () {
    // Recupero información de la base de datos
    codigosDescuento = getCodigosFromDB();
    cosplays = getCosplaysFromDB();

    // Recupero carrito
    carrito.recuperarCarrito();

    // Paso código de descuento si existía de antes
    let codigoTexto = localStorage.getItem("inputCodigo") == null ? "" : localStorage.getItem("inputCodigo");
    actualizarCarrito(codigoTexto);


    // Nota: Lo siguiente lo hago sin switch porque si hay un error o se va a una sección particular, la URL no es exactamente index o tienda, etc.
    //       Por ejemplo, sería /index.html? o /index.html#seccionX --> Lo hago con if para que se pueda usar el includes y cargar la página
    if (thisURL.includes("index.html") || thisURL == ""){
        cargarIndex();
    }

    if (thisURL.includes("tienda.html")){
        cargarTienda();
    }
    
    if (thisURL.includes("medidas.html")){
        cargarMedidas();
    }

}

main();

/**************************************************************/
/*                      INDEX Y TIENDA                        */
/**************************************************************/
function cargarIndex(){
    // Referencia a la galería del index
    galeriaCosplays = document.querySelector(".main--index .galeriaCosplays");

    // Creación de galería y muestra
    let cosplaysIndex = cosplays.filter((c) => c.especial);
    cargarGaleria(cosplaysIndex);
}

// Convierte los cosplays al formato que tienen que tener en el html y los agrega
function cargarGaleria (arrCosplays) {
    for (const cosplay of arrCosplays) {
        let cosplayHtml = cosplay.toHtml();

        if ( !thisURL.includes("tienda.html")) {    // Si estoy en el index, que sean más grandes los cosplays
            cosplayHtml.classList.remove("col-lg-2") 
            cosplayHtml.classList.remove("d-none"); // Muestro todos (Por defecto no se ven)
        } 
        galeriaCosplays.append(cosplayHtml);
    }
}

function cargarTienda(){  

    // Si alguien buscó en el header DE OTRA PÁGINA, recupero la búsqueda del localStorage
    if (localStorage.getItem("busquedaTermino")){
        let buscadorBoton = buscadorHeader.querySelector("button");
        let buscadorInput = buscadorHeader.querySelector("input");

        // Pongo la palabra en el input y la borro del storage
        buscadorInput.focus();
        buscadorInput.value = localStorage.getItem("busquedaTermino");
        localStorage.removeItem("busquedaTermino");

        
        // Hago click en el boton, UNA VEZ QUE LA PÁGINA YA ESTÁ CARGADA (Sino error de asincronía)
        window.addEventListener("DOMContentLoaded", () => {
            buscadorBoton.click();
        })
    }

    // Referencia a la galería de la tienda
    galeriaCosplays = document.querySelector(".main--tienda .galeriaCosplays");
    cargarGaleria(cosplays);   
    mostrarCosplaysTienda(); 
}

function mostrarCosplaysTienda (mult = 2) {     // Cuando recarga toda la galería, muestro 2 filas
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

    let quieroMostrar = cantPorFila * mult;    // quieroMostrar 

    let quedanPorMostrar = galeriaCosplays.querySelectorAll(".cosplay.d-none").length;

    let cant = quedanPorMostrar < quieroMostrar ? quedanPorMostrar : quieroMostrar; // Muestro dependiendo de los que me quedan para mostrar
    quedanPorMostrar -= cant;   // Actualizo quedanPorMostrar 
    
    for (let i = indiceUltimoCosplayVisto; i < indiceUltimoCosplayVisto + cant; i++) {
        galeriaCosplays.childNodes[i + 1].classList.remove("d-none");
    }

    // Actualizo índice
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

    cargarGaleria(cosplaysModificados);
    indiceUltimoCosplayVisto = 0;  // Actualizo porque se actualizó la galeria
    mostrarCosplaysTienda(); // Cuando carga por primera vez, muestro 2 filas
}

// Esta función es para obtener el estado actual de los cosplays en la galería  (Por ejemplo: si se quiere ordenar cosplays ya filtrados)
function getCosplaysFromHtml () {
    let cosplaysModificados = [];
    let cosplaysHtml = galeriaCosplays.querySelectorAll(".cosplay");

    for (const cosplay of cosplaysHtml) {
        let thisId = getIdCosplayHtml(cosplay);
        cosplaysModificados.push(searchCosplayById(cosplays, thisId));
    }

    return cosplaysModificados;
}

if (thisURL.includes("tienda.html")){   // Eventos de la tienda

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

        let cosplaysFiltrados = cosplays.filter(filtro);
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
            cosplays = getCosplaysFromDB();
            
        }
    });

    function buscar (e) {
        e.preventDefault();
        let word;
        let form = e.target;
        form.querySelector(".btn").blur();  // Saco el focus del botón

        if (e.type == "submit") {   // Se llamó haciendo click en el botón
            
            word = form.children[0].value;
        } else {                    // Se llamó desenfocando el input
            word = form.value;
        }

        cosplays = cosplays.filter(c => 
            c.personaje.toLowerCase().includes(word.toLowerCase()) ||
            c.anime.toLowerCase().includes(word.toLowerCase())  ||
            c.tipo.toLowerCase().includes(word.toLowerCase())
        )
    
        let mensaje = "";
        if (cosplays.length == 0) {
            mensaje = "No hay coincidencias con la búsqueda";
        }
    
        actualizarGaleria(cosplays, mensaje);
    
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

    // Click en el botón más de la galería
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
function cargarMedidas(){
    let medidas = getMedidasFromDB();

    let galeriaDeMedidas = document.querySelector(".main--medidas .galeriaMedidas");
    for (const medida of medidas) {
        galeriaDeMedidas.append(medida.toHtml());
    }

    // Recupero las que ya están cargadas   ---> Próximamente
}

if (thisURL.includes("medidas.html")){
    let galeriaDeMedidas = document.querySelector(".main--medidas .galeriaMedidas");

    galeriaDeMedidas.addEventListener("click", (e) => {
        let elementoClickleado = e.target;

        if(elementoClickleado.classList.contains("botonMedida")){   // Si estoy haciendo click en guardar de la medida
            // Obtengo el valor ingresado
            let valorMedida = elementoClickleado.parentElement.querySelector("input").value;

            // Obtengo el id de la medida
            let padreMayor = elementoClickleado;
            while (padreMayor.id == "") {
                padreMayor = padreMayor.parentElement;
            }

            let idMedida = padreMayor.id;

            // Y obtengo el padre mayor para cambiar el color y designar que la medida ya está cargada
            padreMayor = padreMayor.parentElement.querySelector(".medida__titulo");

            padreMayor.classList.remove("medida__cargada");      // Se descolorea */
            
            if (valorMedida != ""){         // Si ingreso algo 

                padreMayor.classList.add("medida__cargada");    // Se colorea

                // Lo guardo en el array de medidas
                medidasPersona.push(idMedida, valorMedida);
                localStorage.removeItem("medidas");
                localStorage.setItem("medidas", medidasPersona);

            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    showConfirmButton: false,   
                    timer: 5000,
                    position: "top-end",
                    color: "#645899"
                }).fire({
                        icon: 'error',
                        title: 'No ingresaste nada! No se guardo la medida.'
                })
            }

        }

    })

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
            }
        })
    })
}

/**************************************************************/
/*                        CONTACTO                            */
/**************************************************************/
if (thisURL.includes("contacto.html")){
    let formContacto = document.querySelector(".main--contacto .formContacto");

    formContacto.addEventListener("submit", (e) => {
        e.preventDefault();

        
        let email = e.target.querySelector("#email--contacto").value;

        const Toast = Swal.mixin({
            toast: true,
            showConfirmButton: false,   
            timer: 5000,
            position: "top-end",
            color: "#645899"
        })
        
        if (validarEmail(email)){
            let nombre = e.target.querySelector("#nombre--contacto").value.toUpperCase();

            Toast.fire({
                icon: 'success',
                title: `${nombre}! Vamos a estar comunicandonos con vos lo antes posible!`,
            })
        } else {
            Toast.fire({
                icon: 'error',
                title: 'Vamos a necesitar un email válido para poder comunicarnos con vos!'
            })
        }
    })
}

/**************************************************************/
/*                          CARRITO                           */
/**************************************************************/

// Se encarga de transportar todas las modificaciones en el carrito al html.
function actualizarCarrito (inputCodigoText = localStorage.getItem("inputCodigo")) {
    // Guardo en localStorage
    carrito.guardarCarrito();

    // Si pasa por parámetro tengo que actualizar
    localStorage.removeItem("inputCodigo");
    localStorage.setItem("inputCodigo", inputCodigoText);
    
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
        inputCodigo.value = localStorage.getItem("inputCodigo");
    }

    // Por último actualizo el localStorage si se borró el carrito o está vacío
    if (carrito.length() == 0) {
        localStorage.removeItem("inputCodigo");
        localStorage.setItem("inputCodigo", ""); 
        carrito.descuento = 0;
    }
}

// Click en carrito de los cosplays
if(thisURL.includes("tienda.html") || thisURL.includes("index.html")) {
    galeriaCosplays.addEventListener("submit", (e) => {
        e.preventDefault();
        let thisId = getIdCosplayHtml(e.submitter.parentElement);
        let selectedCosplay = searchCosplayById(cosplays, thisId);
    
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
    let thisCosplay = searchCosplayById(cosplays, id);
    
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
        alert(`Ahora será redirigido al sistema de venta por el monto de $ ${carrito.calcularTotal()}`)

        if (compra(carrito.calcularTotal())) {  // Si se cobró exitosamente
            // Actualizo stock
            actualizarStock();

            // Actualizo la galería por si alguno se quedó sin stock
            actualizarGaleria(cosplays);

            // Borro el carrito
            carrito.borrarCarrito();
            actualizarCarrito();

            // Cierro la ventana del carrito
            document.querySelector("#offcanvasCarrito .btn-close").click();
            
        }
    }
})

// De momento esto simula el sistema de compra, devuelve si se cobró exitosamente
function compra (monto) {
    alert(`Se cobraron $${monto}.`);
    return true;    // De momento devuelve que la compra fue exitosa
}