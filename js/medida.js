/**
 *  CLASE MEDIDA   -->   Representa al objeto medida. No es la medida del usuario, sino la representación del "tutorial" de cómo tomar
 *                       la medida. Sin embargo, guarda el valor para algunas operaciones. Pero las medidas del usuario se guardan en el
 *                       localStorage con otro formato.   
 *  
 *  Sabe cómo mostrarse por html, generarse un id y hay funciones que no son de la clase pero que están relacionadas
 *  con la interacción con el localStorage del arreglo de medidas.
 */

class Medida {
    static count = 0;   // Por el momento, es para generar un id

    constructor (nombre, tipo, url, valor) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.url = url;
        this.valor = valor;

        this.id = ++Medida.count; 
    }

    toHtml (valorMedida = "") {
        let medidaHtml = document.createElement("div");
        medidaHtml.classList.add("col-8", "col-sm-4", "col-md-3");

        let modalBody;

        if (this.tipo == "img"){
            modalBody =
                `<div class="modal-body">
                    <img src=${this.url} class="container" alt="${this.nombre} - Medida">
                </div>`;
        } else {
            modalBody =
                `<div class="modal-body">
                    <iframe src=${this.url} 
                    title="${this.nombre} - Medida - Youtube Video" frameborder="0" allow="accelerometer; autoplay; 
                    clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="container"> 
                    </iframe>
                </div>`;
        }

        let idMedida = `medida${this.id}`;

        // Por último, si ya estaba cargada, settear el valor
        let valorGuardado = valorMedida && `value=${valorMedida}`;
        
        medidaHtml.innerHTML = 
            `<div type="button" data-bs-toggle="modal" data-bs-target="#${idMedida}">
                <div class="medida card">
                    <div class="medida__titulo">
                        <h2 class="text-center text-wrap">${this.nombre}</h2>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="${idMedida}" tabindex="-1" aria-labelledby="${idMedida}Label" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content">

                        <div class="modal-header">
                            <h5 class="modal-title" id="${idMedida}Label">${this.nombre}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        
                        ${modalBody}

                        <div class="modal-footer">
                            <form class="input-group">
                                <label class="input-group-text">Medida (en CM)</label>
                                <input type="number" class="form-control" step=".01" ${valorGuardado}>
                                <button type="submit" class="btn btn-primary ms-2">Guardar</button>
                            </form>
                        </div>
                    </div>
            </div>`;

        return medidaHtml;
    }
}

function guardarMedidas () {
    localStorage.removeItem("medidas");
    localStorage.setItem("medidas", JSON.stringify(medidasPersona)); 
}

function recuperarMedidas () {
    return JSON.parse(localStorage.getItem("medidas")) || [];
}