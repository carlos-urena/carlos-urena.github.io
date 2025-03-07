import { Assert, Log } from "./utilidades.js";
import { CMat4 } from "./vec-mat.js";
// -------------------------------------------------------------------------
/**
 * Funcionalidad básica para cualquier cauce (clase base para los cauces)
 * Ofrece funcionalidad para:
 * - Fijar matriz de modelado, y hacer push/pop
 * - Fijar matrices de vista y proyección
 *
 * Incorpora como variables de instancia
 *    - un objeto programa (debe ser creado en clases derivadas)
 *    - un contexto WebGL (se debe especificar en el constructor)
 *    - un framebuffer de destino (si es nulo es el framebuffer por defecto, si no es nulo debe ser creado en clases derivadas)
 */
export class CauceBase {
    // ---------------------------------------------------------------------------
    // Variables de instancia:
    // objeto programa 
    objeto_programa = null;
    // contexto WebGL, dado en el constructor 
    gl;
    // framebuffer (no se usa todavía?)
    framebuffer_destino = null;
    // variables de estado del cauce
    mat_modelado = CMat4.ident(); // matriz de modelado
    mat_modelado_nor = CMat4.ident(); // matriz de modelado para normales
    mat_vista = CMat4.ident(); // matriz de vista
    mat_proyeccion = CMat4.ident(); // matriz de proyección
    // pilas de colores, matrices modelado, materiales y texturas
    pila_mat_modelado = new Array;
    pila_mat_modelado_nor = new Array;
    // locations de los uniforms (cada una de ellas puede ser null)
    loc_mat_modelado = null;
    loc_mat_modelado_nor = null;
    loc_mat_vista = null;
    loc_mat_proyeccion = null;
    // ---------------------------------------------------------------------------
    // Métodos 
    // ---------------------------------------------------------------------------
    /**
     * Inicializa el objeto cauce, es decir:
     * compila los shaders y enlaza el objeto programa, inicializa uniforms.
     * @param gl contexto WebGL en el cual se usará el objeto programa
     */
    constructor(gl) {
        const nombref = 'CauceBase.constructor';
        this.gl = gl;
    }
    // ---------------------------------------------------------------------------
    /**
     * Devuelve el objeto programa
     */
    get programa() {
        let nombref = "Cauce.programa:";
        if (this.objeto_programa == null)
            throw new Error(`${nombref}: no se puede leer el programa, es nulo`);
        return this.objeto_programa;
    }
    // ---------------------------------------------------------------------------
    /**
     *  Lee las 'locations' de todos los uniforms y les da un
     *  valor inicial por defecto. También inicializa algunas variables de estado.
     */
    inicializarUniformsBase() {
        const nombref = 'Cauce.inicializarUniformsBase:';
        if (this.gl == null)
            throw Error(`${nombref} leerLocation - this.gl es nulo`);
        let gl = this.gl;
        this.programa.usar();
        // obtener las 'locations' de los parámetros uniform
        this.loc_mat_modelado = this.leerLocation("u_mat_modelado");
        this.loc_mat_modelado_nor = this.leerLocation("u_mat_modelado_nor");
        this.loc_mat_vista = this.leerLocation("u_mat_vista");
        this.loc_mat_proyeccion = this.leerLocation("u_mat_proyeccion");
        // dar valores iniciales por defecto a los parámetros uniform
        gl.uniformMatrix4fv(this.loc_mat_modelado, true, this.mat_modelado);
        gl.uniformMatrix4fv(this.loc_mat_modelado_nor, true, this.mat_modelado_nor);
        gl.uniformMatrix4fv(this.loc_mat_vista, true, this.mat_vista);
        gl.uniformMatrix4fv(this.loc_mat_proyeccion, true, this.mat_proyeccion);
        // desactivar objeto programa
        gl.useProgram(null);
    }
    // ---------------------------------------------------------------------------
    leerLocation(nombre) {
        const nombref = 'CauceBase.leerLocation:';
        if (this.gl == null)
            throw Error(`${nombref} leerLocation - this.gl es nulo`);
        const loc = this.programa.leerLocation(nombre);
        if (loc == null)
            Log(`${nombref} Advertencia: el uniform '${nombre}' no aparece en los shaders o no se usa en la salida`);
        return loc;
    }
    // ---------------------------------------------------------------------------
    imprimeInfoUniformsBase() {
    }
    // ---------------------------------------------------------------------------
    /**
     * Activa el objeto programa (hace 'useProgram' )
     */
    activar() {
        const nombref = "Cauce.activar:";
        this.programa.usar();
    }
    // ---------------------------------------------------------------------------
    // ---------------------------------------------------------------------------
    /**
     * Cambia la matriz de vista en el objeto programa
     * @param nueva_mat_vista (Mat4) nueva matriz de vista
     */
    fijarMatrizVista(nueva_mat_vista) {
        this.mat_vista = nueva_mat_vista;
        this.gl.uniformMatrix4fv(this.loc_mat_vista, true, this.mat_vista); // SE TRASPONE!!
    }
    // ---------------------------------------------------------------------------
    /**
     * Cambia la matriz de proyeccion en el objeto programa
     * @param nueva_mat_proyeccion (Mat4) nueva matriz de proyección
     */
    fijarMatrizProyeccion(nueva_mat_proyeccion) {
        this.mat_proyeccion = nueva_mat_proyeccion;
        this.gl.uniformMatrix4fv(this.loc_mat_proyeccion, true, this.mat_proyeccion); // SE TRASPONE !!
    }
    // ---------------------------------------------------------------------------
    /**
     * Cambia la matriz de modelado en el objeto programa
     * @param nueva_mat_modelado (Mat4) nueva matriz de modelado
     */
    fijarMatrizModelado(nueva_mat_modelado) {
        this.mat_modelado = nueva_mat_modelado;
        this.mat_modelado_nor = nueva_mat_modelado.inversa3x3().traspuesta3x3();
        this.gl.uniformMatrix4fv(this.loc_mat_modelado, true, this.mat_modelado); // SE TRASPONE !!
        this.gl.uniformMatrix4fv(this.loc_mat_modelado_nor, true, this.mat_modelado_nor);
    }
    // ---------------------------------------------------------------------------
    /**
     * Hace la matriz de modelado igual a la identidad
     */
    resetMM() {
        this.fijarMatrizModelado(CMat4.ident());
    }
    // ---------------------------------------------------------------------------
    /**
     * Compone una matriz 4x4 por la derecha de la matriz de modelado actual.
     * @param mat_modelado_adic
     */
    compMM(mat_modelado_adic) {
        const mat_modelado_nueva = this.mat_modelado.componer(mat_modelado_adic);
        this.fijarMatrizModelado(mat_modelado_nueva);
    }
    // ---------------------------------------------------------------------------
    /**
     * Guarda una copia de la matriz de modelado actual en la pila, no la cambia.
     */
    pushMM() {
        this.pila_mat_modelado.push(this.mat_modelado);
    }
    // ---------------------------------------------------------------------------
    /**
     * Restaura la última matriz de modelado que hubiese en la pila.
     * produce un error si la pila está vacía
     */
    popMM() {
        const n = this.pila_mat_modelado.length;
        Assert(n > 0, `No se puede hacer 'popMM' en una pila vacía`);
        const prev_mat = this.pila_mat_modelado[n - 1];
        this.pila_mat_modelado.pop();
        this.fijarMatrizModelado(prev_mat);
    }
} // fin clase 'CauceBase'
