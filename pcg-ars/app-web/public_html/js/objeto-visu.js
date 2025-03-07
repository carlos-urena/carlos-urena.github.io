import { Log } from "./utilidades.js";
import { AplicacionWeb } from "./aplicacion-web.js";
export class ObjetoVisualizable {
    /**
     * Color del objeto, null si no tiene
     */
    color = null;
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
     * Textura del objeto:
     *   * undefined    --> hereda la textura que hubiera en el cauce cada vez que se visualiza
     *   * null         --> se visualiza sin textura
     *   * en otro caso --> apunta a una textura que se usa para visualizar
     */
    textura_act = undefined;
    /**
     * Devuelve true si la textura no se hereda.
     */
    get tieneTexturaDefinida() {
        if (this.textura_act === undefined)
            return false;
        return true;
    }
    /**
     * Devuelve la textura del objeto (solo si la tiene definida)
     *   * Puede devolver 'null' (el objeto se dibuja sin textura)
     *   * O bien devolver un puntero a una textura (se dibuja con esa textura)
     */
    get textura() {
        if (this.textura_act === undefined)
            throw new Error(`intento de leer la textura de un objeto que no tiene`);
        return this.textura_act;
    }
    /**
     * Fija la textura del objeto.
     */
    set textura(nueva_textura) {
        this.textura_act = nueva_textura;
    }
    /**
     * Matriz de modelado de este objeto (si no es nula),
     *   * Si está presente, es adicional a la que haya establecida en el cauce
     * (se hace pushMM antes de visualizar y popMM después)
     */
    matrizm = null;
    /**
     * Devuelve 'true' si la matriz de modelado no es nula
     */
    get tieneMatrizModelado() {
        return this.matrizm != null;
    }
    /**
     * Devuelve la matriz de modelado (no nula).
     * Si es nula produce un error
     */
    get matrizModelado() {
        if (this.matrizm == null)
            throw new Error("Intento de leer una matriz de modelado nula");
        return this.matrizm;
    }
    /**
     * Fija la matriz de modelado (clona la que se le pasa como parámetro)
     */
    set matrizModelado(nueva_matrizm) {
        if (nueva_matrizm == null)
            this.matrizm = null;
        else
            this.matrizm = nueva_matrizm.clonar();
    }
    /**
     * Si el objeto tiene definida su propia matriz de modelado
     * Guarda (push) la matriz de modelado en el cauce, y la compone con la actual
     * @param cauce
     */
    pushCompMM(cauce) {
        if (this.tieneMatrizModelado) {
            cauce.pushMM();
            cauce.compMM(this.matrizModelado);
        }
    }
    popMM(cauce) {
        if (this.tieneMatrizModelado)
            cauce.popMM();
    }
    /**
     * Material del objeto (null si no tiene ninguno definido)
     */
    material_act = null;
    /**
     * Devuelve true si el objeto tiene un material propio, false en otro caso
     */
    get tieneMaterial() {
        return this.material_act != null;
    }
    /**
     * Si tiene material, lo devuelve, en otro caso se produce un error
     */
    get material() {
        const nombref = "ObjetoVisualizable.material (getter)";
        if (this.material_act == null)
            throw new Error(`${nombref}: intento de leer un material nulo.`);
        return this.material_act;
    }
    /**
     * Cambia el material actual, se puede borrar (con null) o
     * bien poner uno nuevo (!= null)
     */
    set material(nuevo_material) {
        this.material_act = nuevo_material;
    }
    /**
     * Nombre actual del objeto
     */
    nombre_act = "no asignado";
    /**
     * Devuelve el nombre del objeto
     */
    get nombre() {
        return this.nombre_act;
    }
    /**
     * Cambia el nombre del objeto.
     */
    set nombre(nuevo_nombre) {
        this.nombre_act = nuevo_nombre;
    }
    /**
     * Parámetro 'S', usado para gestionar diversos aspectos del objeto
     */
    param_S_act = AplicacionWeb.valor_inicial_param_S;
    /**
     * Fija el nuevo valor del parámetro S
     */
    set param_S(nuevo_param_s) {
        this.param_S_act = nuevo_param_s;
    }
    get param_S() {
        return this.param_S_act;
    }
    /**
     * Visualiza el objeto sobre un cauce básico, únicamente la geometría, nada más
     * (se supone que el cauce está activo al llamar a este método)
     */
    visualizarGeometria(cauceb) {
        const nombref = `ObjetoVisualizable.visualizarGeometria (${this.nombre}):`;
        Log(`${nombref}: advertencia: no se hace nada: este objeto es de una clase que no redefine el método`);
    }
    /**
     * Visualiza las aristas del objeto. Este método puede ser redefinido en clases derivadas, si
     * no se hace, el método no hace nada (eso implica que ese objeto no tiene aristas que se pueden visualizar
     * o que no se ha implementado esto)
     */
    visualizarAristas() {
        Log(`ObjetoVisible.visualizarAristas: no se hace nada: este objeto es de una clase que no redefine el método`);
    }
    /**
     * Visualiza las normales del objeto. Este método puede ser redefinido en clases derivadas, si
     * no se hace, el método no hace nada (eso implica que ese objeto no tiene normales que se pueden visualizar
     * o que no se ha implementado esto)
     */
    visualizarNormales() {
        Log(`ObjetoVisible.visualizarNormales: no se hace nada: este objeto es de una clase que no redefine el método`);
    }
    /**
     * Guarda el estado actual de los (algunos/todos?) los uniforms y
     * lo actualiza según este objeto
     * @param cauce cauce sobre el que se fija y que guarda el estado.
     */
    guardarCambiarEstado(cauce) {
        if (this.tieneMaterial) {
            cauce.pushMaterial();
            cauce.fijarMaterial(this.material);
        }
        if (this.tieneTexturaDefinida) {
            cauce.pushTextura();
            cauce.fijarTextura(this.textura);
        }
        if (this.tieneColor) {
            cauce.pushColor();
            cauce.fijarColor(this.leerColor);
        }
        this.pushCompMM(cauce);
    }
    /**
     * Restaura el estado previo a la última llamada a 'guardarFijarEstado'
     * @param cauce cauce desde donde se restaura el estado.
     */
    restaurarEstado(cauce) {
        this.popMM(cauce);
        if (this.tieneColor)
            cauce.popColor();
        if (this.tieneTexturaDefinida)
            cauce.popTextura();
        if (this.tieneMaterial)
            cauce.popMaterial();
    }
}
