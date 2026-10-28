/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/geometry/CylinderGeometry.js
 * Descripción: Geometría cilíndrica paramétrica con tapas superior e inferior.
 *              Usada para columnas de la plataforma, tubos de neón,
 *              antena eléctrica y volante del vehículo.
 * ===================================================================
 */

class CylinderGeometry extends Geometry {
    /**
     * @param {WebGL2RenderingContext} gl Contexto WebGL2
     * @param {number} radiusTop Radio superior
     * @param {number} radiusBottom Radio inferior
     * @param {number} height Altura del cilindro
     * @param {number} radialSegments Segmentos en el contorno circular
     */
    constructor(gl, radiusTop = 0.5, radiusBottom = 0.5, height = 1.0, radialSegments = 24) {
        const vertices = [];
        const indices = [];

        const halfHeight = height * 0.5;

        // 1. Manto lateral
        for (let i = 0; i <= radialSegments; i++) {
            const u = i / radialSegments;
            const theta = u * Math.PI * 2;
            const sinT = Math.sin(theta);
            const cosT = Math.cos(theta);

            // Normal radial
            const nx = cosT;
            const ny = 0;
            const nz = sinT;

            // Vértice inferior
            vertices.push(
                radiusBottom * cosT, -halfHeight, radiusBottom * sinT,
                nx, ny, nz,
                u, 0.0
            );

            // Vértice superior
            vertices.push(
                radiusTop * cosT, halfHeight, radiusTop * sinT,
                nx, ny, nz,
                u, 1.0
            );
        }

        for (let i = 0; i < radialSegments; i++) {
            const a = i * 2;
            indices.push(a, a + 1, a + 2);
            indices.push(a + 1, a + 3, a + 2);
        }

        // 2. Tapa superior (Y = +halfHeight)
        const topCenterIdx = vertices.length / 8;
        vertices.push(0, halfHeight, 0, 0, 1, 0, 0.5, 0.5);

        const topEdgeStart = vertices.length / 8;
        for (let i = 0; i <= radialSegments; i++) {
            const theta = (i / radialSegments) * Math.PI * 2;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);
            vertices.push(
                radiusTop * cosT, halfHeight, radiusTop * sinT,
                0, 1, 0,
                0.5 + 0.5 * cosT, 0.5 + 0.5 * sinT
            );
        }

        for (let i = 0; i < radialSegments; i++) {
            indices.push(topCenterIdx, topEdgeStart + i, topEdgeStart + i + 1);
        }

        // 3. Tapa inferior (Y = -halfHeight)
        const bottomCenterIdx = vertices.length / 8;
        vertices.push(0, -halfHeight, 0, 0, -1, 0, 0.5, 0.5);

        const bottomEdgeStart = vertices.length / 8;
        for (let i = 0; i <= radialSegments; i++) {
            const theta = (i / radialSegments) * Math.PI * 2;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);
            vertices.push(
                radiusBottom * cosT, -halfHeight, radiusBottom * sinT,
                0, -1, 0,
                0.5 + 0.5 * cosT, 0.5 + 0.5 * sinT
            );
        }

        for (let i = 0; i < radialSegments; i++) {
            indices.push(bottomCenterIdx, bottomEdgeStart + i + 1, bottomEdgeStart + i);
        }

        super(gl, vertices, indices);
    }
}

window.CylinderGeometry = CylinderGeometry;
