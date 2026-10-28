/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/core/RenderLoop.js
 * Descripción: Ciclo de renderizado interactivo (Paso 4: Render Loop y Animación).
 *              Calcula el deltaTime para garantizar animación fluida e independiente de FPS.
 * ===================================================================
 */

class RenderLoop {
    /**
     * @param {Function} updateFn Función de actualización física/lógica: update(dt)
     * @param {Function} renderFn Función de renderizado gráfico: render(time)
     */
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.previousTime = 0;
        this.isRunning = false;
        this.animationFrameId = null;

        this.loop = this.loop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.previousTime = performance.now() * 0.001;
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    loop(currentTimeMs) {
        if (!this.isRunning) return;

        const currentTime = currentTimeMs * 0.001;
        // deltaTime en segundos, limitado a 0.05 (20 FPS mínimo) para estabilidad numérica
        const dt = Math.min(currentTime - this.previousTime, 0.05);
        this.previousTime = currentTime;

        // 1. Actualización de física y estados
        if (this.updateFn) {
            this.updateFn(dt);
        }

        // 2. Renderizado del frame
        if (this.renderFn) {
            this.renderFn(currentTime);
        }

        this.animationFrameId = requestAnimationFrame(this.loop);
    }
}

window.RenderLoop = RenderLoop;
