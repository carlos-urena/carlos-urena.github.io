import { ObjetoVisualizable } from "./objeto-visu.js";
import { AplicacionWeb } from "./aplicacion-web.js";
/**
 * Estados posibles de un objeto animado:
 *
 * - parado: no animado, actulizado a t=0
 * - pausado: no animado, pero en algún instante de la animación
 * - animado: en movimiento, en algún instente de la animación
 *
 * El estado de un objeto animado se controla llamando a estos métodos:
 *
 * - comenzar (start)  - comienza la animación, estando parado
 * - pausar (pause)    - pausa después de comenzar
 * - reanudar (resume) - reanuda después de pausado
 * - reiniciar (reset) - vuelve al estado inicial y para la animación
 *
 * El comportamiento del objeto se define implementando estos métodos:
 *
 * - estadoInicial - pone el objeto en su estado inicial
 * - actualizarObjeto( dt ) - actualiza el estado después de transcurrido 'dt' segundos respecto del estado actual
 *
 */
export var EstadoAnim;
(function (EstadoAnim) {
    EstadoAnim[EstadoAnim["parado"] = 0] = "parado";
    EstadoAnim[EstadoAnim["pausado"] = 1] = "pausado";
    EstadoAnim[EstadoAnim["animado"] = 2] = "animado";
})(EstadoAnim || (EstadoAnim = {}));
/**
 * Clase base para objetos que se puden animar
 */
export class ObjetoAnimado extends ObjetoVisualizable {
    /**
     * Objeto visualizable que se usa para visualizar este objeto animado
     *  - Usualmente será una simple malla indexada, o bien un objeto compuesto
     *  - Debe ser inicialiado en el constructor de las clases derivadas
     */
    obj_vis = null;
    /**
     * Indica el tiempo total acumulado desde que se inició la animación, sin
     * contar los intervalos en los que ha estado pausado.
     */
    t_anim = 0.0;
    /**
     * Devuelve el tiempo acumulado de la animación (tiempo desde inicio sin
     * contar con el tiempo pausado)
     */
    get t_animado() {
        return this.t_anim;
    }
    /**
     * Instante de tiempo
     * absoluto de la última actualización de estado
     * (es el instante con el que se corresponde el estado actual del objeto)
     */
    t_ult = 0.0;
    /**
     * Estado actual (inicialmente parado)
     */
    estado_act = EstadoAnim.parado;
    /**
     * Devuelve el estado de la animación
     */
    get estado() {
        return this.estado_act;
    }
    // --------------------------------------------------------------------------------------------------------
    // METODOS
    /**
     * Iniciar la animación (solo si está parada)
     * - Resetea el contador de tiempo acumulado 't_anim' y de ultima actu. 't_ult'
     * - Pone el objeto en su estado inicial
     * @param t_act instante de tiempo absoluto actual
     */
    comenzar(t_act) {
        if (this.estado_act != EstadoAnim.parado)
            throw new Error(`Se ha llamado a 'iniciar', pero el objeto no está en estado 'parado'`);
        this.t_ult = t_act;
        this.t_anim = 0.0;
        this.estado_act = EstadoAnim.animado;
        this.estadoInicial();
    }
    // -------------------------------------------------------------------------------------------------------- 
    /**
     * Pausa la animación en el instante 't_act'
     * - La animación debe se estar en estado 'animado'
     * - Se actualiza el estado del objeto al instante 't_act'
     * - Pasa al estado 'pausado'
     * @param t_act instante absoluto en el que se pausa la animación
     */
    pausar(t_act) {
        if (this.estado_act != EstadoAnim.animado)
            throw new Error(`Se ha llamado a 'pausar', pero el objeto no está en estado 'animado'`);
        if (t_act < this.t_ult)
            throw new Error(`Se ha llamado a 'pausar' con t_act == ${t_act} anterior a t_ult == ${this.t_ult}`);
        this.actualizar(t_act); // lleva el objeto al estado correspondiente a 't_act'
        this.estado_act = EstadoAnim.pausado;
    }
    // --------------------------------------------------------------------------------------------------------
    /**
     * Reanuda (en el instante 't_act') una animación que está pausada
     * (debe de estar en estado 'pausado')
     * @param t_act
     */
    reanudar(t_act) {
        if (this.estado_act != EstadoAnim.pausado)
            throw new Error(`Se ha llamado a 'reanudar', pero el objeto no está en estado 'pausado'`);
        if (t_act < this.t_ult)
            throw new Error(`Se ha llamado a 'reanudar' con t_act == ${t_act} anterior a t_ult == ${this.t_ult}`);
        this.t_ult = t_act;
        this.estado_act = EstadoAnim.animado;
    }
    // --------------------------------------------------------------------------------------------------------
    /**
     * Para la animación y vuelve al estado inicial
     * @param t_act
     */
    reiniciar(t_act) {
        if (t_act < this.t_ult)
            throw new Error(`Se ha llamado a 'parar' con t_act == ${t_act} anterior a t_ult == ${this.t_ult}`);
        if (this.estado_act == EstadoAnim.parado)
            return;
        this.t_ult = t_act;
        this.estado_act = EstadoAnim.parado;
        this.estadoInicial();
    }
    // --------------------------------------------------------------------------------------------------------
    /**
     * Actualiza la animación al instante de tiempo absoluto actual
     *  - El estado de la animación debe ser 'animado'
     *  - Calcula el tiempo transcurrido desde la ultima actualización
     *  - Invoca a actualizarObjeto
     *  - Añade el tiempo transcurrido al tiempo acumulado
     *  - Actualiza el intante de ultima actualización.
     * @param t_act instante de tiempo absoluto actual.
     */
    actualizar(t_act) {
        // si está pausado o parado, no hace nada.
        if (this.estado_act != EstadoAnim.animado)
            throw new Error(`Se ha llamado a 'actualizar', pero el objeto no está en estado 'animado'`);
        if (t_act < this.t_ult)
            throw new Error(`Se ha llamado a 'actualizar' con t_act == ${t_act} anterior a t_ult == ${this.t_ult}`);
        let inc_t = t_act - this.t_ult; // nunca negativo
        if (inc_t > 0.0)
            this.actualizarObjeto(inc_t);
        this.t_anim += inc_t;
        this.t_ult = t_act;
    }
    // ----------------------------------------------------------------------------------
    // METODOS de Visualización (se delega en el objeto visualizable 'obj_vis')
    /**
     * Visualiza el objeto
     */
    visualizar() {
        let nombref = `ObjetoAnimado.visualizar (${this.nombre}):`;
        if (this.obj_vis == null)
            throw new Error(`${nombref} error al visualizar objeto animado: no se ha creado objeto visualizable en el ctor.`);
        let cauce = AplicacionWeb.instancia.cauce;
        this.guardarCambiarEstado(cauce);
        this.obj_vis.visualizar();
        this.restaurarEstado(cauce);
    }
    /**
      * Visualiza el objeto sobre un cauce básico, únicamente la geometría, nada más
      * (se supone que el cauce está activo al llamar a este método)
      */
    visualizarGeometria(cauceb) {
        let nombref = `ObjetoAnimado.visualizarGeometria (${this.nombre}):`;
        if (this.obj_vis == null)
            throw new Error(`${nombref} error en visualizar objeto animado: no se ha creado objeto visualizable en el ctor.`);
        if (this.tieneMatrizModelado) {
            cauceb.pushMM();
            cauceb.compMM(this.matrizModelado);
        }
        this.obj_vis.visualizarGeometria(cauceb);
        if (this.tieneMatrizModelado)
            cauceb.popMM();
    }
    /**
     * Visualizar normales del objeto
     */
    visualizarNormales() {
        if (this.obj_vis == null)
            throw new Error(`Error al visualizar aristas de objeto animado: no se ha creado objeto visualizable en el ctor.`);
        let cauce = AplicacionWeb.instancia.cauce;
        this.pushCompMM(cauce);
        this.obj_vis.visualizarNormales();
        this.popMM(cauce);
    }
    /**
     * Visualizar aristas del objeto
     */
    visualizarAristas() {
        if (this.obj_vis == null)
            throw new Error(`Error al visualizar normales de objeto animado: no se ha creado objeto visualizable en el ctor.`);
        let cauce = AplicacionWeb.instancia.cauce;
        this.pushCompMM(cauce);
        this.obj_vis.visualizarAristas();
        this.popMM(cauce);
    }
}
// **********************************************************************************************
