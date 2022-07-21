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