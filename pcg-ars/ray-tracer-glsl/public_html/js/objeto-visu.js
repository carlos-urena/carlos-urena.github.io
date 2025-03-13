import { Log } from "./utilidades.js";
export class ObjetoVisualizable {
    nombre = "no asignado"; // nombre del objeto
    color = null; // color del objeto, null si no tiene
    get leerNombre() {
        return this.nombre;
    }
    set fijarNombre(nuevo_nombre) {
        this.nombre = nuevo_nombre;
    }
    get tieneColor() {
        return this.color != null;
    }
    get leerColor() {
        if (this.color == null)
            throw new Error(`intento de leer el color de un ObjetoVisualizable que no lo tiene (${this.nombre})`);
        return this.color;
    }
    set fijarColor(nuevo_color) {
        this.color = nuevo_color;
    }
    /**
     * Visualiza el objeto. este método debe ser redefinido en clases derivadas
     */
    visualizar() {
        throw new Error(`El objeto '${this.leerNombre}' no tiene redefinido el método 'visualizarGL'`);
    }
    /**
     * Visualiza las aristas del objeto. Este método puede ser redefinido en clases derivadas, si
     * no se hace, el método no hace nada (eso implica que ese objeto no tiene aristas que se pueden visualizar
     * o que no se ha implementado esto)
     */
    visualizarAristas() {
        Log(`El objeto '${this.leerNombre}' no tiene método para visualizar aristas ('visualizarAristas')`);
    }
    /**
     * Visualiza las normales del objeto. Este método puede ser redefinido en clases derivadas, si
     * no se hace, el método no hace nada (eso implica que ese objeto no tiene normales que se pueden visualizar
     * o que no se ha implementado esto)
     */
    visualizarNormales() {
        Log(`El objeto '${this.leerNombre}' no tiene método para visualizar normales ('visualizarNormales').`);
    }
}
