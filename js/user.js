class User {
    constructor (nombre, email, password) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
    }

    guardarUser () {
        localStorage.removeItem("user");
        localStorage.setItem("user", JSON.stringify(this));
    }

    recuperarUser () {
        let userJSON = JSON.parse(localStorage.getItem("user"));
        if (userJSON){
            Object.assign(this, userJSON);
            return true;
        } else {
            return false;
        }
    }

    borrarUser () {
        localStorage.removeItem("user");
    }
}