import { Assert } from "./utilidades.js";
import { Vec2, UVec3 } from "./vec-mat.js";
import { MallaInd } from "./malla-ind.js";
import { AplicacionWeb } from "./aplicacion-web.js";
import { FPCuadradoXY, FPEsfera, FPCilindro, FPCono, FPColumna, FPToroide, FPCampoAlturas } from "./sup-par.js";
export class MallaSupPar extends MallaInd {
    fp;
    ns = 0;
    nt = 0;
    constructor(fp, ns, nt) {
        Assert(1 < nt && 1 < ns);
        super();
        let gl = AplicacionWeb.instancia.gl;
        this.nombre = `Superf. ${fp.nombre}`;
        this.fp = fp;
        this.ns = ns;
        this.nt = nt;
        // agregar los vértices y triángulos, por filas
        for (let it = 0; it < nt; it++)
            for (let is = 0; is < ns; is++) {
                const c = new Vec2([is / (ns - 1), it / (nt - 1)]);
                this.posiciones.push(fp.evaluarPosicion(c));
                this.coords_text.push(new Vec2([c.s, 1.0 - c.t]));
                if (is < ns - 1 && it < nt - 1) {
                    const iv00 = (it + 0) * ns + (is + 0), iv01 = (it + 1) * ns + (is + 0), iv10 = (it + 0) * ns + (is + 1), iv11 = (it + 1) * ns + (is + 1);
                    this.triangulos.push(new UVec3([iv00, iv11, iv01]));
                    this.triangulos.push(new UVec3([iv00, iv10, iv11]));
                    // aquí arriba hay que tener en cuenta que la coordenada T crece de "arriba abajo"
                    // y la coordenadas S crece de "izquierda a derecha", así que hay que dar la indices en
                    // este orden para que las normales de las caras y vértices esten "hacia fuera" ....
                }
            }
        this.calcularNormales();
    }
    /**
     *  promediar las normales de los vértices de la 1a y ultima columnas de vértices
     */
    promediarNormalesCol() {
        for (let it = 0; it < this.nt; it++) {
            const iv0 = it * this.ns; // índice del 1er vértice de la fila
            const iv1 = iv0 + this.ns - 1; // índice del último vértice de la fila.
            const n_promedio = this.normales_v[iv0].mas(this.normales_v[iv1]).mult(0.5).normalizado;
            this.normales_v[iv0] = n_promedio;
            this.normales_v[iv1] = n_promedio;
        }
    }
}
export class MallaCuadradoXY extends MallaSupPar {
    constructor(ns, nt) {
        super(new FPCuadradoXY(), ns, nt);
    }
}
export class MallaEsfera extends MallaSupPar {
    constructor(ns, nt) {
        super(new FPEsfera(), ns, nt);
        this.promediarNormalesCol();
    }
}
export class MallaCilindro extends MallaSupPar {
    constructor(ns, nt) {
        super(new FPCilindro(), ns, nt);
        this.promediarNormalesCol();
    }
}
export class MallaCono extends MallaSupPar {
    constructor(ns, nt) {
        super(new FPCono(), ns, nt);
        this.promediarNormalesCol();
    }
}
export class MallaColumna extends MallaSupPar {
    constructor(ns, nt) {
        super(new FPColumna(), ns, nt);
        this.promediarNormalesCol();
    }
}
export class MallaToroide extends MallaSupPar {
    constructor(ns, nt) {
        super(new FPToroide(), ns, nt);
        this.promediarNormalesCol();
    }
}
export class MallaCampoAlturas extends MallaSupPar {
    constructor(ns, nt) {
        super(new FPCampoAlturas(), ns, nt);
        this.promediarNormalesCol();
    }
}
