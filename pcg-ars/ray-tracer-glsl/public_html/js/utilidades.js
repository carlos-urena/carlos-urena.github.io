import { Vec2, Vec3, UVec3 } from "./vec-mat.js";
import { DescrVAO } from "./vaos-vbos.js";
import { ObjetoVisualizable } from "./objeto-visu.js";
import { AplicacionWRT } from "./aplicacion-wrt.js";
// -----------------------------------------------------------------------------
const debug = true; // indica si se comprueban los asserts y se hace log
// -------------------------------------------------------------------
/**
 * Clase para el estado del ratón durante el arrastre
 */
export class EstadoRaton {
    boton_der_abajo = false; // true si el botón derecho está abajo 
    inicio_x = 0; // si botón derecho abajo, coord X de la posición del click de la 
    inicio_y = 0; // si botón derecho abajo, coord Y de la posición de 
}
// -----------------------------------------------------------------------------
/**
 * Si la condición (cond) es falsa, lanzar una excepción con el mensaje
 * (cuando debug == false, no hace nada)
 *
 * @param cond (boolean) condición a evaluar
 * @param msg  (string, opcional) mensaje de la excepción cuando se lanza
 */
export function Assert(condition, msg) {
    if (debug)
        if (condition == false) {
            let texto = "";
            if (msg === undefined)
                texto = ", pero no hay texto descriptivo del Assert.";
            else
                texto = `: ${msg}`;
            throw new Error(`la condición de un Assert es falsa${texto}`);
        }
}
// -----------------------------------------------------------------------------
/**
 * Si la variable de 'debug' es 'true', escribir el mensaje en la consola
 * (cuando debug == false, no hace nada)
 * @param msg mensaje a imprimir
 */
export function Log(msg) {
    if (debug)
        console.log(msg);
}
// -----------------------------------------------------------------------------
/**
 * Comprueba si ha habido un error de OpenGL, si lo ha habido lanza una excepción
 * (cuando debug == false, no hace nada)
 * @param gl  contexto donde se comprueba el error
 * @param msg texto de la excepción en caso de error
 */
export function ComprErrorGL(gl, msg) {
    Assert(gl.getError() == gl.NO_ERROR, msg);
}
/**
 * Construye y devuelve una promesa que se resuelve cuando hayan pasado un
 * número de milisegundos que se pasa como parámetro
 *
 * @param milliseconds - número de milisegundos
 * @returns - una promesa (vacía, de tipo void)
 */
export function Milisegundos(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
// -------------------------------------------------------------------
// -----------------------------------------------------------------------------
/**
 * Función para concatenar las sub-cadenas en una cadena literal etiquetada como 'html'
 * @param cadenas (TemplateStringsArray) secuencia de cadenas
 * @returns (string) cadenas concatenadas
 */
export function html(cadenas) {
    let salida = "";
    for (const s of cadenas)
        salida = salida + " " + s;
    return salida;
}
// -----------------------------------------------------------------------------
/**
 * Convierte un flotante 'v' (entre 0 y 1) en una cadena con el valor de 'v'
 * en hexadecimal y con exactamente dos digitos
 * @param v
 */
export function Hex2(v) {
    Assert(0.0 <= v && v <= 1.0, "Hex2: el valor no está entre 0 y 1");
    const k = Math.round(v * 255.0);
    const res = k.toString(16);
    return res.length == 2 ? res : `0${res}`;
}
// -----------------------------------------------------------------------------
/**
 * Devuelve un número entre 0 y 1 a partir de una cadena con dos dígitos hexadecimales
 * @param h2 (string) cadena con dos caracteres codificando un dígito hexadecimal, analizable con 'parseInt'
 * @return (number) número entre 0 y 1
 */
export function NumbDesdeHex2(h2) {
    const nombref = `NumbDesdeHex2:`;
    Assert(h2.length == 2, `${nombref} la cadena ${h2} no tiene exactamente dos caracteres`);
    const n = parseInt(h2, 16);
    Assert(!Number.isNaN(n), `${nombref} La cadena '${h2}' no puede interpretarse como un entero en hexadecimal`);
    Assert(n >= 0, `${nombref} la cadena '${h2}' codifica un número negativo`);
    return n / 255.0;
}
// -----------------------------------------------------------------------------
/**
 * Leer un archivo en un servidor, esperar a que se cargue entero y devolver el
 * contenido como una promesa con una cadena de texto dentro
 *
 * @param url_arch cadena con el URL del archivo
 * @returns (string) cadena codificada en UTF8
 */
export async function LeerArchivoTexto(url_arch) {
    const nombref = 'LeerArchivoTexto:';
    // obtener una promesa ('Response') que se resuelve cuando se lee un archivo de la red o el disco.
    let response = await fetch(url_arch);
    // comprobar respuesta (la promesa devuelta por fetch no se rechaza por errores de http como 404)
    if (!response.ok)
        throw new Error(`${nombref} imposible leer archivo '${url_arch}'`);
    // .text devuelve una promesa que se resuelve con una representación UTF-8 del objeto recuperado con el 'fetch'
    let texto = await response.text();
    return texto;
}
// -------------------------------------------------------------------------------------
/**
 * Leer una imagen desde una URL y devolver un elemento imagen, ver:
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * (sección: Supplying your own Request Object)
 *
 * @param url_string (string) URL del archivo de imagen
 * @returns (HTMLImageElement) elemento imagen
 */
export async function LeerArchivoImagen(url_string) {
    const nombref = 'LeerArchivoImagen:';
    // obtener una promesa ('Response') que se resuelve cuando se lee un archivo de la red o el disco.
    let response = await fetch(url_string);
    // comprobar respuesta (la promesa devuelta por fetch no se rechaza por errores de http como 404)
    if (!response.ok)
        throw new Error(`${nombref} imposible leer archivo de imagen '${url_string}'`);
    // obtener un objeto con bytes (un "Blob") que contiene la imagen
    let blob = await response.blob();
    // crear un elemento imagen vacío
    let elemento_img = document.createElement("img");
    try {
        // creando una URL "virtual" que apunta al blob, y asignarla a .src 
        // (pone la imagen a cargar)
        elemento_img.src = URL.createObjectURL(blob);
        // esperar a que la imagen se decodifique
        await elemento_img.decode();
    }
    catch (err) {
        throw new Error(`${nombref} error al decodificar archivo de imagen '${url_string}', mensaje: \n ${err.message}`);
    }
    // ya está 
    return elemento_img;
}
// -----------------------------------------------------------------------------
export class Ejes extends DescrVAO {
    constructor() {
        const numero_atributos_vao = 2;
        const lon = 15.0;
        super({
            posiciones: [
                -0.5 * lon, 0.0, 0.0, lon, 0.0, 0.0,
                0.0, -0.5 * lon, 0.0, 0.0, lon, 0.0,
                0.0, 0.0, -0.5 * lon, 0.0, 0.0, lon
            ],
            colores: [
                1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 1.0, 0.0, 0.0, 1.0
            ]
        });
        this.nombre = 'Ejes';
    }
}
// -----------------------------------------------------------------------------
export class VAOCuadrado extends DescrVAO {
    constructor() {
        const numero_atributos_vao = 1;
        super({
            posiciones: [
                -1.0, -1.0, 0.0,
                +1.0, -1.0, 0.0,
                +1.0, +1.0, 0.0,
                -1.0, +1.0, 0.0
            ],
            indices: [
                0, 1, 2, 0, 2, 3
            ]
        });
        this.nombre = 'Cuadrado';
    }
}
export class Cuadrado extends ObjetoVisualizable {
    dvao = null;
    /**
      * Crea e inicializar el VAO (si no lo estaba) y visualizar la malla
      */
    visualizar() {
        const nombref = `MallaInd.visualizarGL (${this.leerNombre}):`;
        let gl = AplicacionWRT.instancia.gl;
        let cauce = AplicacionWRT.instancia.cauce;
        if (this.dvao == null)
            this.dvao = new VAOCuadrado();
        this.dvao.draw(gl.TRIANGLES);
    }
}
// -----------------------------------------------------------------------------
/**
 * Una rejilla de lineas, en el plano Z=0, entre 0 y 1
 */
export class RejillaXY extends ObjetoVisualizable {
    dvao;
    //private gl   : WebGLRenderingContext | WebGL2RenderingContext
    constructor() {
        super();
        let gl = AplicacionWRT.instancia.gl;
        this.fijarNombre = "RejillaXY";
        const nx = 8, ny = 8;
        const sx = 1.0 / nx, sy = 1.0 / ny;
        let arr_verts = new Array;
        for (let ix = 0; ix < nx; ix++)
            arr_verts.push(ix * sx, 0.0, 0.0, ix * sx, 1.0, 0.0);
        for (let iy = 0; iy < nx; iy++)
            arr_verts.push(0.0, iy * sy, 0.0, 1.0, iy * sy, 0.0);
        this.dvao = new DescrVAO({ posiciones: arr_verts });
    }
    visualizar() {
        let gl = AplicacionWRT.instancia.gl;
        this.dvao.draw(gl.LINES);
    }
    visualizarAristas() {
    }
}
// -----------------------------------------------------------------------------
export class TrianguloTest extends ObjetoVisualizable {
    dvao;
    //private gl   : WebGLRenderingContext | WebGL2RenderingContext
    constructor() {
        super();
        this.fijarNombre = "Triángulo test";
        const num_atribs = 3;
        this.dvao = new DescrVAO({
            posiciones: [
                -0.4, -0.4, 0.0,
                +0.4, -0.4, 0.0,
                +0.0, +0.4, 0.0,
            ],
            colores: [
                1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 0.0, 1.0,
            ],
            normales: [
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
            ]
        });
    }
    visualizar() {
        let gl = AplicacionWRT.instancia.gl;
        this.dvao.draw(gl.TRIANGLES);
    }
    visualizarAristas() {
    }
}
// -----------------------------------------------------------------------------
export class TrianguloIndexadoTest extends ObjetoVisualizable {
    dvao;
    //private gl   : WebGLRenderingContext | WebGL2RenderingContext
    constructor() {
        super();
        let gl = AplicacionWRT.instancia.gl;
        this.fijarNombre = "Triángulo ind.";
        const num_atribs = 3;
        this.dvao = new DescrVAO({
            posiciones: [
                -0.4, -0.4, 0.0,
                +0.4, -0.4, 0.0,
                +0.0, +0.4, 0.0,
            ],
            indices: [
                0, 1, 2
            ],
            colores: [
                1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 0.0, 1.0,
            ],
            normales: [
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
            ]
        });
    }
    visualizar() {
        let gl = AplicacionWRT.instancia.gl;
        this.dvao.draw(gl.TRIANGLES);
    }
    visualizarAristas() {
    }
}
// -----------------------------------------------------------------------------
/**
 * Convierte un array de Vec3 en un Float32Array,
 * @param v
 */
export function CrearFloat32ArrayV4(v) {
    let array = new Float32Array(v.length * 4);
    for (let i = 0; i < v.length; i++) {
        array[4 * i + 0] = v[i].x;
        array[4 * i + 1] = v[i].y;
        array[4 * i + 2] = v[i].z;
        array[4 * i + 3] = v[i].w;
    }
    return array;
}
// -----------------------------------------------------------------------------
/**
 * Convierte un array genérico (de números, o tuplas de 3 números) (de tipo TablaFloatV3)
 * en un 'Float32Array' de valores 'float' de 4 bytes cada uno.
 *
 * - Si 'tabla' es de tipo 'Float32Array', devuelve 'tabla', en otro caso hace copia de los datos
 * - La tabla resultado tiene un número de floats múltiplo de 2 siempre
 *
 * @param tabla datos de entrada, puede ser 'number[]' 'Vec3[]' o 'Float32Array'
 */
export function CrearFloat32ArrayV3(tabla) {
    const nombref = "CrearFloat32ArrayV2:";
    const lonvec = 3;
    if (tabla instanceof Float32Array) {
        Assert(tabla.length % lonvec == 0, `${nombref} la tabla no tiene longitud múltiplo de ${lonvec}`);
        return tabla;
    }
    else if (tabla instanceof Array) {
        if (tabla.length == 0)
            throw new Error(`${nombref} la tabla está vacía`);
        if (typeof tabla[0] == "number") {
            Assert(tabla.length % lonvec == 0, `${nombref} la tabla no tiene longitud múltiplo de ${lonvec}`);
            let array = new Float32Array(tabla.length);
            for (let i = 0; i < tabla.length; i++) {
                let v_i = tabla[i];
                if (typeof v_i != "number")
                    throw new Error(`${nombref} la tabla de valores 'number' tiene una entrada de otro tipo`);
                array[i] = v_i;
            }
            return array;
        }
        else if (tabla[0] instanceof Vec3) {
            let array = new Float32Array(tabla.length * lonvec);
            for (let i = 0; i < tabla.length; i++) {
                let v_i = tabla[i];
                if (!(v_i instanceof Vec3))
                    throw new Error(`${nombref} la tabla de vectores 'Vec2' tiene una entrada de otro tipo`);
                for (let j = 0; j < lonvec; j++)
                    array[lonvec * i + j] = v_i[j];
            }
            return array;
        }
        else
            throw new Error(`${nombref} la tabla es un 'Array' pero no de 'number' ni 'Vec3'`);
    }
    else
        throw new Error(`${nombref} la tabla no es un 'Array' ni un 'Float32Array'`);
}
// -----------------------------------------------------------------------------
/**
 * Convierte un array genérico (de números, o tuplas de 2 números) (de tipo TablaFloatV3)
 * en un 'Float32Array' de valores 'float' de 4 bytes cada uno.
 *
 * - Si 'tabla' es de tipo 'Float32Array', devuelve 'tabla', en otro caso hace copia de los datos
 * - La tabla resultado tiene un número de floats múltiplo de 2 siempre
 *
 * @param tabla datos de entrada, puede ser 'number[]' 'Vec3[]' o 'Float32Array'
 */
export function CrearFloat32ArrayV2(tabla) {
    const nombref = "CrearFloat32ArrayV2:";
    const lonvec = 2;
    if (tabla instanceof Float32Array) {
        Assert(tabla.length % lonvec == 0, `${nombref} la tabla no tiene longitud múltiplo de ${lonvec}`);
        return tabla;
    }
    else if (tabla instanceof Array) {
        if (tabla.length == 0)
            throw new Error(`${nombref} la tabla está vacía`);
        if (typeof tabla[0] == "number") {
            Assert(tabla.length % lonvec == 0, `${nombref} la tabla no tiene longitud múltiplo de ${lonvec}`);
            let array = new Float32Array(tabla.length);
            for (let i = 0; i < tabla.length; i++) {
                let v_i = tabla[i];
                if (typeof v_i != "number")
                    throw new Error(`${nombref} la tabla de valores 'number' tiene una entrada de otro tipo`);
                array[i] = v_i;
            }
            return array;
        }
        else if (tabla[0] instanceof Vec2) {
            let array = new Float32Array(tabla.length * lonvec);
            for (let i = 0; i < tabla.length; i++) {
                let v_i = tabla[i];
                if (!(v_i instanceof Vec2))
                    throw new Error(`${nombref} la tabla de vectores 'Vec2' tiene una entrada de otro tipo`);
                for (let j = 0; j < lonvec; j++)
                    array[lonvec * i + j] = v_i[j];
            }
            return array;
        }
        else
            throw new Error(`${nombref} la tabla es un 'Array' pero no de 'number' ni 'Vec3'`);
    }
    else
        throw new Error(`${nombref} la tabla no es un 'Array' ni un 'Float32Array'`);
}
// -----------------------------------------------------------------------------
/**
 * Convierte un array de datos unsigned (tipo TablaUnsigned) en un Uint32Array,
 * @param v
 */
export function CrearUint32Array(tabla) {
    const nombref = 'CrearUint32Array:';
    if (tabla instanceof Uint32Array)
        return tabla;
    else if (tabla instanceof Uint8Array || tabla instanceof Uint16Array)
        return new Uint32Array(tabla);
    else if (tabla instanceof Array) {
        if (tabla.length == 0)
            throw new Error(`${nombref} la tabla está vacía`);
        if (typeof tabla[0] == "number") {
            let array = new Uint32Array(tabla.length);
            for (let i = 0; i < tabla.length; i++) {
                let v_i = tabla[i];
                if (typeof v_i != "number")
                    throw new Error(`${nombref} la tabla de valores 'number' tiene una entrada de otro tipo`);
                array[i] = v_i;
            }
            return array;
        }
        else if (tabla[0] instanceof UVec3) {
            let array = new Uint32Array(tabla.length * 3);
            for (let i = 0; i < tabla.length; i++) {
                let v_i = tabla[i];
                if (!(v_i instanceof UVec3))
                    throw new Error(`${nombref} la tabla de vectores 'UVec3' tiene una entrada de otro tipo`);
                for (let j = 0; j < 3; j++)
                    array[3 * i + j] = v_i[j];
            }
            return array;
        }
        else
            throw new Error(`${nombref} la tabla es un 'Array' pero no de 'number' ni 'UVec3'`);
    }
    else
        throw new Error(`${nombref} la tabla no es un 'Array' ni un 'Float32Array'`);
}
// -----------------------------------------------------------------------------
/**
 *  devuelve true si el argumento es una potencia de 2
 *  obetnido de: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
 *    @param   (number) value -- value to test
 *    @returns (Boolean)         -- true iif value is 2^n for some integer 'n', false otherwise
 */
export function esPotenciaDe2(value) {
    return (value & (value - 1)) == 0;
}
// -----------------------------------------------------------------------------
// adaptado a typescript desde:
// https://stackoverflow.com/questions/1013239/can-i-get-the-name-of-the-currently-running-function-in-javascript
/**
 *
 * @returns
 */
export function getFunctionCallerName() {
    // gets the text between whitespace for second part of stacktrace
    let err = new Error();
    let match = err.stack?.match(/at (\S+)/g);
    return match ? match[1].slice(3) : "nombre de función no se sabe";
}
