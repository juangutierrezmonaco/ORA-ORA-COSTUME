class Medida {
    static count = 0;   // Por el momento, es para generar un id

    constructor (nombre, tipo, url) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.url = url;

        this.id = ++Medida.count; 
    }

    toHtml () {
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
                                <label class="input-group-text">Medida</label>
                                <input required type="number" class="form-control">
                                <button type="button" class="btn btn-primary ms-2 botonMedida" data-bs-dismiss="modal" aria-label="Close">Guardar</button>
                            </form>
                        </div>
                    </div>
            </div>`;

        return medidaHtml;
    }
}