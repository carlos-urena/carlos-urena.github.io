import { Log, Assert, esPotenciaDe2, ComprErrorGL, LeerArchivoImagen } from "./utilidades.js";
import { AplicacionWRT } from "./aplicacion-wrt.js";
// -------------------------------------------------------------------------------------
/**
 * Clase que encapsula una imagen usada como textura y el
 * correspondiente objeto textura de WebGL
 */
export class Textura {
    url = "";
    elemento_img = null;
    texture = null;
    // --------------------------------------------------------------
    // variables de instancia estáticas ('static'), no específicas de una instancia
    // Textura actualmente activada en el cauce (se usa para push/pop)
    // (si es null es que no hay textura activada)
    static actual = null;
    // pila de texturas, inicialmente vacía
    static pila = [];
    // -----------------------------------------------------------------
    constructor(url) {
        const nombref = 'Textura.constructor:';
        Assert(url != "", `${nombref} la url está vacía`);
        this.url = url;
    }
    async leer() {
        const nombref = 'Textura.leer:';
        Assert(this.elemento_img == null, `${nombref} no se puede leer una textura ya leída (this.url)`);
        this.elemento_img = await LeerArchivoImagen(this.url);
        Log(`${nombref} textura '${this.url}' cargada, dimensiones == ${this.elemento_img.width} x ${this.elemento_img.height}`);
    }
    // -----------------------------------------------------------------------------------------
    activar() {
        const nombref = 'Textura.activar:';
        let gl = AplicacionWRT.instancia.gl;
        let cauce = AplicacionWRT.instancia.cauce;
        ComprErrorGL(gl, `${nombref} al inicio`);
        if (this.texture == null)
            this.crearTexturaWebGL();
        Textura.actual = this;
        cauce.fijarEvalText(true, this.texture);
        ComprErrorGL(gl, `${nombref} al final`);
    }
    // -----------------------------------------------------------------------------------------
    crearTexturaWebGL() {
        const nombref = 'Textura.crearTexturaWebGL';
        if (this.elemento_img == null)
            throw Error(`${nombref} no se puede crear el objeto textura WebGL si la imagen no está cargada`);
        Assert(this.texture == null, `${nombref} no se puede crear la textura dos veces`);
        let img = this.elemento_img;
        let gl = AplicacionWRT.instancia.gl;
        ComprErrorGL(gl, `${nombref} al inicio`);
        const level = 0, internalFmt = gl.RGB, srcFmt = gl.RGB, //// ---> como saberlo ??
        srcType = gl.UNSIGNED_BYTE;
        // create, bind and fill the texture
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFmt, srcFmt, srcType, img);
        // Generate MIPMAPS ....
        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (esPotenciaDe2(img.width) && esPotenciaDe2(img.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
            Log(`${nombref} generado mip-map.`);
        }
        else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            Log(`${nombref} mip-map no generado.`);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        ComprErrorGL(gl, `${nombref} al final`);
    }
    // --------------------------------------------------------------------
    /**
     * Crea un objeto textura y espera a leerlo desde el servidor
     *
     * @param url (string) URL del archivo de textura en el servidor
     * @returns (Textura) textura leída
     */
    static async crear(url) {
        const nombref = 'LeerTextura:';
        let textura = new Textura(url);
        await textura.leer();
        return textura;
    }
}
// -----------------------------------------------------------------------------------------
