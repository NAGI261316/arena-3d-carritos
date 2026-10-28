/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/math/Matrix4.js
 * Descripción: Clase para matrices 4x4 de transformación afín en WebGL2.
 *              Orden Column-Major estándar de OpenGL / WebGL.
 * ===================================================================
 */

class Matrix4 {
    /**
     * Inicializa una matriz 4x4 con los valores proporcionados o la identidad.
     * Los elementos se guardan en un Float32Array de 16 posiciones.
     */
    constructor(elements = null) {
        this.elements = new Float32Array(16);
        if (elements) {
            this.elements.set(elements);
        } else {
            this.identity();
        }
    }

    /**
     * Establece esta matriz como la matriz identidad (1 en diagonal principal)
     */
    identity() {
        const e = this.elements;
        e[0] = 1; e[4] = 0; e[8]  = 0; e[12] = 0;
        e[1] = 0; e[5] = 1; e[9]  = 0; e[13] = 0;
        e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
        e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
        return this;
    }

    /**
     * Copia los elementos de otra matriz a esta
     */
    copy(m) {
        this.elements.set(m.elements);
        return this;
    }

    /**
     * Devuelve una copia exacta de esta matriz
     */
    clone() {
        return new Matrix4(this.elements);
    }

    /**
     * Crea una matriz de traslación 3D
     * [ 1, 0, 0, x ]
     * [ 0, 1, 0, y ]
     * [ 0, 0, 1, z ]
     * [ 0, 0, 0, 1 ] (en formato column-major)
     */
    static translation(x, y, z) {
        return new Matrix4(new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]));
    }

    /**
     * Crea una matriz de escalamiento 3D
     */
    static scaling(sx, sy, sz) {
        return new Matrix4(new Float32Array([
            sx, 0,  0,  0,
            0,  sy, 0,  0,
            0,  0,  sz, 0,
            0,  0,  0,  1
        ]));
    }

    /**
     * Crea una matriz de rotación alrededor del eje X (ángulo en radianes)
     */
    static rotationX(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Matrix4(new Float32Array([
            1,  0, 0, 0,
            0,  c, s, 0,
            0, -s, c, 0,
            0,  0, 0, 1
        ]));
    }

    /**
     * Crea una matriz de rotación alrededor del eje Y (ángulo en radianes)
     */
    static rotationY(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Matrix4(new Float32Array([
             c, 0, -s, 0,
             0, 1,  0, 0,
             s, 0,  c, 0,
             0, 0,  0, 1
        ]));
    }

    /**
     * Crea una matriz de rotación alrededor del eje Z (ángulo en radianes)
     */
    static rotationZ(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Matrix4(new Float32Array([
            c, s, 0, 0,
           -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]));
    }

    /**
     * Multiplica dos matrices 4x4 (A * B) en orden de composición matricial.
     */
    static multiply(a, b) {
        const ae = a.elements !== undefined ? a.elements : a;
        const be = b.elements !== undefined ? b.elements : b;
        const out = new Float32Array(16);

        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += ae[k * 4 + row] * be[col * 4 + k];
                }
                out[col * 4 + row] = sum;
            }
        }
        return new Matrix4(out);
    }

    /**
     * Multiplica en cadena múltiples matrices de izquierda a derecha.
     */
    static compose(...matrices) {
        return matrices.reduce((acc, curr) => Matrix4.multiply(acc, curr));
    }

    /**
     * Crea una matriz de proyección en perspectiva estándar
     * @param {number} fovRad Campo de visión vertical en radianes
     * @param {number} aspect Relación de aspecto (width / height)
     * @param {number} near Plano cercano
     * @param {number} far Plano lejano
     */
    static perspective(fovRad, aspect, near, far) {
        const f = 1.0 / Math.tan(fovRad / 2);
        const rangeInv = 1.0 / (near - far);

        return new Matrix4(new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * rangeInv, -1,
            0, 0, (2 * far * near) * rangeInv, 0
        ]));
    }

    /**
     * Crea una matriz de vista (View Matrix) con el algoritmo LookAt (Paso 6)
     * @param {Array|Vector3} eye Posición de la cámara en el mundo
     * @param {Array|Vector3} target Punto hacia el cual mira la cámara
     * @param {Array|Vector3} up Vector 'hacia arriba' del mundo (usualmente [0, 1, 0])
     */
    static lookAt(eye, target, up = [0, 1, 0]) {
        const ex = eye.x !== undefined ? eye.x : eye[0];
        const ey = eye.y !== undefined ? eye.y : eye[1];
        const ez = eye.z !== undefined ? eye.z : eye[2];

        const tx = target.x !== undefined ? target.x : target[0];
        const ty = target.y !== undefined ? target.y : target[1];
        const tz = target.z !== undefined ? target.z : target[2];

        const ux = up.x !== undefined ? up.x : up[0];
        const uy = up.y !== undefined ? up.y : up[1];
        const uz = up.z !== undefined ? up.z : up[2];

        // Eje Z de la cámara: apunta desde target hacia eye
        let zx = ex - tx, zy = ey - ty, zz = ez - tz;
        let lenZ = Math.hypot(zx, zy, zz);
        if (lenZ > 0.000001) { zx /= lenZ; zy /= lenZ; zz /= lenZ; }

        // Eje X de la cámara: producto cruz entre up y Z
        let xx = uy * zz - uz * zy;
        let xy = uz * zx - ux * zz;
        let xz = ux * zy - uy * zx;
        let lenX = Math.hypot(xx, xy, xz);
        if (lenX > 0.000001) { xx /= lenX; xy /= lenX; xz /= lenX; }

        // Eje Y de la cámara: producto cruz entre Z y X
        const yx = zy * xz - zz * xy;
        const yy = zz * xx - zx * xz;
        const yz = zx * xy - zy * xx;

        return new Matrix4(new Float32Array([
            xx, yx, zx, 0,
            xy, yy, zy, 0,
            xz, yz, zz, 0,
            -(xx * ex + xy * ey + xz * ez),
            -(yx * ex + yy * ey + yz * ez),
            -(zx * ex + zy * ey + zz * ez),
            1
        ]));
    }
}

// Exportación global para navegadores
window.Matrix4 = Matrix4;
