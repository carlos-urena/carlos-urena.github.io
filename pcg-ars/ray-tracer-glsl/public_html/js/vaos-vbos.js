import { Assert, ComprErrorGL, CrearFloat32ArrayV3, CrearFloat32ArrayV2, CrearUint32Array, } from "./utilidades.js";
import { Cauce } from "./cauce.js";
import { AplicacionWRT } from "./aplicacion-wrt.js";
// -----------------------------------------------------------------------------
/**
 * Descriptor de un VBO (Vertex Buffer Object) con una tabla de un atributo de vértices
 *
 */
export class DescrVBOAtrib {
    // índice de esta tabla de atributos
    index = 0;
    // número de tuplas de valores en la tabla
    count = 0;
    // tamaño de cada tupla en la tabla de datos
    size = 0;
    // objeto buffer de OpenGL (VBO)
    buffer = null;
    // copia de los datos, propiedad de este objeto
    data;
    /**
     * Inicializa los metadatos y datos de para un VBO (no lo crea en la GPU)
     * (se hace una copia propia de los datos)
     *
     * @param {number}       index -- índice de esta tabla de atributo
     * @param {number}       size  -- número de valores flotantes en cada tupla
     * @param {Float32Array} data  -- typed array with float values (is interpreted a set of equal-length vectors)
     */
    constructor(index, size, data) {
        const nombref = `DescrVBOAtrib.constructor:`;
        this.index = index;
        this.size = size;
        this.count = data.length / size;
        this.data = data;
        this.comprobar();
    }
    // -------------------------------------------------------------------------------------------
    get get_count() {
        return this.count;
    }
    get get_index() {
        return this.index;
    }
    // -------------------------------------------------------------------------------------------
    comprobar() {
        const nombref = `DescrVBOAtrib.comprobar:`;
        Assert(2 <= this.size && this.size <= 4, `${nombref} 'size' (== ${this.size}) must be between 2 and 4`);
        Assert(1 <= this.data.length / this.size, `${nombref} 'size' (== ${this.size}) cannot be greater than 'data.length' (== ${this.data.length})`);
        Assert(this.data.length % this.size == 0, `${nombref}: número de valores en 'data' (${this.data.length}) no es múltiplo de 'size' (${this.size})`);
    }
    // -------------------------------------------------------------------------------------------
    /**
     * Crea el VBO en la GPU y lo registra en el VAO activo, inicializa 'buffer'
     * (usa el contexto que se específico en el constructor)
     */
    crearVBO() {
        const nombref = 'DescrVBOAtribs.crearVBO';
        let gl = AplicacionWRT.instancia.gl;
        ComprErrorGL(gl, `${nombref}: hay un error de OpenGL a la entrada`);
        // crear e inicializar el buffer
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        Assert(gl.isBuffer(this.buffer), `${nombref} no se ha creado un buffer válido`);
        // registrar y activar el VBO en el VAO activo
        gl.vertexAttribPointer(this.index, this.size, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(this.index);
        // ya está
        ComprErrorGL(gl, `${nombref}: hay un error de OpenGL a la salida`);
    }
}
// -------------------------------------------------------------------------------------------------
/**
 * Descriptor de VBOs (Vertex Buffer Object) de índices
 */
export class DescrVBOInd {
    // -------------------------------------------------------------------------------------------
    // Variables de instancia 
    // copia de los indices, propiedad de este objeto
    indices = null;
    // tipo de los valores (GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT, GL_UNSIGNED_INT)
    type = 0;
    // cuenta de índices (>0)
    count = 0;
    // VBO OpenGL, null hasta que se crea (con 'crearVVBO')
    buffer = null;
    // -------------------------------------------------------------------------------------------
    /**
     * Inicializa el descriptor de VBO de índices
     * @param indices  secuencia de índices
     */
    constructor(indices) {
        const nombref = ` DescrVBOInd.constructor(): `;
        Assert(0 < indices.length, `${nombref} 'indices' is an empty array`);
        let gl = AplicacionWRT.instancia.gl;
        this.count = indices.length;
        if (indices instanceof Uint8Array) {
            this.indices = new Uint8Array(indices);
            this.type = gl.UNSIGNED_BYTE;
        }
        else if (indices instanceof Uint16Array) {
            this.indices = new Uint16Array(indices);
            this.type = gl.UNSIGNED_SHORT;
        }
        else if (indices instanceof Uint32Array) {
            this.indices = new Uint32Array(indices);
            this.type = gl.UNSIGNED_INT;
        }
    }
    // -------------------------------------------------------------------------------------------
    /**
     * Devuelve la cuenta de índices en este descriptor
     * @returns variable de instancia 'count'
     */
    get get_count() {
        return this.count;
    }
    // -------------------------------------------------------------------------------------------
    /**
     * Devuelve el tipo OpenGL de los índices
     * @returns variable de instancia 'type'
     */
    get get_type() {
        return this.type;
    }
    // -------------------------------------------------------------------------------------------
    /**
     * Crea el VBO en la GPU, inicializa 'gl_buffer'
     * (usa el contexto que se específico en el constructor)
     */
    crearVBO() {
        const nombref = `DescrVBOInd.crearVBO: `;
        let gl = AplicacionWRT.instancia.gl;
        ComprErrorGL(gl, `${nombref} error de OpenGL al inicio`);
        // crear y activar el buffer
        this.buffer = gl.createBuffer();
        Assert(this.buffer != null, `${nombref} no se ha podido crear el buffer`);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        Assert(gl.isBuffer(this.buffer), `${nombref} no se ha inicializado el buffer`);
        // ya está
        ComprErrorGL(gl, `${nombref} error de OpenGL al final`);
    }
}
// Nota (YA HECHO)
//
// mejorar 'DescrVAO' usando como parámetro del constructor una instancia de un 
// interfaz que contiene las tablas, obligatoriamente posiciones y opcionalmente 
// indices y otros atributos.
//
// ver: https://www.typescriptlang.org/docs/handbook/interfaces.html
// -------------------------------------------------------------------------------------------------
/**
 *   Descriptor de VAO (Vertex Array Object)
 *
 *   Una clase para encapsular los VBOs de un VAO de WebGL, junto con el VAO en sí
 *   (https://developer.mozilla.org/en-US/docs/Web/API/WebGLVertexArrayObject)
 *
 */
export class DescrVAO {
    // --------------------------------------------------------------------
    // Variables de instancia
    nombre_vao = "no asignado";
    get nombre() { return this.nombre_vao; }
    set nombre(nombre) { this.nombre_vao = nombre; }
    // VAO en la GPU 
    array = null;
    // número de tablas de atributos que tiene el VAO (incluyendo las posicione)
    // como máximo será el numero total de atributos que gestiona el cauce
    num_atribs = 0;
    // número de vértices en la tabla de posiciones de vértices 
    count = 0;
    // número de índices en la tabla de índices (si hay índices, en otro caso 0)
    idxs_count = 0;
    // si hay índices, tiene el tipo de los índices 
    idxs_type = 0;
    // si la secuencia es indexada, VBO de attrs, en otro caso 'null' 
    dvbo_indices = null;
    // array con los descriptores de VBOs de atributos
    dvbo_atributo = new Array;
    // array que indica si cada tabla de atributos está habilitada o deshabilitada
    atrib_habilitado = new Array;
    // 'objeto extensión' de WebGL (no tiene tipo definido en Typescript???)
    ext_vao = null;
    /**
     * Crea un descriptor de VAO, dando un descriptor del VBO de posiciones de vértices
     */
    constructor(tablas) {
        const nombref = 'DescrVAO.constructor:';
        let gl = AplicacionWRT.instancia.gl;
        this.num_atribs = Cauce.numero_atributos;
        // si estamos en WebGL 1.0, exigir que esté disponible la extensión 'OES_vertex_array_object'  (revisar esto)
        if (gl instanceof WebGLRenderingContext) {
            this.ext_vao = gl.getExtension("OES_vertex_array_object");
            if (this.ext_vao == null)
                throw Error(`${nombref} no encuentro la extensión 'OES_vertex_array_object'`);
        }
        // inicializar tablas de VBOs y de estado habilitado/deshabilitado
        for (let i = 0; i < this.num_atribs; i++) {
            this.dvbo_atributo.push(null); // inicialmente no hay tabla de atributos (son null)
            this.atrib_habilitado.push(true); // habilitado por defecto (si no es null)
        }
        // crear el VBO de posiciones (siempre tiene que estar)
        if (!tablas.hasOwnProperty("posiciones")) // creo que no puede ocurrir ya que 'posiciones' no es opcional
            throw new Error(`${nombref} no hay tabla de posiciones en el conjunto de tablas  de entrada`);
        let dvbo_posiciones = new DescrVBOAtrib(Cauce.indice_atributo.posicion, 3, CrearFloat32ArrayV3(tablas.posiciones));
        this.dvbo_atributo[0] = dvbo_posiciones;
        this.count = dvbo_posiciones.get_count;
        // si hay tabla de índices, crear y añadir el correspondiente VBO
        if (tablas.indices !== undefined)
            this.agregar_tabla_ind(tablas.indices);
        // si hay tabla de coordenadas de textura, crear y añadir el correspondiente VBO
        if (tablas.coords_text !== undefined)
            this.agregar_tabla_atrib_v2(Cauce.indice_atributo.coords_text, tablas.coords_text);
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Añade al VAO un descriptor de VBO de atributos, se llama desde 'agregar'
     * @param dvbo_atributo
     */
    agregar_atrib(dvbo_atributo) {
        const nombref = 'DescrVAO.agregar_atrib';
        let index = dvbo_atributo.get_index;
        Assert(0 < index && index < this.num_atribs, `${nombref} intro de agregar VBO con índice fuera de rango`);
        Assert(this.count == dvbo_atributo.get_count, `${nombref} intento de añadir un descriptor de atributo con un número de tuplas distinto al de vértices`);
        // registrar el descriptor de VBO en la tabla de descriptores de VBOs de atributos
        this.dvbo_atributo[index] = dvbo_atributo;
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Crea un descriptor de VBO de atributos con tuplas de 2 elementos, y lo añade al VAO
     * @param dvbo_atributo
     */
    agregar_tabla_atrib_v2(index, tabla) {
        this.agregar_atrib(new DescrVBOAtrib(index, 2, CrearFloat32ArrayV2(tabla)));
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Crea un descriptor de VBO de atributos con tuplas de 3 elementos, y lo añade al VAO
     * @param dvbo_atributo
     */
    agregar_tabla_atrib_v3(index, tabla) {
        this.agregar_atrib(new DescrVBOAtrib(index, 3, CrearFloat32ArrayV3(tabla)));
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Añade al VAO un descriptor de VBO de índices, se llama desde 'agregar'
     * @param dvbo_atributo
     */
    agregar_ind(dvbo_indices) {
        const nombref = 'DescrVAO.agregar_ind:';
        this.idxs_count = dvbo_indices.get_count;
        this.idxs_type = dvbo_indices.get_type;
        this.dvbo_indices = dvbo_indices;
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Crea un descriptor de VBO de índices y lo añade al VAO
     * @param dvbo_atributo
     */
    agregar_tabla_ind(tabla) {
        this.agregar_ind(new DescrVBOInd(CrearUint32Array(tabla)));
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Agrega un descriptor de VBO al VAO (puede ser un descriptor de VBO de atributo o de indice)
     * @param dvbo descriptor que se quiere agregar
     */
    agregar(dvbo) {
        const nombref = 'DescrVAO.agregar';
        if (dvbo instanceof DescrVBOAtrib)
            this.agregar_atrib(dvbo);
        else if (dvbo instanceof DescrVBOInd)
            this.agregar_ind(dvbo);
        else
            Assert(false, `${nombref} 'dvbo' no es un descriptor de VBO de atributos ni de índices`);
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Llama a 'createVertexArray' o 'createVertexArrayOES' en función de las características del
     * contexto WebGL y el objeto extensión ('this.gl' y 'this.ext_vao')
     * Asigna valor 'this.array'
     */
    crearArray() {
        const nombref = `DescrVAO.crearArray`;
        let gl = AplicacionWRT.instancia.gl;
        if (this.ext_vao == null && gl instanceof WebGL2RenderingContext) {
            this.array = gl.createVertexArray();
            Assert(gl != null, `${nombref} no se ha creado objeto VAO`);
        }
        else if (this.ext_vao != null) {
            this.array = this.ext_vao.createVertexArrayOES();
            Assert(gl != null, `${nombref} no se ha creado objeto VAO`);
        }
        else
            throw Error(`${nombref} estado inconsistente`);
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Llama a 'bindVertexArray' o 'bindVertexArrayOES' en función de las características del
     * contexto WebGL y el objeto extensión ('this.gl' y 'this.ext_vao')
     */
    activarVAO() {
        const nombref = `DescrVAO.activarVertexArray`;
        let gl = AplicacionWRT.instancia.gl;
        if (gl == null)
            throw Error(`${nombref} 'gl' es nulo`);
        else if (this.array == null)
            throw Error(`${nombref} 'array' es nulo`);
        else if (this.ext_vao == null && gl instanceof WebGL2RenderingContext)
            gl.bindVertexArray(this.array);
        else if (this.ext_vao != null)
            this.ext_vao.bindVertexArrayOES(this.array);
        else
            throw Error(`${nombref} estado inconsistente`);
    }
    /**
     * Llama a 'bindVertexArray(0)' o 'bindVertexArrayOES(0)' en función de las características del
     * contexto WebGL y el objeto extensión ('this.gl' y 'this.ext_vao')
     */
    desactivarVAO() {
        const nombref = `DescrVAO.desactivarVAO`;
        let gl = AplicacionWRT.instancia.gl;
        if (this.array == null)
            throw Error(`${nombref} 'array' es nulo`);
        else if (this.ext_vao == null && gl instanceof WebGL2RenderingContext)
            gl.bindVertexArray(null);
        else if (this.ext_vao != null)
            this.ext_vao.bindVertexArrayOES(null);
        else
            throw Error(`${nombref} estado inconsistente`);
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Crea el VAO en la GPU (queda 'binded')
     */
    crearVAO() {
        const nombref = 'DescrVAO.crearVAO';
        let gl = AplicacionWRT.instancia.gl;
        if (this.dvbo_atributo[0] == null)
            throw Error("nunca pasa!");
        ComprErrorGL(gl, `${nombref} error de OpenGL a la entrada`);
        Assert(this.array == null, `${nombref}: el VAO ya se había creado antes`);
        // crear y activar el VAO
        this.crearArray(); // llama a 'gl.createVertexArray' o bien 'ext.createVertexArrayOES'
        this.activarVAO(); // llama a 'gl.bindVertexArray' o bien 'ext.bindVertexArrayOES'
        // crear (y habilitar) los VBOs de posiciones y atributos en este VAO 
        this.dvbo_atributo[0].crearVBO();
        for (let i = 1; i < this.num_atribs; i++) {
            let dvbo = this.dvbo_atributo[i];
            if (dvbo != null)
                dvbo.crearVBO();
        }
        // si procede, crea el VBO de índices 
        if (this.dvbo_indices != null)
            this.dvbo_indices.crearVBO();
        // deshabilitar tablas que no estén habilitadas
        for (let i = 1; i < this.num_atribs; i++) {
            let dvbo = this.dvbo_atributo[i];
            if (dvbo != null)
                if (!this.atrib_habilitado[i])
                    gl.disableVertexAttribArray(i);
        }
        ComprErrorGL(gl, `${nombref} error de OpenGL a la salida`);
    }
    // -------------------------------------------------------------------------------------------------
    habilitarAtrib(index, habilitar) {
        const nombref = 'DescrVAO.habilitarAtrib';
        // comprobar precondiciones
        Assert(0 < index, `${nombref} índice es cero o negativo`);
        Assert(index < this.num_atribs, `${nombref} índice fuera de rango`);
        Assert(this.dvbo_atributo[index] != null, `${nombref} no se puede habilitar/deshab. un atributo sin tabla`);
        let gl = AplicacionWRT.instancia.gl;
        // registrar el nuevo valor del flag
        this.atrib_habilitado[index] = habilitar;
        // si el VAO ya se ha enviado a la GPU, actualizar estado del VAO en OpenGL
        if (this.array != 0) {
            ComprErrorGL(gl, `${nombref} pepe`);
            this.activarVAO();
            if (habilitar)
                gl.enableVertexAttribArray(index);
            else
                gl.disableVertexAttribArray(index);
        }
    }
    // -------------------------------------------------------------------------------------------------
    /**
     * Visualiza el VAO, si no está creado en la GPU, lo crea.
     * (para los tipos de primitivas, ver: )
     *
     * @param mode (number) tipo de primitiva (gl.LINES, gl.TRIANGLES, etc...)
     */
    draw(mode) {
        const nombref = 'DescrVAO.draw:';
        let gl = AplicacionWRT.instancia.gl;
        ComprErrorGL(gl, `${nombref} al inicio (vao==${this.nombre})`);
        if (this.array == null)
            this.crearVAO();
        else
            this.activarVAO();
        ComprErrorGL(gl, `${nombref} vao creado`);
        if (this.dvbo_indices == null)
            gl.drawArrays(mode, 0, this.count);
        else
            gl.drawElements(mode, this.idxs_count, this.idxs_type, 0);
        this.desactivarVAO();
        ComprErrorGL(gl, `${nombref} al final (vao==${this.nombre})`);
    }
}
