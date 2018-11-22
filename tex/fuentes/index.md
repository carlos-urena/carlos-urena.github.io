# Fuentes LaTeX portables 

Para usar en LaTeX una fuente parecida a Cambria, se puede usar 
el package latex Caladea (`\usepackage{caladea}`).  Este package Latex 
viene incorporado al paquete debian `texlive-fonts-extra`. Igualmente se 
puede probar con el package latex Carlito, que viene a ser un sustituto de la fuente Calibri. 

Para ver en linux (Ubuntu) los fuentes que incorpora `texlive-font-extra`, podemos escribir:

 `apt show texlive-fonts-extra | more`

Igualmente se puede hacer con el paquete Debian `texlive-fonts-recommended`. 
En esta página se puede ver una muestra de fuentes en estos paquetes:

https://www.tjansson.dk/2011/01/latex-fonts-73-pdf-and-jpg-samples/ 

Una opción interesante es combinar Caladea para el texto normal con Courier New 
para textos de espaciado fijo (listados de código fuente, identificadores, etc...). Esta combinación puede lograrse con estas sentencias en la cabecera del fuente latex:

    \usepackage{caladea}
    \usepackage{courier}
    \setmonofont{Courier New}

Funciona en cualquier ordenador con texlive (es portable), excepto que el uso 
de Courier New requiere instalar el package debian de nombre `ttf-mscorefonts-installer`
