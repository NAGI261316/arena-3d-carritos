/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/materials/Material.js
 * Descripción: Encapsula las propiedades de material (textura, color difuso,
 *              brillo especular Blinn-Phong, escala UV y emisividad).
 * ===================================================================
 */

class Material {
    /**
     * @param {Object} options Configuración del material
     * @param {WebGLTexture} options.texture Textura WebGL2
     * @param {Array<number>} options.color Color difuso base RGB [0..1]
     * @param {Array<number>} options.uvScale Factor de repetición UV [u, v]
     * @param {number} options.shininess Exponente de brillo especular
     * @param {number} options.specularStrength Intensidad de reflejo especular
     * @param {boolean} options.emissive Indica si el material emite luz propia
     */
    constructor({
        texture = null,
        color = [1.0, 1.0, 1.0],
        uvScale = [1.0, 1.0],
        shininess = 32.0,
        specularStrength = 0.5,
        emissive = false
    } = {}) {
        this.texture = texture;
        this.color = color;
        this.uvScale = uvScale;
        this.shininess = shininess;
        this.specularStrength = specularStrength;
        this.emissive = emissive;
    }

    /**
     * Aplica las propiedades del material al shader activo
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader
     */
    apply(gl, shader) {
        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            shader.setInt("uTexture", 0);
        }

        shader.setVector3("uColor", this.color);
        shader.setVector2("uUVScale", this.uvScale);
        shader.setFloat("uShininess", this.shininess);
        shader.setFloat("uSpecularStrength", this.specularStrength);
        shader.setBool("uEmissive", this.emissive);
    }
}

window.Material = Material;
