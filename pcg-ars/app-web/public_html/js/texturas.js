import { Log, Assert, LeerArchivoImagen, CrearTexturaWebGL } from "./utilidades.js";
// -------------------------------------------------------------------------------------
/**
 * Clase que encapsula una imagen usada como textura y el
 * correspondiente objeto textura de WebGL
 */
export class Textura {
    url = "";
    elemento_img = null;
    texture = null;
    /**
     * Devuelve el objeto textura WebGL, si es null lo crea antes.
     * La textura debe estar ya cargada.
     */
    get texturaWebGL() {
        if (this.elemento_img == null)
            throw new Error("Textura.texturaWebGL: intento de leer objeto textura WebGL sin la imagen cargada");
        if (this.texture == null)
            this.texture = CrearTexturaWebGL(this.elemento_img);
        return this.texture;
    }
    // --------------------------------------------------------------
    // variables de instancia estáticas ('static'), no específicas de una instancia
    // Textura actualmente activada en el cauce (se usa para push/pop)
    // (si es null es que no hay textura activada)
    //private static actual : Textura | null = null 
    // pila de texturas, inicialmente vacía
    //private static pila : Array<Textura|null> = []
    // -----------------------------------------------------------------
    constructor(url) {
        const nombref = 'Textura.constructor:';
        Assert(url != "", `${nombref} la url está vacía`);
        this.url = url;
    }
    /**
     * Lee la textura desde su URL (la descarga del servidor)
     * Crea el elemento imagen con los pixels
     */
    async leer() {
        const nombref = 'Textura.leer:';
        Assert(this.elemento_img == null, `${nombref} no se puede leer una textura ya leída (this.url)`);
        this.elemento_img = await LeerArchivoImagen(this.url);
        Log(`${nombref} textura '${this.url}' cargada, dimensiones == ${this.elemento_img.width} x ${this.elemento_img.height}`);
    }
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
