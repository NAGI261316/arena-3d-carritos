/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/geometry/TorusGeometry.js
 * Descripción: Geometría de toroide paramétrico (superficie toroidal).
 *              Ideal para el parachoques perimetral de goma de los carritos
 *              y los neumáticos colocados en la plataforma central.
 * ===================================================================
 */

class TorusGeometry extends Geometry {
    /**
     * @param {WebGL2RenderingContext} gl Contexto WebGL2
     * @param {number} radius Radio mayor (del centro al tubo)
     * @param {number} tube Radio menor (grosor del tubo)
     * @param {number} radialSegments Segmentos en el tubo
     * @param {number} tubularSegments Segmentos alrededor del anillo
     */
    constructor(gl, radius = 1.0, tube = 0.3, radialSegments = 16, tubularSegments = 24) {
        const vertices = [];
        const indices = [];

        for (let j = 0; j <= radialSegments; j++) {
            const v = j / radialSegments;
            const phi = v * Math.PI * 2;
            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);

            for (let i = 0; i <= tubularSegments; i++) {
                const u = i / tubularSegments;
                const theta = u * Math.PI * 2;
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);

                // Centro del anillo en el plano XZ
                const cx = radius * cosTheta;
                const cz = radius * sinTheta;

                // Posición 3D del punto sobre la superficie toroidal
                const px = (radius + tube * cosPhi) * cosTheta;
                const py = tube * sinPhi;
                const pz = (radius + tube * cosPhi) * sinTheta;

                // Vector normal unitario saliente
                const nx = cosPhi * cosTheta;
                const ny = sinPhi;
                const nz = cosPhi * sinTheta;

                vertices.push(px, py, pz, nx, ny, nz, u, v);
            }
        }

        for (let j = 1; j <= radialSegments; j++) {
            for (let i = 1; i <= tubularSegments; i++) {
                const a = (tubularSegments + 1) * j + i - 1;
                const b = (tubularSegments + 1) * (j - 1) + i - 1;
                const c = (tubularSegments + 1) * (j - 1) + i;
                const d = (tubularSegments + 1) * j + i;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        super(gl, vertices, indices);
    }
}

window.TorusGeometry = TorusGeometry;
