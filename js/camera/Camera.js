/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/camera/Camera.js
 * Descripción: Sistema de cámara para Primera Persona (FPS - Conductor)
 *              y Tercera Persona (Orbital de seguimiento), con cálculo de
 *              matriz de vista (View Matrix) y proyección en perspectiva (Paso 6).
 * ===================================================================
 */

class Camera {
    /**
     * @param {Object} options Configuración inicial de la cámara
     */
    constructor({
        fovDegrees = 70,
        aspectRatio = 1.5,
        near = 0.1,
        far = 80.0
    } = {}) {
        this.fovDegrees = fovDegrees;
        this.aspectRatio = aspectRatio;
        this.near = near;
        this.far = far;

        // Modo de cámara: true = 3ª persona, false = 1ª persona (FPS en cabina)
        this.isThirdPerson = false;

        // Matrices calculadas
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();

        // Posiciones espaciales actuales
        this.eye = new Vector3(0, 1.2, 0);
        this.target = new Vector3(0, 1.2, -1);
        this.up = new Vector3(0, 1, 0);
    }

    /**
     * Alterna entre modo 1ª persona (asiento de piloto) y 3ª persona
     */
    toggleMode() {
        this.isThirdPerson = !this.isThirdPerson;
        return this.isThirdPerson;
    }

    /**
     * Actualiza las matrices de vista y proyección en función del auto y el input
     * @param {Object} car Estado del carrito del jugador (x, z, rumbo)
     * @param {InputManager} input Gestor de entrada con yaw, pitch y fov
     * @param {number} canvasWidth Ancho del canvas
     * @param {number} canvasHeight Alto del canvas
     */
    update(car, input, canvasWidth, canvasHeight) {
        this.aspectRatio = canvasWidth / canvasHeight;
        this.fovDegrees = input.fov;

        // Calcular ángulo total de visión (rumbo del carrito + paneo libre del mouse)
        const totalYaw = car.rumbo + input.yaw;
        const pitch = input.pitch;

        // Vector dirección hacia donde mira la cámara
        const dirX = -Math.sin(totalYaw) * Math.cos(pitch);
        const dirY = Math.sin(pitch);
        const dirZ = -Math.cos(totalYaw) * Math.cos(pitch);

        if (this.isThirdPerson) {
            // --- TERCERA PERSONA: Seguimiento externo desde atrás y arriba ---
            const dist = 3.6;
            const heightOffset = 1.4;

            // Punto objetivo: centro del carrito
            this.target.set(car.x, 0.7, car.z);

            // Posición de la cámara detrás del objetivo según el ángulo
            const eyeX = this.target.x - dirX * dist;
            const eyeY = Math.max(0.3, this.target.y - dirY * dist + heightOffset);
            const eyeZ = this.target.z - dirZ * dist;

            this.eye.set(eyeX, eyeY, eyeZ);
        } else {
            // --- PRIMERA PERSONA (FPS): Ubicada en la cabeza del piloto en la cabina ---
            // Justo detrás del volante y tablero (coincidiendo con las capturas 1 y 4)
            // Offset sutil hacia atrás del centro del chasis
            const backOffsetX = Math.sin(car.rumbo) * 0.15;
            const backOffsetZ = Math.cos(car.rumbo) * 0.15;

            const eyeX = car.x + backOffsetX;
            const eyeY = 0.98; // Altura a nivel de ojos sentado en el carrito
            const eyeZ = car.z + backOffsetZ;

            this.eye.set(eyeX, eyeY, eyeZ);
            this.target.set(eyeX + dirX, eyeY + dirY, eyeZ + dirZ);
        }

        // 1. Matriz de Vista (LookAt)
        this.viewMatrix = Matrix4.lookAt(this.eye, this.target, this.up);

        // 2. Matriz de Proyección en Perspectiva (con FOV interactivo por scroll)
        const fovRad = (this.fovDegrees * Math.PI) / 180.0;
        this.projectionMatrix = Matrix4.perspective(fovRad, this.aspectRatio, this.near, this.far);
    }
}

window.Camera = Camera;
