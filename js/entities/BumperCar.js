/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/entities/BumperCar.js
 * Descripción: Modelo 3D jerárquico del Carrito Chocón (Secciones 4, 5 y 9 del PDF).
 *              Implementa jerarquía de nodos Padre-Hijo:
 *              - Chasis Principal (Padre)
 *                ├── Parachoques perimetral de goma (Hijo rígido)
 *                ├── Capó delantero curvado y rejilla cromada (Hijo rígido)
 *                ├── Faros delanteros con bombillas emisivas (Hijo rígido)
 *                ├── Tablero y Volante inclinado de conducción (Hijo rígido)
 *                ├── Asiento y respaldo envolvente de cuero (Hijo rígido)
 *                ├── Asta / Antena eléctrica con gancho superior (Hijo rígido)
 *                └── 4 Ruedas rodantes (Hijos con rotación local independiente en eje X)
 * ===================================================================
 */

class BumperCar {
    /**
     * @param {Object} options Configuración del carrito
     * @param {number} options.x Posición inicial X
     * @param {number} options.z Posición inicial Z
     * @param {number} options.rumbo Ángulo de orientación inicial en radianes
     * @param {Array<number>} options.color Color RGB distintivo de la carrocería [r, g, b]
     * @param {boolean} options.isPlayer Indica si es el carrito controlado por el jugador
     */
    constructor({
        x = 0,
        z = 0,
        rumbo = 0,
        color = [0.92, 0.22, 0.22],
        isPlayer = false
    } = {}) {
        this.x = x;
        this.z = z;
        this.rumbo = rumbo;
        this.vel = 0;
        this.giroRuedas = 0;
        this.steerAngle = 0;
        this.color = color;
        this.isPlayer = isPlayer;

        // Estado inicial guardado para reinicio
        this.initialState = { x, z, rumbo, color };
    }

    /**
     * Reinicia el auto a su posición y estado inicial
     */
    reset() {
        this.x = this.initialState.x;
        this.z = this.initialState.z;
        this.rumbo = this.initialState.rumbo;
        this.vel = 0;
        this.giroRuedas = 0;
        this.steerAngle = 0;
    }

    /**
     * Dibuja una pieza individual con su matriz de transformación y material
     */
    static drawPart(gl, shader, geometry, modelMatrix, material) {
        material.apply(gl, shader);
        shader.setMatrix4("uModelMatrix", modelMatrix);

        // Matriz de normales: traspuesta de la inversa de la submatriz 3x3 de modelo
        // Para transformaciones con escala uniforme o rígidas, mat3(uModelMatrix) es suficiente
        const m = modelMatrix.elements;
        const normalMat = new Float32Array([
            m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[8], m[9], m[10]
        ]);
        shader.setMatrix3("uNormalMatrix", normalMat);

        geometry.draw();
    }

    /**
     * Renderiza el carrito con toda su jerarquía de piezas
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader
     * @param {Object} geometries Diccionario con geometrías compartidas
     * @param {Object} materials Diccionario con materiales compartidos
     */
    render(gl, shader, geometries, materials) {
        const { cube, sphere, cylinder, torus } = geometries;
        const {
            metal,
            rubber,
            grille,
            headlight,
            seatLeather,
            antennaMat,
            carPaint
        } = materials;

        // 1. MATRIZ PADRE: Transformación global del Chasis en el mundo (Traslación + Rotación Y)
        const parentMatrix = Matrix4.compose(
            Matrix4.translation(this.x, 0, this.z),
            Matrix4.rotationY(this.rumbo)
        );

        // Helper para componer una parte hija respecto a la matriz padre
        const child = (...transforms) => Matrix4.compose(parentMatrix, ...transforms);

        // --- A. PARACHOQUES PERIMETRAL DE GOMA (Bumper Ring) ---
        // Toroide aplanado que rodea la base del carrito a ras de suelo
        const bumperMat = child(
            Matrix4.translation(0, 0.28, 0.05),
            Matrix4.rotationX(Math.PI / 2),
            Matrix4.scaling(0.88, 1.15, 0.55) // Forma ovalada envolvente
        );
        BumperCar.drawPart(gl, shader, torus, bumperMat, rubber);

        // Falda inferior protectora
        const skirtMat = child(
            Matrix4.translation(0, 0.22, 0.05),
            Matrix4.scaling(1.4, 0.14, 1.85)
        );
        BumperCar.drawPart(gl, shader, cube, skirtMat, rubber);

        // --- B. CARROCERÍA VINTAGE CLÁSICA (Chasis) ---
        // Pintura con el color propio del auto
        const bodyMaterial = new Material({
            texture: carPaint.texture,
            color: this.color,
            shininess: 48.0,
            specularStrength: 0.85
        });

        // Capó delantero curvado (prismas y cilindro redondeado)
        const hoodMat = child(
            Matrix4.translation(0, 0.56, -0.42),
            Matrix4.scaling(1.15, 0.42, 0.95)
        );
        BumperCar.drawPart(gl, shader, cube, hoodMat, bodyMaterial);

        // Nariz redondeada frontal
        const noseMat = child(
            Matrix4.translation(0, 0.52, -0.92),
            Matrix4.scaling(0.55, 0.22, 0.25)
        );
        BumperCar.drawPart(gl, shader, sphere, noseMat, bodyMaterial);

        // Costados de la cabina
        for (const side of [-1, 1]) {
            const sideMat = child(
                Matrix4.translation(0.54 * side, 0.58, 0.15),
                Matrix4.scaling(0.14, 0.45, 0.85)
            );
            BumperCar.drawPart(gl, shader, cube, sideMat, bodyMaterial);
        }

        // Cubierta trasera del motor
        const rearDeckMat = child(
            Matrix4.translation(0, 0.62, 0.72),
            Matrix4.scaling(1.15, 0.45, 0.55)
        );
        BumperCar.drawPart(gl, shader, cube, rearDeckMat, bodyMaterial);

        // --- C. REJILLA FRONTAL CROMADA (Grille) ---
        // Detalle vintage con barras horizontales
        const grillMat = child(
            Matrix4.translation(0, 0.52, -0.93),
            Matrix4.scaling(0.68, 0.32, 0.05)
        );
        BumperCar.drawPart(gl, shader, cube, grillMat, grille);

        // --- D. FAROS DELANTEROS VINTAGE ---
        for (const side of [-1, 1]) {
            // Soporte cromado del faro
            const lightHousingMat = child(
                Matrix4.translation(0.42 * side, 0.58, -0.85),
                Matrix4.scaling(0.12, 0.12, 0.15)
            );
            BumperCar.drawPart(gl, shader, sphere, lightHousingMat, metal);

            // Bombilla emisiva brillante
            const lightLensMat = child(
                Matrix4.translation(0.42 * side, 0.58, -0.92),
                Matrix4.scaling(0.08, 0.08, 0.05)
            );
            BumperCar.drawPart(gl, shader, sphere, lightLensMat, headlight);
        }

        // --- E. COCKPIT: TABLERO, VOLANTE Y ASIENTO ---
        // Asiento y respaldo acolchado envolvente (negro/marrón)
        const seatBackMat = child(
            Matrix4.translation(0, 0.76, 0.48),
            Matrix4.scaling(0.95, 0.42, 0.18)
        );
        BumperCar.drawPart(gl, shader, cube, seatBackMat, seatLeather);

        const seatCushionMat = child(
            Matrix4.translation(0, 0.42, 0.18),
            Matrix4.scaling(0.95, 0.16, 0.52)
        );
        BumperCar.drawPart(gl, shader, cube, seatCushionMat, seatLeather);

        // Tablero frontal
        const dashMat = child(
            Matrix4.translation(0, 0.70, -0.06),
            Matrix4.rotationX(-0.35),
            Matrix4.scaling(0.85, 0.18, 0.28)
        );
        BumperCar.drawPart(gl, shader, cube, dashMat, metal);

        // Columna de dirección inclinada
        const steerColMat = child(
            Matrix4.translation(0, 0.72, -0.12),
            Matrix4.rotationX(-0.65),
            Matrix4.scaling(0.04, 0.35, 0.04)
        );
        BumperCar.drawPart(gl, shader, cylinder, steerColMat, metal);

        // Aro del volante
        const steerWheelMat = child(
            Matrix4.translation(0, 0.84, -0.04),
            Matrix4.rotationX(Math.PI / 2 - 0.65),
            Matrix4.scaling(0.24, 0.24, 0.08)
        );
        BumperCar.drawPart(gl, shader, torus, steerWheelMat, rubber);

        // --- F. ASTA / ANTENA ELÉCTRICA TRASERA (Trolley Pole) ---
        // Sección 4 y 9: Barra delgada vertical que conecta con el techo
        const poleMat = child(
            Matrix4.translation(0, 2.1, 0.88),
            Matrix4.scaling(0.035, 3.2, 0.035)
        );
        BumperCar.drawPart(gl, shader, cylinder, poleMat, antennaMat);

        // Gancho superior curvado que rozaría la rejilla electrificada
        const hookMat = child(
            Matrix4.translation(0, 3.75, 0.84),
            Matrix4.rotationX(0.7),
            Matrix4.scaling(0.03, 0.28, 0.03)
        );
        BumperCar.drawPart(gl, shader, cylinder, hookMat, antennaMat);

        // --- G. 4 RUEDAS RODANTES (Jerarquía con rotación independiente) ---
        // Sección 6 y 9 del PDF: Heredan posición del carrito pero rotan en eje X según velocidad
        const wheelOffsets = [
            { x: -0.58, z: -0.45, isFront: true },  // Delantera izquierda
            { x:  0.58, z: -0.45, isFront: true },  // Delantera derecha
            { x: -0.58, z:  0.52, isFront: false }, // Trasera izquierda
            { x:  0.58, z:  0.52, isFront: false }  // Trasera derecha
        ];

        wheelOffsets.forEach(w => {
            // Las ruedas delanteras pueden rotar un poco según la dirección del volante
            const steerTransform = w.isFront ? Matrix4.rotationY(this.steerAngle) : new Matrix4();

            // Transformación jerárquica de la rueda:
            // Posición en el chasis -> Giro de dirección -> Giro rodante local X -> Orientación cilindro
            const wheelMat = Matrix4.compose(
                parentMatrix,
                Matrix4.translation(w.x, 0.18, w.z),
                steerTransform,
                Matrix4.rotationX(this.giroRuedas),
                Matrix4.rotationZ(Math.PI / 2),
                Matrix4.scaling(0.38, 0.16, 0.38)
            );

            BumperCar.drawPart(gl, shader, cylinder, wheelMat, rubber);

            // Tapa de llanta central cromada
            const hubMat = Matrix4.compose(
                parentMatrix,
                Matrix4.translation(w.x + Math.sign(w.x) * 0.08, 0.18, w.z),
                steerTransform,
                Matrix4.rotationX(this.giroRuedas),
                Matrix4.scaling(0.08, 0.14, 0.14)
            );
            BumperCar.drawPart(gl, shader, sphere, hubMat, metal);
        });
    }
}

window.BumperCar = BumperCar;
