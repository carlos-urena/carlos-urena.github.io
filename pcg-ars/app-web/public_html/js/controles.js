import { Assert, html } from "./utilidades.js";
// ---------------------------------------------------------------------------------
/**
 * Crea un elemento 'input' tipo 'checkbox' y lo inserta en un elemento padre
 *
 * @param elem_padre      (HTMLElement) elemento padre donde se inserta el nuevo
 * @param estado_inicial  (boolean) estado inicial del checkbox, true --> marcado (checked), false --> (no marcado) unchecked
 * @param id              (string) identificador del elemento a crear
 * @param titulo          (string) texto que aparece junto al check box
 * @returns               (HTMLSelectElement) elemento select
 */
export function CrearInputCheckbox(elem_padre, estado_inicial, id, titulo) {
    const nombref = `AplicacionWeb.crearCheckBox (id=${id}):`;
    Assert(elem_padre != null, `${nombref} elemento padre es nulo`);
    Assert(0 < id.length, `${nombref} : el identificador está vacío`);
    let div_check_izquierdo = document.createElement('div');
    let div_check_derecho = document.createElement('div');
    let id_span_estado = `${id}_span_txt_estado`;
    let txt_span_estado = estado_inicial ? "activado" : "desactivado";
    div_check_izquierdo.innerHTML = `<label for='${id}'>${titulo}</label>`;
    div_check_derecho.innerHTML = `<input type='checkbox' class='estilo_input_checkbox' id='${id}'>&nbsp<span id='${id_span_estado}'>${txt_span_estado}</span>`;
    div_check_izquierdo.className = "estilo_div_grid_izq";
    div_check_derecho.className = "estilo_div_grid_der";
    elem_padre.appendChild(div_check_izquierdo);
    elem_padre.appendChild(div_check_derecho);
    let checkbox = document.getElementById(id);
    checkbox.checked = estado_inicial;
    checkbox.addEventListener('change', () => {
        //console.log(`cambio en un checkbox, id_span_estado = '${id_span_estado}'`)
        let span_estado = document.getElementById(id_span_estado);
        if (span_estado == null)
            throw new Error(`ERROR: no se ha encontrado el span con id = ${id_span_estado}`);
        span_estado.innerHTML = checkbox.checked ? "activado" : "desactivado";
    });
    return checkbox;
}
// ---------------------------------------------------------------------------------
/**
 * Crea un elemento 'select' y lo inserta en un elemento padre
 *
 * @param elem_padre      (HTMLElement) elemento padre donde se inserta el nuevo
 * @param valor_inicial   (number) índice de la opción inicialmente seleccionada
 * @param id              (string) identificador del elemento a crear
 * @param titulo          (string) texto que aparece junto al selector
 * @param textos_opciones (string[]) array de textos de las opciones
 * @returns               (HTMLSelectElement) elemento select
 */
export function CrearSelector(elem_padre, valor_inicial, id, titulo, textos_opciones) {
    const nombref = `AplicacionWeb.crearSelector (id=${id}):`;
    Assert(elem_padre != null, `${nombref} elemento padre es nulo`);
    Assert(0 < id.length, `${nombref} : el identificador está vacío`);
    Assert(0 < textos_opciones.length, `${nombref} : no hay objetos en la lista de objetos`);
    let texto_html = `<select id='${id}' class='estilo_select'>`;
    let cont = 0;
    for (const texto_opcion of textos_opciones) {
        texto_html += `\t<option value="${cont}">${texto_opcion}</option>\n`;
        cont++;
    }
    texto_html += html `</select></p>\n`;
    let div_selector_izquierdo = document.createElement('div');
    let div_selector_derecho = document.createElement('div');
    div_selector_izquierdo.innerHTML = `${titulo}`;
    div_selector_derecho.innerHTML = texto_html;
    div_selector_izquierdo.className = "estilo_div_grid_izq";
    div_selector_derecho.className = "estilo_div_grid_der";
    elem_padre.appendChild(div_selector_izquierdo);
    elem_padre.appendChild(div_selector_derecho);
    let selector = document.getElementById(id);
    selector.value = `${valor_inicial}`;
    return selector;
}
// ------------------------------------------------------------------------- 
/**
 * Crea un elemento 'input' tipo 'checkbox' y lo inserta en un elemento padre
 *
 * @param elem_padre      (HTMLElement) elemento padre donde se inserta el nuevo
 * @param color_inicial   (Vec3) estado inicial del checkbox, true --> marcado (checked), false --> (no marcado) unchecked
 * @param id              (string) identificador del elemento a crear
 * @param titulo          (string) texto que aparece junto al check box
 * @returns               (HTMLSelectElement) elemento select
 */
export function CrearInputColor(elem_padre, color_inicial, id, titulo) {
    const nombref = `AplicacionWeb.crearInputColor (id=${id}):`;
    Assert(elem_padre != null, `${nombref} elemento padre es nulo`);
    Assert(0 < id.length, `${nombref} : el identificador está vacío`);
    let div_color_izquierdo = document.createElement('div');
    let div_color_derecho = document.createElement('div');
    div_color_izquierdo.innerHTML = `<label for='${id}'>${titulo}</label>`;
    div_color_derecho.innerHTML = `<input type='color' class='estilo_input_color' id='${id}'>`;
    div_color_izquierdo.className = "estilo_div_grid_izq";
    div_color_derecho.className = "estilo_div_grid_der";
    elem_padre.appendChild(div_color_izquierdo);
    elem_padre.appendChild(div_color_derecho);
    let input_color = document.getElementById(id);
    let color_str = color_inicial.hexColorStr();
    input_color.value = color_str;
    return input_color;
}
// ------------------------------------------------------------------------- 
/**
 * Crea un elemento 'slider' y lo inserta en un elemento padre
 *
 * @param elem_padre      (HTMLElement) elemento padre donde se inserta el nuevo
 * @param valor_inicial   (number) valor inicial del selector (entre valor min y valor max)
 * @param valor_min       (number) valor mínimo
 * @param valor_max       (number) valor máximo
 * @param step            (number) minimal incremento del valor
 * @param id              (string) identificador del elemento a crear
 * @param titulo          (string) texto que aparece junto al selector
 * @returns               (HTMLInputElement) elemento slider
 */
export function CrearInputSlider(elem_padre, valor_inicial, valor_min, valor_max, step, id, titulo) {
    const nombref = `AplicacionWeb.crearSlider (id=${id}):`;
    Assert(elem_padre != null, `${nombref} elemento padre es nulo`);
    Assert(0 < id.length, `${nombref} : el identificador está vacío`);
    //Assert( 0 < textos_opciones.length , `${nombref} : no hay objetos en la lista de objetos`)
    let texto_html = `<input type='range' step='${step}' min='${valor_min}' max='${valor_max}' id='${id}' class='estilo_input_slider'></input>`;
    let cont = 0;
    let div_slider_izquierdo = document.createElement('div');
    let div_slider_derecho = document.createElement('div');
    let id_span_estado = `${id}_span_txt_estado`;
    let txt_span_estado = `${valor_inicial}`;
    div_slider_izquierdo.innerHTML = `${titulo}`;
    div_slider_derecho.innerHTML = `${texto_html}&nbsp&nbsp;&nbsp;<span id='${id_span_estado}'>${txt_span_estado}</span>`;
    div_slider_izquierdo.className = "estilo_div_grid_izq";
    div_slider_derecho.className = "estilo_div_grid_der";
    elem_padre.appendChild(div_slider_izquierdo);
    elem_padre.appendChild(div_slider_derecho);
    let slider = document.getElementById(id);
    slider.value = `${valor_inicial}`;
    slider.addEventListener('change', () => {
        let span_estado = document.getElementById(id_span_estado);
        if (span_estado == null)
            throw new Error(`ERROR: no se ha encontrado el span con id = ${id_span_estado}`);
        span_estado.innerHTML = slider.value;
    });
    return slider;
}
/**
 * Crea un elemento 'boton' y lo inserta en un elemento padre.
 *
 * @param elem_padre    elemento padre (el cuadro de controles)
 * @param texto_boton
 * @param texto_estado
 * @param id          (string) identificador único del elemento a crear
 * @param titulo
 * @returns
 */
export function CrearInputBoton(elem_padre, texto_boton, texto_estado, id, titulo) {
    const nombref = `AplicacionWeb.crearBoton (id=${id}):`;
    Assert(elem_padre != null, `${nombref} elemento padre es nulo`);
    Assert(0 < id.length, `${nombref} : el identificador está vacío`);
    //Assert( 0 < textos_opciones.length , `${nombref} : no hay objetos en la lista de objetos`)
    let html_boton = `<input type='button' id=${id} value='${texto_boton}' class='estilo_input_boton'></input>`;
    let html_boton_1 = (texto_estado == "") ? html_boton : (`&nbsp&nbsp;${html_boton}`);
    let id_span_estado = `${id}_span_estado`;
    let div_slider_izquierdo = document.createElement('div');
    let div_slider_derecho = document.createElement('div');
    div_slider_izquierdo.innerHTML = `${titulo}`;
    div_slider_derecho.innerHTML = `<span id='${id_span_estado}'>${texto_estado}</span>${html_boton_1}`;
    div_slider_izquierdo.className = "estilo_div_grid_izq";
    div_slider_derecho.className = "estilo_div_grid_der";
    elem_padre.appendChild(div_slider_izquierdo);
    elem_padre.appendChild(div_slider_derecho);
    let boton = document.getElementById(id);
    return boton;
}
