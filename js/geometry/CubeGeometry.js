/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/geometry/CubeGeometry.js
 * Descripción: Geometría cúbica paramétrica con normales por cara y UVs.
 *              (Paso 5: Primer Objeto 3D - Cubo)
 * ===================================================================
 */

class CubeGeometry extends Geometry {
    /**
     * @param {WebGL2RenderingContext} gl Contexto WebGL2
     * @param {number} width Ancho en X (por defecto 1.0)
     * @param {number} height Alto en Y (por defecto 1.0)
     * @param {number} depth Profundidad en Z (por defecto 1.0)
     */
    constructor(gl, width = 1.0, height = 1.0, depth = 1.0) {
        const hx = width * 0.5;
        const hy = height * 0.5;
        const hz = depth * 0.5;

        // Definición de las 6 caras con su vector normal y ejes tangentes u, v
        const caras = [
            // +Z (Frente)
            { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
            // -Z (Atrás)
            { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
            // +X (Derecha)
            { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
            // -X (Izquierda)
            { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
            // +Y (Arriba / Techo)
            { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
            // -Y (Abajo / Suelo)
            { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] }
        ];

        const vertices = [];
        const indices = [];

        caras.forEach((cara, cIdx) => {
            const { n, u, v } = cara;
            const baseIdx = cIdx * 4;

            // 4 esquinas de la cara en coordenadas locales [-1, 1]
            const esquinas = [
                { x: -1, y: -1, u: 0, v: 0 },
                { x:  1, y: -1, u: 1, v: 0 },
                { x:  1, y:  1, u: 1, v: 1 },
                { x: -1, y:  1, u: 0, v: 1 }
            ];

            esquinas.forEach(e => {
                const px = (n[0] + e.x * u[0] + e.y * v[0]) * hx;
                const py = (n[1] + e.x * u[1] + e.y * v[1]) * hy;
                const pz = (n[2] + e.x * u[2] + e.y * v[2]) * hz;

                // [px, py, pz,  nx, ny, nz,  u, v]
                vertices.push(px, py, pz, n[0], n[1], n[2], e.u, e.v);
            });

            // 2 triángulos por cara (sentido antihorario CCW)
            indices.push(
                baseIdx, baseIdx + 1, baseIdx + 2,
                baseIdx, baseIdx + 2, baseIdx + 3
            );
        });

        super(gl, vertices, indices);
    }
}

window.CubeGeometry = CubeGeometry;
