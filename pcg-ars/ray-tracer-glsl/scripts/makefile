.SUFFIXES:
.PHONY: all

src_repo         :=../../../../pcg-ars.git/fuentes/ray-tracer-glsl
src_js_dir       := $(src_repo)/public_html/js
src_glsl_dir     := $(src_repo)/public_html/glsl
target_js_dir    := ../public_html/js
target_glsl_dir  := ../public_html/glsl
src_arch_js      := $(wildcard $(src_js_dir)/*.js) 
src_arch_glsl    := $(wildcard $(src_glsl_dir)/*.glsl)
target_arch_js   := $(patsubst $(src_js_dir)/%.js, $(target_js_dir)/%.js, $(src_arch_js))
target_arch_glsl := $(patsubst $(src_glsl_dir)/%.glsl, $(target_glsl_dir)/%.glsl, $(src_arch_glsl))


all: 
	make $(target_arch_js)
	make $(target_arch_glsl)

$(target_arch_js): $(src_arch_js)
	rm -rf $(target_js_dir)/*.js
	cp $(src_js_dir)/*.js $(target_js_dir)

$(target_arch_glsl): $(src_arch_glsl)
	rm -rf $(target_glsl_dir)/*.glsl
	cp $(src_glsl_dir)/*.glsl $(target_glsl_dir)
