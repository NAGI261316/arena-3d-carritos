/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/math/Vector3.js
 * Descripción: Clase para manejo de vectores en 3D y operaciones algebraicas.
 * ===================================================================
 */

class Vector3 {
    /**
     * Crea un vector 3D
     * @param {number} x Componente X
     * @param {number} y Componente Y
     * @param {number} z Componente Z
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Establece los componentes del vector
     */
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * Copia los valores de otro vector
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    /**
     * Clona este vector
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Suma otro vector a este vector
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    /**
     * Resta otro vector a este vector
     */
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * Multiplica el vector por un escalar
     */
    scale(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    /**
     * Calcula la longitud (magnitud) del vector
     */
    length() {
        return Math.hypot(this.x, this.y, this.z);
    }

    /**
     * Normaliza el vector (convierte en vector unitario de longitud 1)
     */
    normalize() {
        const len = this.length();
        if (len > 0.000001) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        return this;
    }

    /**
     * Convierte el vector a un array nativo [x, y, z]
     */
    toArray() {
        return [this.x, this.y, this.z];
    }

    // --- MÉTODOS ESTÁTICOS AUXILIARES ---

    /**
     * Suma dos vectores: a + b
     */
    static add(a, b) {
        return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    /**
     * Resta dos vectores: a - b
     */
    static subtract(a, b) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return new Vector3(ax - bx, ay - by, az - bz);
    }

    /**
     * Producto punto (escalar) entre dos vectores
     */
    static dot(a, b) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return ax * bx + ay * by + az * bz;
    }

    /**
     * Producto cruz (vectorial) entre dos vectores a x b
     */
    static cross(a, b) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return new Vector3(
            ay * bz - az * by,
            az * bx - ax * bz,
            ax * by - ay * bx
        );
    }

    /**
     * Normaliza un vector o array [x, y, z]
     */
    static normalize(v) {
        const vx = v.x !== undefined ? v.x : v[0];
        const vy = v.y !== undefined ? v.y : v[1];
        const vz = v.z !== undefined ? v.z : v[2];
        const len = Math.hypot(vx, vy, vz);
        if (len > 0.000001) {
            return [vx / len, vy / len, vz / len];
        }
        return [0, 0, 0];
    }

    /**
     * Calcula la distancia euclidiana entre dos puntos 3D
     */
    static distance(a, b) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return Math.hypot(ax - bx, ay - by, az - bz);
    }
}

// Exportación global para navegadores
window.Vector3 = Vector3;
