import { Assert, ComprErrorGL, Log, CrearFloat32ArrayV3, CrearFloat32ArrayV4 } from "./utilidades.js";
import { Vec3, CMat4 } from "./vec-mat.js";
import { Material } from "./material.js";
import { ShaderObject } from "./shader-obj.js";
import { ProgramObject } from "./program-obj.js";
import { CauceBase } from "./cauce-base.js";
import { b2n } from "./utilidades.js";
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
export async function CrearCauce(gl) {
    let cauce = new Cauce(gl);
    await cauce.inicializar();
    return cauce;
}
// -------------------------------------------------------------------------
export class Cauce extends CauceBase {
    // ---------------------------------------------------------------------------
    // Propiedades de la clase ("estáticas"), no específicas de cada instancia
    // (de solo lectura, 'const')
    // número total de atributos de vértice que se gestionan en el objeto programa
    static numero_atributos = 4;
    /**
     ** nombres descriptivos para los índices de los atributos que gestiona el cauce.
     */
    static indice_atributo = {
        posicion: 0,
        color: 1,
        normal: 2,
        coords_text: 3
    };
    // número máximo de fuentes de luz que gestiona el cauce 
    // (debe coincidir con el valor de la constante declarada para esto 
    // en el fragment shader, con el mismo nombre)
    static max_num_luces = 8;
    // ---------------------------------------------------------------------------
    // Variables de instancia:
    // variables de estado del cauce
    color = new Vec3([0.0, 0.0, 0.0]); // color actual para visualización sin tabla de colores
    eval_mil = false; // true -> evaluar MIL, false -> usar color plano
    usar_normales_tri = false; // true -> usar normal del triángulo, false -> usar interp. de normales de vértices
    eval_text = false; // true -> eval textura, false -> usar glColor o glColorPointer
    eval_sombras = false; // true -> eval sombras, false -> no evaluar sombras
    mat_vp_sombras = CMat4.ident(); // matriz de vista-proyección para sombras
    tipo_gct = 0; // tipo de generación de coordenadas de textura
    coefs_s = new Float32Array([1.0, 0.0, 0.0, 0.0]); // coeficientes para calcular coord. S con gen. aut. de coordenadas de textura
    coefs_t = new Float32Array([0.0, 1.0, 0.0, 0.0]); // coeficientes para calcular coord. S con gen. aut. de coordenadas de textura
    material = new Material(0.2, 0.8, 0.0, 10.0); // material actual 
    textura = null; // textura en uso actualmente, (nulo si está desactivado)
    // pilas de colores, matrices modelado, materiales y texturas
    pila_materiales = new Array;
    pila_texturas = new Array;
    pila_colores = new Array;
    // locations de los uniforms (cada una de ellas puede ser null)
    loc_eval_mil = null;
    loc_usar_normales_tri = null;
    loc_eval_text = null;
    loc_tipo_gct = null;
    loc_coefs_s = null;
    loc_coefs_t = null;
    loc_mil_ka = null;
    loc_mil_kd = null;
    loc_mil_ks = null;
    loc_mil_exp = null;
    loc_num_luces = null;
    loc_pos_dir_luz_ec = null;
    loc_color_luz = null;
    loc_param_s = null;
    loc_eval_sombras = null;
    loc_mat_vp_sombras = null;
    loc_tex = null;
    loc_tex_sombras = null;
    // ---------------------------------------------------------------------------
    // Métodos 
    // ---------------------------------------------------------------------------
    /**
     * Constructor
     * @param gl contexto WebGL en el cual se usará el objeto programa
     */
    constructor(gl) {
        super(gl);
    }
    // ---------------------------------------------------------------------------
    async inicializar() {
        const nombref = 'Cauce.inicializar:';
        Log(`${nombref} inicio.`);
        await this.crearObjetoPrograma();
        this.inicializarUniforms();
        this.imprimeInfoUniforms();
        Log(`${nombref} shaders compilados y objeto 'Cauce' creado con éxito.`);
    }
    // ---------------------------------------------------------------------------
    /**
     *  Lee las 'locations' de todos los uniforms y les da un
     *  valor inicial por defecto. También inicializa algunas variables de estado.
     */
    inicializarUniforms() {
        const nombref = 'Cauce.inicializarUniforms:';
        if (this.gl == null)
            throw Error(`${nombref} leerLocation - this.gl es nulo`);
        let gl = this.gl;
        ComprErrorGL(gl, `${nombref} error al inicio`);
        this.inicializarUniformsBase();
        this.programa.usar();
        // obtener las 'locations' de los parámetros uniform
        this.loc_mat_modelado = this.leerLocation("u_mat_modelado");
        this.loc_mat_modelado_nor = this.leerLocation("u_mat_modelado_nor");
        this.loc_mat_vista = this.leerLocation("u_mat_vista");
        this.loc_eval_mil = this.leerLocation("u_eval_mil");
        this.loc_mat_proyeccion = this.leerLocation("u_mat_proyeccion");
        this.loc_eval_mil = this.leerLocation("u_eval_mil");
        this.loc_usar_normales_tri = this.leerLocation("u_usar_normales_tri");
        this.loc_eval_text = this.leerLocation("u_eval_text");
        this.loc_tipo_gct = this.leerLocation("u_tipo_gct");
        this.loc_coefs_s = this.leerLocation("u_coefs_s");
        this.loc_coefs_t = this.leerLocation("u_coefs_t");
        this.loc_mil_ka = this.leerLocation("u_mil_ka");
        this.loc_mil_kd = this.leerLocation("u_mil_kd");
        this.loc_mil_ks = this.leerLocation("u_mil_ks");
        this.loc_mil_exp = this.leerLocation("u_mil_exp");
        this.loc_num_luces = this.leerLocation("u_num_luces");
        this.loc_pos_dir_luz_ec = this.leerLocation("u_pos_dir_luz_ec");
        this.loc_color_luz = this.leerLocation("u_color_luz");
        this.loc_param_s = this.leerLocation("u_param_s");
        this.loc_eval_sombras = this.leerLocation("u_eval_sombras");
        this.loc_mat_vp_sombras = this.leerLocation("u_mat_vp_sombras");
        this.loc_tex = this.leerLocation("u_tex");
        this.loc_tex_sombras = this.leerLocation("u_tex_sombras");
        gl.uniform1i(this.loc_eval_mil, b2n(this.eval_mil));
        gl.uniform1i(this.loc_usar_normales_tri, b2n(this.usar_normales_tri));
        gl.uniform1i(this.loc_eval_text, b2n(this.eval_text));
        gl.uniform1i(this.loc_tipo_gct, this.tipo_gct);
        gl.uniform4fv(this.loc_coefs_s, this.coefs_s);
        gl.uniform4fv(this.loc_coefs_t, this.coefs_t);
        gl.uniform1f(this.loc_mil_ka, this.material.ka);
        gl.uniform1f(this.loc_mil_kd, this.material.kd);
        gl.uniform1f(this.loc_mil_ks, this.material.ks);
        gl.uniform1f(this.loc_mil_exp, this.material.exp);
        gl.uniform1i(this.loc_eval_sombras, b2n(this.eval_sombras));
        gl.uniformMatrix4fv(this.loc_mat_vp_sombras, true, this.mat_vp_sombras);
        gl.uniform1i(this.loc_num_luces, 0); // por defecto: 0 fuentes de luz activas
        gl.uniform1i(this.loc_tex, 0); // la textura se asocia a la unidad 0
        gl.uniform1i(this.loc_tex_sombras, 1); // la textura de sombras se asocia a la unidad 1
        // comprobar errores 
        ComprErrorGL(gl, `${nombref} error al final`);
        // desactivar objeto programa
        gl.useProgram(null);
    }
    // ---------------------------------------------------------------------------
    /**
     * Imprime en la consola información sobre los uniforms del objeto programa
     */
    imprimeInfoUniforms() {
        this.imprimeInfoUniformsBase();
    }
    // ---------------------------------------------------------------------------
    /**
     *  Compila y enlaza el objeto programa
     * (deja nombre en 'id_prog', debe ser 0 antes)
     */
    async crearObjetoPrograma() {
        const nombref = 'Cauce.crearObjetoPrograma:';
        //if ( this.gl == null ) throw Error(`${nombref} leerLocation - this.gl es nulo`)
        let gl = this.gl;
        Log(`${nombref} inicio.`);
        ComprErrorGL(gl, `${nombref} error OpenGL al inicio`);
        Assert(this.objeto_programa == null, `${nombref}  el objeto programa no es nulo`);
        // Leer los fuentes GLSL
        let fs = await ShaderObject.crearDesdeURL(gl, gl.FRAGMENT_SHADER, "/glsl/cauce_3_00_fragment_shader.glsl");
        let vs = await ShaderObject.crearDesdeURL(gl, gl.VERTEX_SHADER, "/glsl/cauce_3_00_vertex_shader.glsl");
        Log(`${nombref} compilados.`);
        this.objeto_programa = new ProgramObject(gl);
        Log(`${nombref} po creado.`);
        this.objeto_programa.agregar(vs);
        this.objeto_programa.agregar(fs);
        this.objeto_programa.compilarEnlazar();
        ComprErrorGL(gl, `${nombref} error OpenGL al final`);
        Log(`${nombref} cauce creado ok.`);
    }
    // ---------------------------------------------------------------------------
    /**
     * Fija el color para las siguientes operaciones de visualización de VAOs sin colores
     * @param nuevo_color (Vec3) nuevo color actual
     */
    fijarColor(nuevo_color) {
        this.color = nuevo_color;
        this.gl.vertexAttrib3fv(Cauce.indice_atributo.color, this.color);
    }
    // ---------------------------------------------------------------------------
    /**
     * Guarda una copia del color actual en la pila de colores
     */
    pushColor() {
        this.pila_colores.push(this.color);
    }
    // ---------------------------------------------------------------------------
    /**
     * Restaura último color guardado en la pila de colores
     */
    popColor() {
        const nombref = 'Cauce.popColor';
        if (this.pila_colores.length == 0)
            throw new Error(`${nombref} intento de hacer pop en la pila de colores vacía`);
        this.fijarColor(this.pila_colores[this.pila_colores.length - 1]);
        this.pila_colores.pop();
    }
    /**
     * Activa o desactiva la evaluación del modelo de iluminación local
     * @param nue_eval_mil (boolean) true para activar iluminacion, false para desactivar
     */
    fijarEvalMIL(nue_eval_mil) {
        this.eval_mil = nue_eval_mil; // registra valor en el objeto Cauce.
        this.gl.uniform1i(this.loc_eval_mil, b2n(this.eval_mil)); // cambia parámetro del shader
    }
    // ---------------------------------------------------------------------------
    /**
     * Fija el material actualmente activo en el cauce
     */
    fijarMaterial(nuevo_material) {
        this.material = nuevo_material;
        this.gl.uniform1f(this.loc_mil_ka, this.material.ka);
        this.gl.uniform1f(this.loc_mil_kd, this.material.kd);
        this.gl.uniform1f(this.loc_mil_ks, this.material.ks);
        this.gl.uniform1f(this.loc_mil_exp, this.material.exp);
    }
    // ---------------------------------------------------------------------------
    /**
     * guarda el material actual en la pila de materiales
     */
    pushMaterial() {
        this.pila_materiales.push(this.material);
    }
    // ---------------------------------------------------------------------------
    /**
     * Activa el último material guardado en la pila de materiales.
     */
    popMaterial() {
        let nombref = "Cauce.popMaterial";
        let n = this.pila_materiales.length;
        Assert(n > 0, `${nombref} no se puede hacer 'pop' de la pila de materiales (está vacía)`);
        this.fijarMaterial(this.pila_materiales[n - 1]);
        this.pila_materiales.pop();
    }
    // ---------------------------------------------------------------------------
    /**
     * Fija el valor de 'S'
     * @param nue_param_s (number)
     */
    fijarParamS(nue_param_s) {
        this.gl.uniform1f(this.loc_param_s, nue_param_s); // cambia parámetro del shader
    }
    // ---------------------------------------------------------------------------
    /**
     * Fijar los parámetros del modelo de iluminación local (MIL)
     * @param ka (number)
     * @param kd (number)
     * @param ks (number)
     * @param exp  (number)
     */
    fijarParamsMIL(ka, kd, ks, exp) {
        this.gl.uniform1f(this.loc_mil_ka, ka);
        this.gl.uniform1f(this.loc_mil_kd, kd);
        this.gl.uniform1f(this.loc_mil_ks, ks);
        this.gl.uniform1f(this.loc_mil_exp, exp);
    }
    // ---------------------------------------------------------------------------
    /**
     * Activa o desactiva el uso de una textura en los shaders (fija uniform)
     * Si se activa, hay que especificar el objeto de textura webgl a usar.
     *
     * @param nuevo_eval_text
     * @param texture
     */
    fijarEvalText(nuevo_eval_text, texture) {
        const nombref = "Cauce.fijarEvalText:";
        let gl = this.gl;
        // registrar nuevo valor
        this.eval_text = nuevo_eval_text;
        this.gl.uniform1i(this.loc_eval_text, b2n(this.eval_text));
        // si se está activando, asociar el sampler de textura en el shader con el objeto textura de la aplicación
        if (nuevo_eval_text) {
            if (texture == null)
                throw Error(`${nombref} si se habilita uso de texturas, se debe dar una textura no nula`);
            gl.activeTexture(gl.TEXTURE0); // ver nota aquí abajo.
            gl.bindTexture(gl.TEXTURE_2D, texture);
            // Nota: 'activeTexture' activa la unidad 0 de texturas, que está activada por defecto,  solo sería necesario si hubiese más de una textura en el shader (las demás irían en la unidad 1, la 2, etc...), no es el caso, pero lo pongo por si acaso, ver: https://webglfundamentals.org/webgl/lessons/webgl-2-textures.html (al final)
        }
    }
    // ---------------------------------------------------------------------------
    /**
     * Fija la textura actual en uso en el cauce
     * @param nueva_textura nueva textura, puede ser null (se desactivan texturas)
     */
    fijarTextura(nueva_textura) {
        this.textura = nueva_textura;
        if (this.textura == null) // si es nula, desactivar texturas
            this.fijarEvalText(false, null);
        else
            this.fijarEvalText(true, this.textura.texturaWebGL);
    }
    // ---------------------------------------------------------------------------
    /**
     * Guarda la textura actual en la pila de texturas
     */
    pushTextura() {
        this.pila_texturas.push(this.textura);
    }
    // ---------------------------------------------------------------------------
    /**
     * Restaura la textura actual de la pila de texturas.
     */
    popTextura() {
        let nombref = "Cauce.popTextura";
        let n = this.pila_texturas.length;
        Assert(n > 0, `${nombref} no se puede hacer 'pop' de la pila de texturas (está vacía)`);
        this.fijarTextura(this.pila_texturas[n - 1]);
        this.pila_texturas.pop();
    }
    // ---------------------------------------------------------------------------
    /**
     * da valores a los uniforms relacionados con las fuentes de luz en el cauce
     *
     * @param color      vector de colores de las fuentes de luz
     * @param pos_dir_wc vector de posiciones o direcciones a la fuentes de luz (en coordenadas de mundo)
     */
    fijarFuentesLuz(color, pos_dir_wc) {
        const nombref = `Cauce.fijarFuentesLuz:`;
        const nl = color.length;
        Assert(0 < nl && nl < Cauce.max_num_luces, `${nombref} demasiadas fuentes de luz`);
        Assert(nl == pos_dir_wc.length, `${nombref} el vector de colores y el de posiciones/direcciones tienen distinto tamaño`);
        let gl = this.gl;
        let pos_dir_ec = [];
        for (let i = 0; i < nl; i++)
            pos_dir_ec.push(this.mat_vista.aplica_v4(pos_dir_wc[i]));
        gl.uniform1i(this.loc_num_luces, nl);
        gl.uniform3fv(this.loc_color_luz, CrearFloat32ArrayV3(color));
        gl.uniform4fv(this.loc_pos_dir_luz_ec, CrearFloat32ArrayV4(pos_dir_ec));
    }
    //
    fijarMatrizVPSombras(mat_vp_sombras) {
        this.gl.uniformMatrix4fv(this.loc_mat_vp_sombras, true, mat_vp_sombras);
    }
    /**
     * Fija los parámetros de sombras:
     *
     * @param nuevo_eval_sombras - true para evaluar sombras, false para no evaluarlas
     * @param mat_vp_sombras - matriz de vista-proyección para sombras (alineada con fuente 0)
     */
    fijarSombras(nuevo_eval_sombras, fbo_sombras, nuevo_mat_vp_sombras) {
        const fname = "Cauce.fijarSombras:";
        let gl = this.gl;
        ComprErrorGL(gl, `${fname} error al inicio`);
        this.eval_sombras = nuevo_eval_sombras;
        gl.uniform1i(this.loc_eval_sombras, b2n(this.eval_sombras));
        //Log(`## CAUCE ## ${fname} sombras activadas: ${this.eval_sombras}`)
        //Log(`## CAUCE ## ${fname} location eval_sombras: ${this.loc_eval_sombras}`)
        if (this.eval_sombras) {
            if (nuevo_mat_vp_sombras == null)
                throw new Error(`${fname}: matriz de vista-proyección para sombras es nula, pero se está activando las sombras`);
            if (fbo_sombras == null)
                throw new Error(`${fname}: FBO de sombras es nulo, pero se está activando las sombras`);
            // construir la matriz vp de sombras añadiendole la translación y escalado por el tamaño del fbo 
            let sx = fbo_sombras.tamX;
            let sy = fbo_sombras.tamY;
            let mt = CMat4.traslacion(new Vec3([1.0, 1.0, 0.0])); // (1) dejar coords X e Y en [0..2] (estaban en -1..1)
            let ms = CMat4.escalado(new Vec3([sx / 2.0, sy / 2.0, 1.0])); // (2) dejar coords X en (0..tamX), Y en (0..tamY)
            this.mat_vp_sombras = ms.componer(mt.componer(nuevo_mat_vp_sombras));
            gl.uniformMatrix4fv(this.loc_mat_vp_sombras, true, this.mat_vp_sombras);
            gl.activeTexture(gl.TEXTURE1); // la textura de sombras se asocia a la unidad 1
            gl.bindTexture(gl.TEXTURE_2D, fbo_sombras.cbuffer);
            gl.activeTexture(gl.TEXTURE0); // la textura de color se asocia a la unidad 0, lo dejo así por si acaso
        }
        ComprErrorGL(gl, `${fname} error al final`);
    }
} // fin clase 'Cauce'
