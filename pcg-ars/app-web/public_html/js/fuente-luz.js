import { Assert } from "./utilidades.js";
import { Vec3, Vec4 } from "./vec-mat.js";
import { AplicacionWeb } from "./aplicacion-web.js";
/**
 * Clase para una fuente de luz, incluye su color y su posición/dirección
 * (por ahoras son únicamente fuentes de luz direccionales)
 * (las fuentes de luz no se activan de forma individual, sino como parte de una colección)
 */
export class FuenteLuz {
    pos_dir_wc_act; // posicion o dirección de la fuente en coordenadas de mundo
    color_act; // color o intensidad (r,g,b >0 , pero no necesariamente acotado por arriba)
    long_act = 45.0; // longitud actual en grados
    lat_act = 45.0; // latitud actual en grados
    set color(nuevo_color) {
        this.color_act = nuevo_color;
    }
    get color() {
        return this.color_act;
    }
    set long(nueva_longitud) {
        this.long_act = nueva_longitud;
        this.pos_dir_wc_act = this.calcular_pos_dir_wc();
    }
    get long() {
        return this.long_act;
    }
    set lat(nueva_latitud) {
        this.lat_act = nueva_latitud;
        this.pos_dir_wc_act = this.calcular_pos_dir_wc();
    }
    get lat() {
        return this.lat_act;
    }
    calcular_pos_dir_wc() {
        let long_rad = this.long_act * Math.PI / 180.0;
        let lat_rad = this.lat_act * Math.PI / 180.0;
        let x = Math.cos(lat_rad) * Math.sin(long_rad);
        let y = Math.sin(lat_rad);
        let z = Math.cos(lat_rad) * Math.cos(long_rad);
        return new Vec4([x, y, z, 0.0]);
    }
    get dir_wcc() {
        Assert(this.pos_dir_wc_act.w == 0.0, 'FuenteLuz.dir_wcc: la fuente de luz no es direccional');
        let v = this.pos_dir_wc_act;
        return new Vec3([v.x, v.y, v.z]);
    }
    /**
     * Construye una fuente de luz (direccional)
     * @param pos_dir (Vec4) posicion (punto) o dirección (vector) de la fuente ('w' debe ser 0 para direcciones o 1 para posiciones)
     * @param color   color o intensidad de la fuente
     */
    constructor(long_ini, lat_ini, color_ini) {
        const nombref = 'FuenteLuz.constructor:';
        this.long_act = long_ini;
        this.lat_act = lat_ini;
        this.pos_dir_wc_act = this.calcular_pos_dir_wc();
        this.color_act = color_ini;
    }
}
// ---------------------------------------------------------------------------------------------------------------
/**
 * Clase para una colección de fuentes de luz (es un array de fuentes de luz)
 */
export class ColeccionFuentesLuz extends Array {
    constructor(arr_fuentes) {
        super();
        for (let fuente of arr_fuentes)
            this.push(fuente);
    }
    /**
     * Activa la colección de fuentes de luz en el cauce actual de la aplicación
     */
    activar() {
        const nombref = 'ColeccionFuentes.activar';
        Assert(this.length > 0, `${nombref} no se puede activar una colección de fuentes que está vacía`);
        let pos_dir_wc = [];
        let color = [];
        for (let fuente of this) {
            let v = fuente.dir_wcc;
            pos_dir_wc.push(new Vec4([v.x, v.y, v.z, 0.0]));
            color.push(fuente.color);
        }
        let cauce = AplicacionWeb.instancia.cauce;
        cauce.fijarEvalMIL(true);
        cauce.fijarFuentesLuz(color, pos_dir_wc);
    }
    desactivar() {
        let cauce = AplicacionWeb.instancia.cauce;
        cauce.fijarEvalMIL(false);
    }
}
