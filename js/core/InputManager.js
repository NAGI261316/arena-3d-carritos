/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/core/InputManager.js
 * Descripción: Administrador de eventos de entrada (Teclado, Ratón, Zoom).
 *              Soporta Pointer Lock y arrastre para control de cámara estilo FPS.
 * ===================================================================
 */

class InputManager {
    /**
     * @param {HTMLCanvasElement} canvas Elemento canvas para eventos de ratón
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        
        // Orientación de la cámara (mouse look)
        this.yaw = 0;      // Giro horizontal
        this.pitch = 0;    // Inclinación vertical (arriba/abajo)
        this.fov = 70;     // Campo de visión para zoom

        // Sensibilidad de control
        this.mouseSensitivity = 0.0025;
        this.isDragging = false;

        // Callbacks para acciones de pulsación única
        this.onToggleCamera = null;
        this.onReset = null;
        this.onToggleMainRoofLights = null; // Tecla T: Luces del techo principal
        this.onToggleMiniRoofLights = null; // Tecla Y: Luces del minitecho

        this.initListeners();
    }

    initListeners() {
        // --- TECLADO ---
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;

            // Tecla C: Alternar entre 1ª y 3ª persona
            if (e.code === "KeyC") {
                if (this.onToggleCamera) this.onToggleCamera();
            }

            // Tecla R: Reiniciar posición
            if (e.code === "KeyR") {
                if (this.onReset) this.onReset();
            }

            // Tecla T: Alternar luces del techo principal
            if (e.code === "KeyT") {
                if (this.onToggleMainRoofLights) this.onToggleMainRoofLights();
            }

            // Tecla Y: Alternar luces del minitecho
            if (e.code === "KeyY") {
                if (this.onToggleMiniRoofLights) this.onToggleMiniRoofLights();
            }

            // Prevenir scroll en la página con flechas o barra espaciadora
            if (e.code.startsWith("Arrow") || e.code === "Space") {
                e.preventDefault();
            }
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });

        // --- RATÓN: Click y Arrastre / Pointer Lock ---
        this.canvas.addEventListener("mousedown", (e) => {
            if (e.button === 0) { // Clic izquierdo
                this.isDragging = true;
                // Intento opcional de captura de puntero (FPS Pointer Lock)
                if (document.pointerLockElement !== this.canvas) {
                    try {
                        this.canvas.requestPointerLock();
                    } catch (_) {}
                }
            }
        });

        window.addEventListener("mouseup", () => {
            this.isDragging = false;
        });

        window.addEventListener("mousemove", (e) => {
            const hasPointerLock = document.pointerLockElement === this.canvas;
            if (!this.isDragging && !hasPointerLock) return;

            const dx = e.movementX || 0;
            const dy = e.movementY || 0;

            this.yaw -= dx * this.mouseSensitivity;
            this.pitch -= dy * this.mouseSensitivity;

            // Limitar pitch para no invertir la cámara (-75° a +75°)
            const maxPitch = 1.25;
            this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
        });

        // --- RUEDA DE RATÓN: ZOOM (FOV) ---
        this.canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            this.fov += e.deltaY * 0.03;
            // Clampear campo de visión entre 35° (zoom in) y 90° (gran angular)
            this.fov = Math.max(35, Math.min(90, this.fov));
        }, { passive: false });
    }

    /**
     * Consulta si una tecla específica está presionada
     */
    isKeyDown(code) {
        return !!this.keys[code];
    }

    /**
     * Obtiene el vector de aceleración (-1 hacia atrás, +1 hacia adelante)
     */
    getThrottle() {
        const fwd = this.isKeyDown("KeyW") || this.isKeyDown("ArrowUp") ? 1 : 0;
        const rev = this.isKeyDown("KeyS") || this.isKeyDown("ArrowDown") ? 1 : 0;
        return fwd - rev;
    }

    /**
     * Obtiene la dirección de giro (+1 izquierda, -1 derecha)
     */
    getSteer() {
        const left = this.isKeyDown("KeyA") || this.isKeyDown("ArrowLeft") ? 1 : 0;
        const right = this.isKeyDown("KeyD") || this.isKeyDown("ArrowRight") ? 1 : 0;
        return left - right;
    }

    /**
     * Restablece la orientación del ratón
     */
    resetLook() {
        this.yaw = 0;
        this.pitch = 0;
        this.fov = 70;
    }
}

window.InputManager = InputManager;
