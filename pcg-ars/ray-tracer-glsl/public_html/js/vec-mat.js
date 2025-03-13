import { Assert, Hex2, NumbDesdeHex2 } from "./utilidades.js";
function N2S(x) {
    return `${x >= 0 ? '+' : ''}${x.toFixed(3)}`;
}
// ---------------------------------------------------------------------------------------
/**
 * Vectores de 2 números reales en simple precision
 */
export class Vec2 extends Float32Array {
    constructor(arr) {
        Assert(arr.length == 2, "Vec2.constructor - se deben dar 16 valores reales");
        super(arr);
    }
    get s() { return this[0]; }
    get t() { return this[1]; }
}
// ---------------------------------------------------------------------------------------
/**
 * Vectores de 3 números reales en simple precision
 */
export class Vec3 extends Float32Array {
    constructor(arr) {
        Assert(arr.length == 3, "Vec3.constructor - se deben dar 16 valores reales");
        super(arr);
    }
    get x() { return this[0]; }
    get y() { return this[1]; }
    get z() { return this[2]; }
    get r() { return this[0]; }
    get g() { return this[1]; }
    get b() { return this[2]; }
    /**
     * Convierte un Vec3 codificando un color con valores entre 0 y 1 en una cadena con porcentajes
     * @returns (string)
     */
    toStringPercent() {
        const opts = { maximumFractionDigits: 0 };
        const sr = (100.0 * this[0]).toLocaleString("en", opts);
        const sg = (100.0 * this[1]).toLocaleString("en", opts);
        const sb = (100.0 * this[2]).toLocaleString("en", opts);
        return `( ${sr}%, ${sg}%, ${sb}% )`;
    }
    /**
     * Calcula la suma de este vector y otro
     * @param otro (Vec3) el otro vector
     * @returns (Vec3) vector suma
     */
    mas(otro) {
        return new Vec3([this.x + otro.x, this.y + otro.y, this.z + otro.z]);
    }
    /**
     * Devuelve una cadena con un color (con componentes entre 0 y 1)
     * codificado en hexadecimal con formato CSS (cadena de # seguido de 6 dígitos).
     * Produce excepción si las componentes no están entre 0 y 1.
     * @returns (string) representación del color en la forma '#rrggbb'
     */
    hexColorStr() {
        return `#${Hex2(this.r)}${Hex2(this.g)}${Hex2(this.b)}`;
    }
    /**
     * Calcula la resta de este vector y otro
     * @param otro (Vec3) el otro vector
     * @returns (Vec3) vector resta
     */
    menos(otro) {
        return new Vec3([this.x - otro.x, this.y - otro.y, this.z - otro.z]);
    }
    /**
     * Calcula el producto de este vector y un valor escalar (real)
     * @param a (number) valor a multiplicar
     * @returns (Vec3) vector multiplicado
     */
    mult(a) {
        return new Vec3([a * this.x, a * this.y, a * this.z]);
    }
    /**
     * Divide cada componentes de este vector por un valor escalar (real)
     * @param a (number) valor a dividir (>0)
     * @returns (Vec3) vector multiplicado
     */
    div(a) {
        return new Vec3([this.x / a, this.y / a, this.z / a]);
    }
    /**
     * Calcula la longitud de un vector
     * @returns (number) longitud de este vector
     */
    get longitud() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    /**
     * Produce una copia normalizada de este vector
     * @returns (Vec3) vector normmalizado
     */
    get normalizado() {
        const l = this.longitud;
        return new Vec3([this.x / l, this.y / l, this.z / l]);
    }
    /**
     * Calcula el producto escalar (dot product) entre este vector y otro
     * @param otro (Vec3) el otro vector
     * @returns (number) producto escalar
     */
    dot(otro) {
        return this.x * otro.x + this.y * otro.y + this.z * otro.z;
    }
    /**
     * Calcula el producto vectorial (cross product) entre este vector y otro
     * @param otro (Vec3) el otro vector
     * @returns (Vec3) producto vectorial
     */
    cross(otro) {
        return new Vec3([
            this.y * otro.z - this.z * otro.y, // x = y1*z2 - z1*y2
            this.z * otro.x - this.x * otro.z, // y = z1*x2 - x1*z2
            this.x * otro.y - this.y * otro.x // z = x1*y2 - x2*y1
        ]);
    }
}
// ------------------------------------------------------------------------------------
/**
 * Convierte una cadena con un color codificado en hexadecimal en un Vec3 con valores entre 0 y 1
 * @param s (string) cadena de entrada, de 7 caracteres comenzando en '#'
 * @return (Vec3) vector codificando un color con componentes entre 0 y 1.
 */
export function Vec3DesdeColorHex(s) {
    const nombref = 'ColorStrAVec3';
    Assert(s.length == 7 && s[0] == '#', `${nombref} la cadena '${s}' no tiene formato de color en hexadecimal `);
    const r = NumbDesdeHex2(`${s[1]}${s[2]}`);
    const g = NumbDesdeHex2(`${s[3]}${s[4]}`);
    const b = NumbDesdeHex2(`${s[5]}${s[6]}`);
    return new Vec3([r, g, b]);
}
// ------------------------------------------------------------------------------------
/**
 * Vectores de 4 números reales en simple precision
 */
export class Vec4 extends Float32Array {
    constructor(arr) {
        Assert(arr.length == 4, "Vec4.constructor - se deben dar 16 valores reales");
        super(arr);
    }
    get x() { return this[0]; }
    get y() { return this[1]; }
    get z() { return this[2]; }
    get w() { return this[3]; }
    get r() { return this[0]; }
    get g() { return this[1]; }
    get b() { return this[2]; }
    get a() { return this[3]; }
    /**
     * Calcula la longitud de un vector
     * @returns (number) longitud de este vector
     */
    get longitud() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}
// ------------------------------------------------------------------------------------
/**
 * Vectores de 3 números enteros sin signo de 4 bytes cada uno.
 */
export class UVec3 extends Uint32Array {
    constructor(arr) {
        Assert(arr.length == 3, "UVec3.constructor - se deben dar exactamente 3 valores enteros sin signo");
        super(arr);
    }
}
// ----------------------------------------------------------------------------------
/**
 * Para una matriz 4x4 dispuesta por filas, devuelve el índice del elemento en una
 * fila y columna determinadas.
 *
 * @param f índice de fila
 * @param c índice de columna
 * @returns  índice de la celda
 */
function ind(f, c) {
    Assert(0 <= f && f < 4, `Mat4.indice: fila (${f}) fuera de rango`);
    Assert(0 <= c && c < 4, `Mat4.indice: columna (${c}) fuera de rango`);
    return 4 * f + c;
}
/**
 * Matriz de 4x4 valores reales (number), se guarda por filas como un 'Float32Array'
 *                                                  ---------
 */
export class Mat4 extends Float32Array {
    constructor(arr) {
        Assert(arr.length == 16, "Mat4.constructor - se deben dar 16 valores reales");
        super(arr);
    }
    /**
     * Lee un valor en una fila y una columna (ambas entre 0 y 3)
     * @param f índice de fila
     * @param c índice de columna
     * @returns  valor en la celda
     */
    val(f, c) {
        return this[ind(f, c)];
    }
    get _00() { return this.val(0, 0); }
    get _01() { return this.val(0, 1); }
    get _02() { return this.val(0, 2); }
    get _03() { return this.val(0, 3); }
    get _10() { return this.val(1, 0); }
    get _11() { return this.val(1, 1); }
    get _12() { return this.val(1, 2); }
    get _13() { return this.val(1, 3); }
    get _20() { return this.val(2, 0); }
    get _21() { return this.val(2, 1); }
    get _22() { return this.val(2, 2); }
    get _23() { return this.val(2, 3); }
    get _30() { return this.val(3, 0); }
    get _31() { return this.val(3, 1); }
    get _32() { return this.val(3, 2); }
    get _33() { return this.val(3, 3); }
    /**
      * Aplica esta matriz a un vector de 3 entradas y devolver el vector 3 resultado
      *
      * @param   v  (Vec3) vector original
      * @param   w  (number) coordenada W (suele ser 0 o 1, pero no necesariamente)
      * @returns (Vec3) vector resultado
      */
    aplica(v, w) {
        let res = new Vec3([0.0, 0.0, 0.0]);
        for (let fila = 0; fila < 3; fila++)
            for (let colu = 0; colu < 4; colu++)
                res[fila] += this.val(fila, colu) * ((colu < 3) ? v[colu] : w);
        return res;
    }
    /**
      * Aplica esta matriz a un vector de 4 entradas y devolver el vector 4 resultado
      *
      * @param   v  (Vec4) vector original
      * @returns (Vec4) vector resultado
      */
    aplica_v4(v) {
        let res = new Vec4([0.0, 0.0, 0.0, 0.0]);
        for (let fila = 0; fila < 3; fila++)
            for (let colu = 0; colu < 4; colu++)
                res[fila] += this.val(fila, colu) * v[colu];
        return res;
    }
    /**
     * Compone esta matriz con otra y devuelve la matriz resultado
     * (la otra matriz se compone por la derecha)
     * @param otra (Mat4) la otra matriz
     * @returns (Mat4) la matriz resultado
     */
    componer(otra) {
        let res = CMat4.cero();
        for (let fila = 0; fila < 4; fila++)
            for (let colu = 0; colu < 4; colu++)
                for (let k = 0; k < 4; k++)
                    res[ind(fila, colu)] += this.val(fila, k) * otra.val(k, colu);
        // ==> res(fila,colu) += this(fila,k) * m(k,colu)
        return res;
    }
    /**
     * calcula el determinante de la submatriz 3x3
     * @returns determinante
     */
    determinante3x3() {
        return +this._00 * this._11 * this._22
            + this._01 * this._12 * this._20
            + this._02 * this._10 * this._21
            - this._00 * this._12 * this._21
            - this._01 * this._10 * this._22
            - this._02 * this._11 * this._20;
    }
    // calcula la matriz transpuesta de la submatriz 3x3, ignorando desplazamientos
    traspuesta3x3() {
        let tras = CMat4.ident();
        for (let f = 0; f < 3; f++)
            for (let c = 0; c < 3; c++) {
                tras[ind(f, c)] = this.val(c, f);
            }
        return tras;
    }
    /**
     * Calcula la matriz inversa de una matriz 4x4 afín, es decir, en la cual la
     * última fila es 0 0 0 1. El determinante no puede ser 0. Solo considera la matriz 3x3 sin los términos de traslación.
     * @returns matriz 4x4 inversa
     */
    inversa3x3() {
        const nombref = "Mat4.inversa";
        Assert(this._30 == 0.0 && this._31 == 0 && this._32 == 0.0 && this._33 == 1.0, `${nombref} la matriz no es afín`);
        // 1. calcular matriz de cofactores ('cofac')
        let cofac = CMat4.ident();
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++) {
                const i1 = (i + 1) % 3, i2 = (i + 2) % 3;
                const j1 = (j + 1) % 3, j2 = (j + 2) % 3;
                cofac[ind(i, j)] = this.val(i1, j1) * this.val(i2, j2) - this.val(i1, j2) * this.val(i2, j1);
            }
        // 2. calcular determinante (det) (usando la primera fila de 'm' y de 'cofac')
        const det = this._00 * cofac._00 + this._01 * cofac._01 + this._02 * cofac._02;
        Assert(1e-6 < Math.abs(det), `${nombref} el determinante es cero o casi cero (matriz singular)`);
        // 3. calcular la matriz inversa de la sub-matrix 3x3 (inv3x3) como la
        // adjunta (transpuesta de los cofactores), dividida por el determinante:
        let inv3x3 = CMat4.ident();
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                inv3x3[ind(i, j)] = cofac.val(j, i) / det;
        // ya está
        return inv3x3;
    }
    /**
     * Calcula la matriz inversa de una matriz 4x4 afín, es decir, en la cual la
     * última fila es 0 0 0 1. El determinante no puede ser 0.
     * @returns matriz 4x4 inversa
     */
    inversa() {
        const nombref = "Mat4.inversa";
        Assert(this._30 == 0.0 && this._31 == 0 && this._32 == 0.0 && this._33 == 1.0, `${nombref} la matriz no es afín`);
        let inv3x3 = this.inversa3x3();
        // 4. calcular la matriz de traslación inversa
        let trasl_inv = CMat4.ident();
        for (let i = 0; i < 3; i++)
            trasl_inv[ind(i, 3)] = -this.val(i, 3);
        // 5. calcular (y devolver) la inversa completa
        // (traslación inversa seguida de la inversa 3x3)
        return inv3x3.componer(trasl_inv);
    }
    /**
     * Convierte una matriz en una cadena (incluye varias líneas)
     * @returns (string) cadena
     */
    toString() {
        let str = '\n';
        const n = 3;
        for (let f = 0; f < 4; f++) {
            str = str + ` | ${N2S(this.val(f, 0))}, ${N2S(this.val(f, 1))}, ${N2S(this.val(f, 2))}, ${N2S(this.val(f, 3))} |\n`;
        }
        return str;
    }
}
// ----------------------------------------------------------------------------------
/**
 * namespace que incluye las funciones que crean matrices 4x4
 */
export var CMat4;
(function (CMat4) {
    /**
     * Produce la matriz con todas las entradas a cero
     * @return (Mat4) matriz con entradas a cero
     */
    function cero() {
        return new Mat4([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);
    }
    CMat4.cero = cero;
    /**
     * Produce la matriz identidad
     * @return (Mat4) matriz identidad 4x4
     */
    function ident() {
        return new Mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    CMat4.ident = ident;
    // ------------------------------------------------------------------------------------------------
    /**
     * Construye una matriz 4x4 de traslación a partir de un vector de traslación
     *
     * @param v (Vec3) vector de traslación
     * @return (Mat4) matriz de traslación
     */
    function traslacion(v) {
        return new Mat4([1, 0, 0, v.x,
            0, 1, 0, v.y,
            0, 0, 1, v.z,
            0, 0, 0, 1
        ]);
    }
    CMat4.traslacion = traslacion;
    // ------------------------------------------------------------------------------------------------
    /**
     * Construye una matriz 4x4 de escalado a partir de un vector con los factores de escala
     *
     * @param v (Vec3) vector con los factores de escala en X, Y y Z
     * @return (Mat4) matriz de escalado
     */
    function escalado(v) {
        return new Mat4([v.x, 0, 0, 0,
            0, v.y, 0, 0,
            0, 0, v.z, 0,
            0, 0, 0, 1
        ]);
    }
    CMat4.escalado = escalado;
    /**
     * Construye una matriz de rotación entorno al eje X, dado un ángulo (en grados)
     * @param angulo_grad (number) ángulo en grados
     * @return (Mat4) matriz de rotación entorno a X
     */
    function rotacionXgrad(angulo_grad) {
        const ar = (angulo_grad * Math.PI) / 180.0, c = Math.cos(ar), s = Math.sin(ar);
        return new Mat4([1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        ]);
    }
    CMat4.rotacionXgrad = rotacionXgrad;
    // ------------------------------------------------------------------------------------------------
    /**
     * Construye una matriz de rotación entorno al eje Y, dado un ángulo (en grados)
     * @param angulo_grad (number) ángulo en grados
     * @return (Mat4) matriz de rotación entorno a Y
     */
    function rotacionYgrad(angulo_grad) {
        const ar = (angulo_grad * Math.PI) / 180.0, c = Math.cos(ar), s = Math.sin(ar);
        return new Mat4([c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        ]);
    }
    CMat4.rotacionYgrad = rotacionYgrad;
    // ------------------------------------------------------------------------------------------------
    /**
     * Construye una matriz de rotación entorno al eje Z, dado un ángulo (en grados)
     * @param angulo_grad (number) ángulo en grados
     * @return (Mat4) matriz de rotación entorno a Z
     */
    function rotacionZgrad(angulo_grad) {
        const ar = (angulo_grad * Math.PI) / 180.0, c = Math.cos(ar), s = Math.sin(ar);
        return new Mat4([c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    CMat4.rotacionZgrad = rotacionZgrad;
    // ------------------------------------------------------------------------------------------------
    /**
     * Construye una matriz de proyección perspectiva a partir de los límites del view-frustum
     * (según: http://docs.gl/gl2/glFrustum)
     *
     * @param l (number) limite izquierdo del frustum en X (en el plano z=near)
     * @param r (number) limite derecho del frustum en X (en el plano z=near)
     * @param b (number) limite inferior del frustum en Y (en el plano z=near)
     * @param t (number) limite superior del frustum en Y (en el plano z=near)
     * @param n (number) distancia en Z entre observador y plano de recorte delantero (>0)
     * @param f (number) distancia en Z entre observador y plano de recorte trasero (>n)
     * @returns {Mat4}   (number) matriz de proyeccion perspectiva
     */
    function frustum(l, r, b, t, n, f) {
        const nombref = "CMat4.frustum";
        const eps = 1e-6;
        Assert(eps < n && eps < f, `${nombref} 'n' o 'f' son casi cero o negativos`);
        Assert(n < f, `${nombref} 'n' no es menor que 'f'`);
        Assert(Math.abs(r - l) > eps && Math.abs(t - b) > eps && Math.abs(n - f) > eps, `${nombref} parámetros incorrectos (el tamaño en X, Y o Z es casi cero)`);
        const a00 = (2.0 * n) / (r - l), a02 = (r + l) / (r - l), a11 = (2.0 * n) / (t - b), a12 = (t + b) / (t - b), a22 = -(n + f) / (f - n), a23 = -(2.0 * f * n) / (f - n);
        return new Mat4([a00, 0.0, a02, 0.0,
            0.0, a11, a12, 0.0,
            0.0, 0.0, a22, a23,
            0.0, 0.0, -1.0, 0.0
        ]);
    }
    CMat4.frustum = frustum;
    // ------------------------------------------------------------------------------------------------
    /**
     * Construye una matriz de proyección perspectiva a partir de un conjunto alternativo de parámetros
     * (según: https://registry.khronos.org/OpenGL-Refpages/gl2.1/xhtml/gluPerspective.xml)
     *
     * @param fovy_grad (number) amplitud de campo en vertical (un ángulo en grados, entre 0 y 180.0, sin incluir)
     * @param aspect_xy (number) relación de aspecto (ancho del viewport dividido por el alto)
     * @param near      (number) distancia en Z entre observador y plano de recorte delantero (>0)
     * @param far       (number) distancia en Z entre observador y plano de recorte trasero (>n)
     * @returns
     */
    function perspective(fovy_grad, aspect_xy, near, far) {
        const fovy_rad = (fovy_grad * Math.PI) / 180.0, h = near * Math.tan(fovy_rad / 2.0), w = h * aspect_xy;
        return frustum(-w, +w, -h, +h, near, far);
    }
    CMat4.perspective = perspective;
})(CMat4 || (CMat4 = {}));
