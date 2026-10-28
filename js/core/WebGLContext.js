/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/core/WebGLContext.js
 * Descripción: Encapsula la inicialización y configuración del contexto WebGL2.
 *              (Paso 1: Inicialización WebGL2)
 * ===================================================================
 */

class WebGLContext {
    /**
     * @param {HTMLCanvasElement|string} canvasElementId Canvas o ID del canvas
     */
    constructor(canvasElementId = "glCanvas") {
        this.canvas = typeof canvasElementId === "string" 
            ? document.getElementById(canvasElementId) 
            : canvasElementId;

        if (!this.canvas) {
            throw new Error(`Canvas con identificador '${canvasElementId}' no encontrado.`);
        }

        // Obtener contexto WebGL2 (estándar moderno)
        this.gl = this.canvas.getContext("webgl2", {
            antialias: true,
            depth: true,
            stencil: false,
            powerPreference: "high-performance"
        });

        if (!this.gl) {
            alert("WebGL2 no está disponible en su navegador. Por favor use una versión moderna de Chrome, Edge o Firefox.");
            throw new Error("WebGL2 no soportado.");
        }

        this.initGLState();
    }

    /**
     * Configuración del estado inicial del pipeline gráfico
     */
    initGLState() {
        const gl = this.gl;
        
        // Ajustar viewport al tamaño interno del canvas
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Color de borrado lúgubre / noche cerrada (sección 8 del PDF)
        gl.clearColor(0.015, 0.018, 0.022, 1.0);

        // Habilitar Z-Buffer (test de profundidad para 3D)
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Habilitar mezcla de transparencias si es necesario
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    /**
     * Limpia los búferes de color y profundidad
     */
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    /**
     * Redimensiona el canvas y el viewport si la ventana cambia
     */
    resizeToDisplaySize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = Math.round(this.canvas.clientWidth * dpr);
        const displayHeight = Math.round(this.canvas.clientHeight * dpr);

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            return true;
        }
        return false;
    }
}

window.WebGLContext = WebGLContext;
