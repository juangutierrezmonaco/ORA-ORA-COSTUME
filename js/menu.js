/**
 *  Esta clase sirve para crear cualquier tipo de Menú. Se encarga de mostrar, validar y ejecutar las opciones que se pasen.
 *  Nota: Hay dos tipos de menú: 
 *                              1 - De ejecución: Se elige entre opciones que llaman a una función.
 *                              2 - De elección: Se elege entre opciones (objetos) y se retorna la elegida.
 */

class Menu {
    constructor (opciones, funciones = 0) {
        this.opciones = opciones;
        this.funciones = funciones;
    }

    mostrarMenu () {
        let mensaje = "Tiene las siguientes opciones:";
        for (let i = 0; i < this.opciones.length; i++) {
            mensaje += "\n" + (i + 1) + " - " + this.opciones[i];        
        }
        return mensaje;
    }

    ejecutarMenu() {
        let op = ingresarOpcion(1, this.opciones.length, this.mostrarMenu());

        if (this.funciones != 0) {          // Si es un menú de ejecución de funciones
            return this.funciones[op - 1]();
        } else {                            // Si es un menú de elección
            return op;
        }
    }
}