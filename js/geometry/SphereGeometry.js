/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/geometry/SphereGeometry.js
 * Descripción: Geometría esférica paramétrica (Paso 7 del curso).
 *              Calcula normales unitarias salientes y coordenadas UV.
 * ===================================================================
 */

class SphereGeometry extends Geometry {
    /**
     * @param {WebGL2RenderingContext} gl Contexto WebGL2
     * @param {number} radius Radio de la esfera
     * @param {number} latSegments Segmentos latitudinales (anillos)
     * @param {number} lonSegments Segmentos longitudinales (sectores)
     */
    constructor(gl, radius = 1.0, latSegments = 24, lonSegments = 24) {
        const vertices = [];
        const indices = [];

        // Generar vértices recorriendo latitud phi [0, PI] y longitud theta [0, 2*PI]
        for (let i = 0; i <= latSegments; i++) {
            const phi = (i / latSegments) * Math.PI;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            for (let j = 0; j <= lonSegments; j++) {
                const theta = (j / lonSegments) * Math.PI * 2;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                // Normal unitaria
                const nx = sinPhi * cosTheta;
                const ny = cosPhi;
                const nz = sinPhi * sinTheta;

                // Coordenadas UV
                const u = j / lonSegments;
                const v = i / latSegments;

                // [px, py, pz,  nx, ny, nz,  u, v]
                vertices.push(
                    radius * nx,
                    radius * ny,
                    radius * nz,
                    nx, ny, nz,
                    u, v
                );
            }
        }

        // Generar índices triangulares
        for (let i = 0; i < latSegments; i++) {
            for (let j = 0; j < lonSegments; j++) {
                const first = i * (lonSegments + 1) + j;
                const second = first + lonSegments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        super(gl, vertices, indices);
    }
}

window.SphereGeometry = SphereGeometry;
