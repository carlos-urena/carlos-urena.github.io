import { Log, Assert, CajaEnglobante } from "./utilidades.js";
import { Cauce } from "./cauce.js";
import { DescrVAO } from "./vaos-vbos.js";
import { Vec2, Vec3, UVec3 } from "./vec-mat.js";
import { ObjetoVisualizable } from "./objeto-visu.js";
import { AplicacionWeb } from "./aplicacion-web.js";
// **********************************************************************************
/**
 * Clase para mallas indexadas de triángulos
 */
export class MallaInd extends ObjetoVisualizable {
    // tablas de atributos
    posiciones = []; // tabla de coordenadas de las posiciones de los vértices
    colores = []; // tabla de colores de los vértices 
    normales_v = []; // tabla de normales de los vértices 
    coords_text = []; // tabla de coordenadas de textura de los vértices
    // tabla de triángulos (tabla de índices)
    triangulos = [];
    // contexto
    //protected gl : WebGL2RenderingContext | WebGLRenderingContext
    // descriptor del VAO con la malla
    dvao = null;
    // descriptor del VAO con las aristas (se crea al llamar a 'crearVAOAristas')
    dvao_aristas = null;
    // descriptor del VAO con los segmentos de normales (se crea al llamar a 'crearVAONormales')
    dvao_normales = null;
    // caja englobante (se calcula cuando se pide y no se ha calculado antes)
    caja = null;
    // --------------------------------------------------------------------
    /**
     * Construye una malla indexada
     */
    constructor() {
        super();
        this.nombre = 'malla indexada';
    }
    // --------------------------------------------------------------------
    /**
     * Comprueba que una malla indexada está correctamente inicializada
     * (se debe llamar al final del constructor de las clases derivadas)
     * se llama antes de visualizar la primera vez.
     */
    comprobar(nombref) {
        Assert(this.posiciones.length > 0, `${nombref} malla indexada con tabla de posiciones de vertices vacía (${this.nombre})`);
        Assert(this.triangulos.length > 0, `${nombref} malla indexada con tabla de triángulos vacía (${this.nombre})`);
        if (this.colores.length > 0)
            Assert(this.posiciones.length == this.colores.length, `${nombref} tabla de colores no vacía pero con tamaño distinto a la de vértices (${this.nombre})`);
        if (this.normales_v.length > 0)
            Assert(this.posiciones.length == this.normales_v.length, `${nombref} tabla de normales no vacía pero con tamaño distinto a la de vértices (${this.nombre})`);
        if (this.coords_text.length > 0)
            Assert(this.posiciones.length == this.coords_text.length, `${nombref} tabla de coordenadas de textura no vacía pero con tamaño distinto a la de vértices (${this.nombre})`);
    }
    // --------------------------------------------------------------------
    /**
     * Crea e inicializa el VAO
     */
    crearInicializarVAO() {
        const nombref = 'MallaInd.crearVAO';
        let gl = AplicacionWeb.instancia.gl;
        Log(`${nombref} ENTRADA - this.dvao == ${this.dvao}`);
        //Log(`${nombref} inicio, creando VAO de ${this.nombre}`)
        Assert(this.dvao == null, `${nombref} el vao ya está creado`);
        this.comprobar(nombref);
        this.dvao = new DescrVAO({ posiciones: this.posiciones, indices: this.triangulos });
        if (this.colores.length > 0)
            this.dvao.agregar_tabla_atrib_v3(Cauce.indice_atributo.color, this.colores);
        if (this.normales_v.length > 0)
            this.dvao.agregar_tabla_atrib_v3(Cauce.indice_atributo.normal, this.normales_v);
        if (this.coords_text.length > 0)
            this.dvao.agregar_tabla_atrib_v2(Cauce.indice_atributo.coords_text, this.coords_text);
        this.dvao.nombre = `VAO de la malla indexada '${this.nombre}'`;
        Log(`${nombref} SALIDA, this.dvao == ${this.dvao}`);
    }
    // --------------------------------------------------------------------
    crearVAOAristas() {
        const nombref = `MallaInd.crearTablaAristas (${this.nombre}):`;
        let gl = AplicacionWeb.instancia.gl;
        const nv = this.posiciones.length;
        Assert(nv > 0, `${nombref} no hay vértices en la malla`);
        Assert(this.triangulos.length > 0, `${nombref} la tabla de triángulos está vacía`);
        Assert(this.dvao_aristas == null, `${nombref} ya se ha creado el VAO de aristas`);
        Log(`${nombref} inicio, nv == ${nv}`);
        // Declarar en inicializar la tabla de adyacencias 'adyacentes'
        // para cada vértice 'i', tiene el conjunto de índices de vértices 
        // 'j' con i<j tal que hay una arista entre 'i' y 'j'
        let adyacentes = new Array(nv);
        for (let i = 0; i < nv; i++)
            adyacentes[i] = new Set;
        // función que añade una arista a la tabla de adyacencias
        function arista(a, b) {
            Assert(0 <= a && a < nv, `${nombref} índice de vértice 'a' fuera de rango`);
            Assert(0 <= b && b < nv, `${nombref} índice de vértice 'b' fuera de rango`);
            adyacentes[Math.min(a, b)].add(Math.max(a, b));
        }
        // crear la tabla de adyacencias usando la tabla de triángulos 
        for (let t of this.triangulos) {
            arista(t[0], t[1]);
            arista(t[1], t[2]);
            arista(t[2], t[0]);
        }
        // contar cuantas aristas hay en total, sumando la cardinalidad de los conjuntos en 
        // la tabla de adyacencias
        let na = 0;
        for (let s of adyacentes)
            na = na + s.size;
        Log(`${nombref} el número de aristas en ${this.nombre} es ${na}`);
        // crear la tabla de aristas a partir de la tabla de adyacentes
        let aristas = new Uint32Array(2 * na);
        let ca = 0;
        for (let i = 0; i < adyacentes.length; i++)
            for (let j of adyacentes[i]) {
                aristas[ca++] = i;
                aristas[ca++] = j;
            }
        Assert(ca == 2 * na, `${nombref} esto no debe saltar, na == ${na}, ca == ${ca}`);
        // crear el descriptor de VAO
        this.dvao_aristas = new DescrVAO({ posiciones: this.posiciones, indices: aristas });
        Log(`${nombref} creado el VAO de aristas de ${this.nombre}`);
    }
    // --------------------------------------------------------------------
    /**
     * Crea el VAO de normales (this.dvao_normales)
     */
    crearVAONormales() {
        const nombref = `MallaInd.crearVAONormales`;
        Assert(this.dvao_normales == null, `${nombref} el VAO de normales ya está creado`);
        Assert(this.normales_v.length == this.posiciones.length, `${nombref} no hay normales, o no las mismas que vértices.`);
        let segmentos = new Array(2 * this.normales_v.length);
        for (let i = 0; i < this.posiciones.length; i++) {
            segmentos[2 * i + 0] = this.posiciones[i];
            segmentos[2 * i + 1] = this.posiciones[i].mas(this.normales_v[i].mult(0.15));
        }
        this.dvao_normales = new DescrVAO({ posiciones: segmentos });
    }
    // --------------------------------------------------------------------
    /**
     * Crea e inicializar el VAO (si no lo estaba) y visualizar la malla
     */
    visualizar() {
        const nombref = `MallaInd.visualizarGL (${this.nombre}):`;
        let gl = AplicacionWeb.instancia.gl;
        let cauce = AplicacionWeb.instancia.cauce;
        this.guardarCambiarEstado(cauce);
        if (this.dvao == null)
            this.crearInicializarVAO();
        this.dvao.draw(gl.TRIANGLES);
        this.restaurarEstado(cauce);
    }
    // --------------------------------------------------------------------
    /**
     * Visualiza el objeto sobre un cauce básico, únicamente la geometría, nada más
     * (se supone que el cauce está activo al llamar a este método)
     */
    visualizarGeometria(cauceb) {
        const nombref = `MallaInd.visualizarGeometria (${this.nombre}):`;
        let gl = AplicacionWeb.instancia.gl;
        if (this.dvao == null)
            this.crearInicializarVAO();
        if (this.tieneMatrizModelado) {
            cauceb.pushMM();
            cauceb.compMM(this.matrizModelado);
        }
        this.dvao.draw(gl.TRIANGLES);
        if (this.tieneMatrizModelado)
            cauceb.popMM();
    }
    // --------------------------------------------------------------------
    /**
     * Visualiza las aristas de un objeto, la 1a vez crea 'dvao_aristas'
     */
    visualizarAristas() {
        const nombref = `MallaInd.visualizarGL_Aristas (${this.nombre}):`;
        let gl = AplicacionWeb.instancia.gl;
        let cauce = AplicacionWeb.instancia.cauce;
        this.pushCompMM(cauce);
        if (this.dvao_aristas == null)
            this.crearVAOAristas();
        this.dvao_aristas.draw(gl.LINES);
        this.popMM(cauce);
    }
    // --------------------------------------------------------------------
    /**
     * Visualiza las aristas de un objeto, la 1a vez crea 'dvao_aristas'
     */
    visualizarNormales() {
        const nombref = `MallaInd.visualizarGL_Normales (${this.nombre}):`;
        let gl = AplicacionWeb.instancia.gl;
        let cauce = AplicacionWeb.instancia.cauce;
        this.pushCompMM(cauce);
        if (this.dvao_normales == null)
            this.crearVAONormales();
        this.dvao_normales.draw(gl.LINES);
        this.popMM(cauce);
    }
    // --------------------------------------------------------------------
    /**
     * Calcular la tabla de normales de triángulos y vértices.
     *
     */
    calcularNormales() {
        const nombref = `MallaInd.calcularNormalesVertices (${this.nombre}):`;
        const num_t = this.triangulos.length;
        const num_v = this.posiciones.length;
        Assert(num_t > 0, `${nombref} no hay triángulos en la malla`);
        Assert(num_v > 0, `${nombref} no hay vértices en la malla`);
        // calcular las normales de las caras 
        const v = this.posiciones;
        const ejeY = new Vec3([0.0, 1.0, 0.0]);
        let num_td = 0; // cuenta de triángulos degenerados (sin área, y por tanto sin normal)
        let num_vd = 0; // cuenta de vértices degenerados (= sin normal)
        let nt = Array(num_t); // normales de triángulos
        const vcero = new Vec3([0.0, 0.0, 0.0]);
        const eps = 1e-6; // longitud mínima de las normales para ser normalizadas.
        for (let i = 0; i < num_t; i++) {
            const t = this.triangulos[i];
            const edge1 = v[t[1]].menos(v[t[0]]);
            const edge2 = v[t[2]].menos(v[t[0]]);
            const nn = edge1.cross(edge2); // normal, no normalizada 
            const l = nn.longitud;
            if (eps < l)
                nt[i] = nn.div(l);
            else {
                nt[i] = vcero;
                num_td++;
            }
        }
        Log(`${nombref} calculadas normales de triángulos (${num_td}/${num_t} triángulos degenerados)`);
        // calcular las normales de los vértices 
        let nv = new Array(num_v);
        nv.fill(vcero);
        for (let it = 0; it < num_t; it++) {
            const t = this.triangulos[it];
            for (let ivt = 0; ivt < 3; ivt++)
                nv[t[ivt]] = nv[t[ivt]].mas(nt[it]);
        }
        for (let iv = 0; iv < num_v; iv++) {
            const l = nv[iv].longitud;
            if (eps < l)
                nv[iv] = nv[iv].div(l);
            else {
                nv[iv] = vcero;
                num_vd++;
            }
        }
        Log(`${nombref} calculadas normales de vértices (${num_vd}/${num_v} vértices sin normal)`);
        this.normales_v = nv;
    }
    /**
     * Devuelve la caja englobante de la malla, si no estaba calculada ya, la calcula ahora.
     * @returns la caja englobante de la malla
     */
    get cajaEnglobante() {
        if (this.caja == null)
            this.caja = CajaEnglobante.desdePuntos(this.posiciones);
        return this.caja;
    }
    /***
     * Normaliza y centra la malla indexada
     */
    normalizarCentrar() {
        const nombref = `MallaInd.normalizarCentrar (${this.nombre}):`;
        const caja = this.cajaEnglobante;
        const centro = caja.centro;
        if (caja.radio < 1e-3)
            throw new Error(`${nombref}: caja englobante degenerada`);
        let escala = 1.0 / caja.radio;
        for (let i = 0; i < this.posiciones.length; i++)
            this.posiciones[i] = this.posiciones[i].menos(centro).mult(escala);
    }
} // fin de la clase MallaInd
// **********************************************************************************
export class Cubo24 extends MallaInd {
    constructor() {
        super();
        this.nombre = "Cubo 24";
        this.fijarColor = new Vec3([0.6, 1.0, 1.0]);
        this.posiciones =
            [
                // Cara X-
                new Vec3([-1.0, -1.0, -1.0]), // 0
                new Vec3([-1.0, -1.0, +1.0]), // 1
                new Vec3([-1.0, +1.0, -1.0]), // 2
                new Vec3([-1.0, +1.0, +1.0]), // 3
                // Cara X+
                new Vec3([+1.0, -1.0, -1.0]), // 4
                new Vec3([+1.0, -1.0, +1.0]), // 5
                new Vec3([+1.0, +1.0, -1.0]), // 6
                new Vec3([+1.0, +1.0, +1.0]), // 7
                // Cara Y-
                new Vec3([-1.0, -1.0, -1.0]), // 8
                new Vec3([-1.0, -1.0, +1.0]), // 9
                new Vec3([+1.0, -1.0, -1.0]), // 10
                new Vec3([+1.0, -1.0, +1.0]), // 11
                // Cara Y+
                new Vec3([-1.0, +1.0, -1.0]), // 12
                new Vec3([-1.0, +1.0, +1.0]), // 13
                new Vec3([+1.0, +1.0, -1.0]), // 14
                new Vec3([+1.0, +1.0, +1.0]), // 15
                // Cara Z-
                new Vec3([-1.0, -1.0, -1.0]), // 16
                new Vec3([-1.0, +1.0, -1.0]), // 17
                new Vec3([+1.0, -1.0, -1.0]), // 18
                new Vec3([+1.0, +1.0, -1.0]), // 19
                // Cara Z+
                new Vec3([-1.0, -1.0, +1.0]), // 20
                new Vec3([-1.0, +1.0, +1.0]), // 21
                new Vec3([+1.0, -1.0, +1.0]), // 22
                new Vec3([+1.0, +1.0, +1.0]) // 23
            ];
        this.colores =
            [
                // Cara X-
                new Vec3([-0.0, -0.0, -0.0]), // 0
                new Vec3([-0.0, -0.0, +1.0]), // 1
                new Vec3([-0.0, +1.0, -1.0]), // 2
                new Vec3([-0.0, +1.0, +1.0]), // 3
                // Cara X+
                new Vec3([+1.0, -0.0, -0.0]), // 4
                new Vec3([+1.0, -0.0, +1.0]), // 5
                new Vec3([+1.0, +1.0, -1.0]), // 6
                new Vec3([+1.0, +1.0, +1.0]), // 7
                // Cara Y-
                new Vec3([-0.0, -0.0, -0.0]), // 8
                new Vec3([-0.0, -0.0, +1.0]), // 9
                new Vec3([+1.0, -0.0, -0.0]), // 10
                new Vec3([+1.0, -0.0, +1.0]), // 11
                // Cara Y+
                new Vec3([-0.0, +1.0, -0.0]), // 12
                new Vec3([-0.0, +1.0, +1.0]), // 13
                new Vec3([+1.0, +1.0, -0.0]), // 14
                new Vec3([+1.0, +1.0, +1.0]), // 15
                // Cara Z-
                new Vec3([-0.0, -0.0, -0.0]), // 16
                new Vec3([-0.0, +1.0, -0.0]), // 17
                new Vec3([+1.0, -0.0, -0.0]), // 18
                new Vec3([+1.0, +1.0, -0.0]), // 19
                // Cara Z+
                new Vec3([-0.0, -0.0, +1.0]), // 20
                new Vec3([-0.0, +1.0, +1.0]), // 21
                new Vec3([+1.0, -0.0, +1.0]), // 22
                new Vec3([+1.0, +1.0, +1.0]) // 23
            ];
        this.triangulos =
            [
                // Cara X-
                new UVec3([1, 3, 2]),
                new UVec3([0, 1, 2]),
                // Cara X+
                new UVec3([4, 6, 5]),
                new UVec3([5, 6, 7]),
                // Cara Y-
                new UVec3([8, 10, 9]),
                new UVec3([9, 10, 11]),
                // Cara Y+
                new UVec3([13, 15, 14]),
                new UVec3([12, 13, 14]),
                // Cara Z-
                new UVec3([17, 19, 18]),
                new UVec3([16, 17, 18]),
                // Cara Z+
                new UVec3([20, 22, 21]),
                new UVec3([21, 22, 23])
            ];
        this.coords_text =
            [
                // Cara X- (1)
                new Vec2([0.0, 1.0]),
                new Vec2([1.0, 1.0]),
                new Vec2([0.0, 0.0]),
                new Vec2([1.0, 0.0]),
                // Cara X+ (6)
                new Vec2([1.0, 1.0]),
                new Vec2([0.0, 1.0]),
                new Vec2([1.0, 0.0]),
                new Vec2([0.0, 0.0]),
                // Cara Y- (2)
                new Vec2([0.0, 1.0]),
                new Vec2([0.0, 0.0]),
                new Vec2([1.0, 1.0]),
                new Vec2([1.0, 0.0]),
                // Cara Y+ (5)
                new Vec2([0.0, 0.0]),
                new Vec2([0.0, 1.0]),
                new Vec2([1.0, 0.0]),
                new Vec2([1.0, 1.0]),
                // Cara Z- (3)
                new Vec2([1.0, 1.0]),
                new Vec2([1.0, 0.0]),
                new Vec2([0.0, 1.0]),
                new Vec2([0.0, 0.0]),
                // Cara Z+  (4)
                new Vec2([0.0, 1.0]),
                new Vec2([0.0, 0.0]),
                new Vec2([1.0, 1.0]),
                new Vec2([1.0, 0.0])
            ];
        this.calcularNormales();
        this.comprobar("Cubo24.constructor");
    }
}
// --------------------------------------------------------------------
// cuadrado en XZ, entre -1 y +1
export class CuadradoXZ extends MallaInd {
    /**
     * Crea una malla indexada con un cuadrado con coordenadas de textura,
     * se extiende en X y en Z
     */
    constructor() {
        super();
        this.nombre = "Cuadrado XZ";
        this.fijarColor = new Vec3([0.1, 0.5, 0.1]);
        this.posiciones =
            [
                new Vec3([-1.0, 0.0, +1.0]), // 0
                new Vec3([+1.0, 0.0, +1.0]), // 1
                new Vec3([+1.0, 0.0, -1.0]), // 2
                new Vec3([-1.0, 0.0, -1.0]), // 3
            ];
        this.coords_text =
            [
                new Vec2([0.0, 1.0]), // 0
                new Vec2([1.0, 1.0]), // 1
                new Vec2([1.0, 0.0]), // 2
                new Vec2([0.0, 0.0]), // 3
            ];
        this.triangulos =
            [
                new UVec3([0, 1, 2]),
                new UVec3([0, 2, 3])
            ];
        this.calcularNormales();
        Log(`CUADRADO XZ: long. normales == ${this.normales_v.length}`);
        this.comprobar("CuadradoXZ.constructor");
    }
}
/**
 * Cuadrado en [0..1] con una textura (la textura ya debe estar creada)
 */
export class CuadradoXYTextura extends MallaInd {
    // textura 
    //private textura : Textura
    /**
     * Crea una malla indexada con un cuadrado con coordenadas de textura,
     * se extiende en X y en Y
     *
     * @param gl
     * @param textura (Textura)
     */
    constructor(textura) {
        super();
        this.nombre = "CuadroXYTextura";
        this.fijarColor = new Vec3([0.6, 1.0, 1.0]);
        this.textura = textura;
        this.posiciones =
            [
                new Vec3([-1.0, -1.0, 0.0]), // 0
                new Vec3([+1.0, -1.0, 0.0]), // 1
                new Vec3([+1.0, +1.0, 0.0]), // 2
                new Vec3([-1.0, +1.0, 0.0]), // 3
            ];
        this.coords_text =
            [
                new Vec2([0.0, 1.0]), // 0
                new Vec2([1.0, 1.0]), // 1
                new Vec2([1.0, 0.0]), // 2
                new Vec2([0.0, 0.0]), // 3
            ];
        this.triangulos =
            [
                new UVec3([0, 1, 2]),
                new UVec3([0, 2, 3])
            ];
        this.calcularNormales();
        this.comprobar("CuadradoXYTextura.constructor");
    }
}
