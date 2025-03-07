import { Assert } from "./utilidades.js";
import { Vec2, Vec3 } from "./vec-mat.js";
/**
 * Función de parametrización para una superficie paramétrica en 3D
 */
export class FuncionParam {
    nombre_func = "no asignado";
    set nombre(nombre) { this.nombre_func = nombre; }
    get nombre() { return this.nombre_func; }
    evaluarPosicion(st) {
        throw new Error(`FuncionParam.evaluarPosicion: se ha invocado el método 'evaluarPosicion' pero el objeto no lo tiene redefindo `);
    }
}
/**
 * Un cuadrado perpendicular a Z (en el plano XY), con centro en el origen y lado 2
 */
export class FPCuadradoXY extends FuncionParam {
    constructor() {
        super();
        this.nombre = "cuadrado XY";
    }
    evaluarPosicion(st) {
        Assert(0.0 <= st.s && st.s <= 1.0, `valor 's' fuera de rango`);
        Assert(0.0 <= st.t && st.t <= 1.0, `valor 't' fuera de rango`);
        return new Vec3([2.0 * (st.s - 0.5), 2.0 * (st.t - 0.5), 0.0]);
    }
}
/**
 * Función de parametrización de una esfera
 */
export class FPEsfera extends FuncionParam {
    constructor() {
        super();
        this.nombre = "esfera";
    }
    evaluarPosicion(st) {
        Assert(0.0 <= st.s && st.s <= 1.0, `valor 's' fuera de rango`);
        Assert(0.0 <= st.t && st.t <= 1.0, `valor 't' fuera de rango`);
        const a = Math.PI * (2.0 * st.s), b = Math.PI * (st.t - 0.5), ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
        return new Vec3([sa * cb, sb, ca * cb]);
    }
}
/**
 * Función de parametrización de un cilindro
 */
export class FPCilindro extends FuncionParam {
    constructor() {
        super();
        this.nombre = "cilindro";
    }
    evaluarPosicion(st) {
        Assert(0.0 <= st.s && st.s <= 1.0, `valor 's' fuera de rango`);
        Assert(0.0 <= st.t && st.t <= 1.0, `valor 't' fuera de rango`);
        const a = Math.PI * (2.0 * st.s), ca = Math.cos(a), sa = Math.sin(a);
        return new Vec3([sa, st.t, ca]);
    }
}
/**
 * Función de parametrización de un cono
 */
export class FPCono extends FuncionParam {
    constructor() {
        super();
        this.nombre = "cono";
    }
    evaluarPosicion(st) {
        Assert(0.0 <= st.s && st.s <= 1.0, `valor 's' fuera de rango`);
        Assert(0.0 <= st.t && st.t <= 1.0, `valor 't' fuera de rango`);
        const a = Math.PI * (2.0 * st.s), ca = Math.cos(a), sa = Math.sin(a), r = 1.0 - st.t;
        return new Vec3([r * sa, st.t, r * ca]);
    }
}
/**
 * Función de parametrización de una columna barroca
 */
export class FPColumna extends FuncionParam {
    constructor() {
        super();
        this.nombre = "columna";
    }
    evaluarPosicion(st) {
        Assert(0.0 <= st.s && st.s <= 1.0, `valor 's' fuera de rango`);
        Assert(0.0 <= st.t && st.t <= 1.0, `valor 't' fuera de rango`);
        const a = Math.PI * (2.0 * st.t), ca = Math.cos(a), sa = Math.sin(a), r = 1.0 + 0.1 * Math.sin(5.0 * (a + 2.0 * Math.PI * st.s));
        return new Vec3([r * ca, 10.0 * (st.s - 0.5), r * sa]);
    }
}
/** Función de parametrización de un toroide */
export class FPToroide extends FuncionParam {
    constructor() {
        super();
        this.nombre = "toroide";
    }
    evaluarPosicion(st) {
        Assert(0.0 <= st.s && st.s <= 1.0, `valor 's' fuera de rango`);
        Assert(0.0 <= st.t && st.t <= 1.0, `valor 't' fuera de rango`);
        const a = Math.PI * (2.0 * st.s), b = Math.PI * (2.0 * (1.0 - st.t)), ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
        return new Vec3([(1.0 + 0.5 * cb) * ca, 0.5 * sb, (1.0 + 0.5 * cb) * sa]);
    }
}
export class FPCampoAlturas extends FuncionParam {
    ptos = [new Vec2([0.2, 0.6]),
        new Vec2([0.75, 0.6]),
        new Vec2([0.5, 0.2]),
        new Vec2([0.2, 0.8]),
        new Vec2([0.85, 0.8])];
    constructor() {
        super();
        this.nombre = "campo de alturas";
    }
    evaluarPosicion(st) {
        let h = 0.0;
        for (const p of this.ptos) {
            const d = 20.0 * st.menos(p).longitud;
            h += 0.5 / (1.0 + d * d * d);
            //h += 0.05*Math.cos( d*2.0 )
        }
        return new Vec3([st[1], h, st[0]]);
    }
}
