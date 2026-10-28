/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/geometry/Geometry.js
 * Descripción: Clase base para geometrías en WebGL2.
 *              Administra Vertex Array Objects (VAO), Vertex Buffer Objects (VBO)
 *              e Index Buffer Objects (IBO) con posiciones, normales y UVs.
 * ===================================================================
 */

class Geometry {
    /**
     * @param {WebGL2RenderingContext} gl Contexto WebGL2
     * @param {Array|Float32Array} vertices Datos de vértices intercalados [posX, posY, posZ, normX, normY, normZ, u, v]
     * @param {Array|Uint16Array} indices Índices de los triángulos
     */
    constructor(gl, vertices, indices) {
        this.gl = gl;
        this.indexCount = indices.length;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // VBO de Vértices (Posición 3f, Normal 3f, UV 2f => Stride 8 floats = 32 bytes)
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        const stride = 8 * 4; // 8 floats * 4 bytes/float = 32 bytes

        // Atributo 0: Posición vec3 (offset 0)
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);

        // Atributo 1: Normal vec3 (offset 12 bytes = 3 floats)
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);

        // Atributo 2: UV vec2 (offset 24 bytes = 6 floats)
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 6 * 4);

        // IBO de Índices
        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        // Desenlazar VAO para evitar modificaciones accidentales
        gl.bindVertexArray(null);
    }

    /**
     * Dibuja los elementos de la geometría utilizando el VAO enlazado
     */
    draw() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}

window.Geometry = Geometry;
