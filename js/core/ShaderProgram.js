/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/core/ShaderProgram.js
 * Descripción: Encapsula la compilación, enlace y gestión de uniforms
 *              del programa de shaders en WebGL2.
 * ===================================================================
 */

class ShaderProgram {
    /**
     * @param {WebGL2RenderingContext} gl Contexto WebGL2
     * @param {string} vsSource Código fuente del Vertex Shader
     * @param {string} fsSource Código fuente del Fragment Shader
     */
    constructor(gl, vsSource, fsSource) {
        this.gl = gl;
        this.program = this.createProgram(vsSource, fsSource);
        this.uniformLocations = new Map();
        this.attribLocations = new Map();
    }

    /**
     * Compila un shader individual
     */
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            const tipoNombre = type === gl.VERTEX_SHADER ? "VERTEX SHADER" : "FRAGMENT SHADER";
            throw new Error(`[ShaderProgram] Error compilando ${tipoNombre}:\n${info}`);
        }
        return shader;
    }

    /**
     * Enlaza vertex y fragment shader en un WebGLProgram
     */
    createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(prog);
            gl.deleteProgram(prog);
            throw new Error(`[ShaderProgram] Error enlazando programa:\n${info}`);
        }

        // Una vez enlazados, podemos marcar los shaders para eliminación
        gl.deleteShader(vs);
        gl.deleteShader(fs);

        return prog;
    }

    /**
     * Activa este programa para el renderizado
     */
    use() {
        this.gl.useProgram(this.program);
    }

    /**
     * Obtiene y almacena en caché la ubicación de un uniform
     */
    getUniformLocation(name) {
        if (!this.uniformLocations.has(name)) {
            let loc = this.gl.getUniformLocation(this.program, name);
            if (!loc) {
                if (name.endsWith("[0]")) {
                    loc = this.gl.getUniformLocation(this.program, name.slice(0, -3));
                } else {
                    loc = this.gl.getUniformLocation(this.program, name + "[0]");
                }
            }
            this.uniformLocations.set(name, loc);
        }
        return this.uniformLocations.get(name);
    }

    /**
     * Obtiene y almacena en caché la ubicación de un atributo
     */
    getAttribLocation(name) {
        if (!this.attribLocations.has(name)) {
            const loc = this.gl.getAttribLocation(this.program, name);
            this.attribLocations.set(name, loc);
        }
        return this.attribLocations.get(name);
    }

    // --- MÉTODOS DE PASO DE UNIFORMS ---

    setMatrix4(name, matrix) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            const elements = matrix.elements !== undefined ? matrix.elements : matrix;
            this.gl.uniformMatrix4fv(loc, false, elements);
        }
    }

    setMatrix3(name, matrixElements) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniformMatrix3fv(loc, false, matrixElements);
        }
    }

    setVector3(name, v) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            const arr = v.toArray ? v.toArray() : (v.x !== undefined ? [v.x, v.y, v.z] : v);
            this.gl.uniform3fv(loc, arr);
        }
    }

    setVector2(name, x, y) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            if (Array.isArray(x)) {
                this.gl.uniform2fv(loc, x);
            } else {
                this.gl.uniform2f(loc, x, y);
            }
        }
    }

    setFloat(name, val) {
        const loc = this.getUniformLocation(name);
        if (loc) this.gl.uniform1f(loc, val);
    }

    setInt(name, val) {
        const loc = this.getUniformLocation(name);
        if (loc) this.gl.uniform1i(loc, val);
    }

    setBool(name, val) {
        const loc = this.getUniformLocation(name);
        if (loc) this.gl.uniform1i(loc, val ? 1 : 0);
    }

    setVector3Array(name, flatFloatArray) {
        const loc = this.getUniformLocation(name);
        if (loc) this.gl.uniform3fv(loc, flatFloatArray);
    }

    setFloatArray(name, flatFloatArray) {
        const loc = this.getUniformLocation(name);
        if (loc) this.gl.uniform1fv(loc, flatFloatArray);
    }

    setIntArray(name, flatInt32Array) {
        const loc = this.getUniformLocation(name);
        if (loc) this.gl.uniform1iv(loc, flatInt32Array);
    }
}

window.ShaderProgram = ShaderProgram;
