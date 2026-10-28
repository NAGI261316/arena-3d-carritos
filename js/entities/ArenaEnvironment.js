/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/entities/ArenaEnvironment.js
 * Descripción: Modela y renderiza el entorno completo del recinto:
 *              - Suelo de baldosas industriales oscuras
 *              - Techo de vigas de hormigón con focos direccionales colgados (tecla T)
 *              - Muros con mural artístico y ventilador industrial
 *              - Mirador lateral abierto a la feria nocturna (guirnaldas luminosas)
 *              - Plataforma central elevada con superficie verde neón y tubos (tecla Y)
 *              - Columnas de soporte y marquesina con tubos fluorescentes
 *              - Neumáticos de protección en el perímetro de la plataforma
 *              - Colección de carritos bots estacionados en la pista
 * ===================================================================
 */

class ArenaEnvironment {
    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl) {
        this.gl = gl;

        // Autos bots distribuidos en la pista (como en las capturas de pantalla)
        this.bots = [
            new BumperCar({ x: -6.2, z: -5.0, rumbo: 0.6, color: [0.88, 0.18, 0.18] }), // Rojo
            new BumperCar({ x:  5.2, z: -6.8, rumbo: -1.2, color: [0.22, 0.45, 0.88] }), // Azul
            new BumperCar({ x:  7.0, z:  4.2, rumbo: 2.5, color: [0.92, 0.78, 0.18] }), // Amarillo
            new BumperCar({ x: -7.0, z:  6.0, rumbo: 3.8, color: [0.85, 0.88, 0.90] }), // Blanco vintage
            new BumperCar({ x:  0.0, z: -8.8, rumbo: 0.2, color: [0.22, 0.45, 0.88] }), // Azul
            new BumperCar({ x: -9.2, z: -1.2, rumbo: 1.7, color: [0.92, 0.78, 0.18] }), // Amarillo
            new BumperCar({ x:  8.5, z: -2.0, rumbo: -2.4, color: [0.88, 0.18, 0.18] }) // Rojo
        ];

        // Lista de obstáculos físicos para colisión circular {x, z, radius}
        this.obstacles = [
            // Columnas de la plataforma central
            { x: -2.6, z: 0, radius: 0.6 },
            { x:  2.6, z: 0, radius: 0.6 },
            // Borde largo de la plataforma
            { x: 0, z: 0, radius: 1.4 },
            // Autos bots
            ...this.bots.map(b => ({ x: b.x, z: b.z, radius: 0.95 }))
        ];

        // Neumáticos decorativos en la base de la plataforma central
        this.platformTires = [
            { x: -1.2, z:  1.6, r: 0 },
            { x:  1.2, z:  1.6, r: 0 },
            { x: -1.2, z: -1.6, r: 0 },
            { x:  1.2, z: -1.6, r: 0 }
        ];

        // Coordenadas de los focos direccionales colgados en el techo principal
        this.roofSpotlights = [
            { x: -6.0, z: -6.0 }, // Cuadrante Noroeste
            { x:  6.0, z: -6.0 }, // Cuadrante Noreste
            { x: -6.0, z:  6.0 }, // Cuadrante Suroeste
            { x:  6.0, z:  6.0 }  // Cuadrante Sureste
        ];
    }

    /**
     * Dibuja un objeto cúbico posicionado y escalado
     */
    drawBox(gl, shader, cubeGeom, mat, x, y, z, sx, sy, sz) {
        const modelMatrix = Matrix4.compose(
            Matrix4.translation(x, y, z),
            Matrix4.scaling(sx, sy, sz)
        );
        BumperCar.drawPart(gl, shader, cubeGeom, modelMatrix, mat);
    }

    /**
     * Renderiza todo el escenario 3D
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader
     * @param {Object} geometries
     * @param {Object} materials
     * @param {Object} lightingState Estado de encendido de luces { mainRoofOn, miniRoofOn }
     */
    render(gl, shader, geometries, materials, lightingState = { mainRoofOn: true, miniRoofOn: true }) {
        const { cube, cylinder, torus, sphere } = geometries;
        const {
            floor,
            ceiling,
            wallMural,
            wallVent,
            outdoorFair,
            neonPlatform,
            neonPlatformOff,
            neonTube,
            neonTubeOff,
            roofSpotBulbOn,
            roofSpotBulbOff,
            metal,
            rubber
        } = materials;

        // 1. PISTA / SUELO DE BALDOSAS INDUSTRIALES (26 x 26 metros)
        this.drawBox(gl, shader, cube, floor, 0, -0.1, 0, 26, 0.2, 26);

        // 2. TECHO DE HORMIGÓN INDUSTRIAL
        this.drawBox(gl, shader, cube, ceiling, 0, 4.15, 0, 26, 0.2, 26);

        // 3. MUROS PERIMETRALES
        const wallH = 4.0;
        const wallY = 2.0;

        // Muro de fondo (-Z): Mural decorativo de pinos otoñales
        this.drawBox(gl, shader, cube, wallMural, -4.5, wallY, -12.1, 15.6, wallH, 0.3);
        // Sección con ventilador industrial en el muro de fondo
        this.drawBox(gl, shader, cube, wallVent, 6.0, wallY, -12.1, 6.0, wallH, 0.3);
        this.drawBox(gl, shader, cube, wallMural, 10.5, wallY, -12.1, 3.2, wallH, 0.3);

        // Muro delantero (+Z): Mural
        this.drawBox(gl, shader, cube, wallMural, 0, wallY, 12.1, 24.6, wallH, 0.3);

        // Muro izquierdo (-X): Mural
        this.drawBox(gl, shader, cube, wallMural, -12.1, wallY, 0, 0.3, wallH, 24.6);

        // Muro derecho (+X): Mirador abierto a la feria nocturna con guirnaldas
        this.drawBox(gl, shader, cube, outdoorFair, 12.1, wallY, 0, 0.3, wallH, 24.6);

        // Guardarraíles / zócalos protectores de goma en el contorno del suelo
        this.drawBox(gl, shader, cube, rubber, 0, 0.15, -11.8, 24.0, 0.3, 0.25);
        this.drawBox(gl, shader, cube, rubber, 0, 0.15,  11.8, 24.0, 0.3, 0.25);
        this.drawBox(gl, shader, cube, rubber, -11.8, 0.15, 0, 0.25, 0.3, 24.0);
        this.drawBox(gl, shader, cube, rubber,  11.8, 0.15, 0, 0.25, 0.3, 24.0);

        // 4. PLATAFORMA CENTRAL ELEVADA (MINITECHO)
        // Base de hormigón oscuro
        this.drawBox(gl, shader, cube, metal, 0, 0.08, 0, 6.4, 0.16, 3.4);
        // Superficie verde esmeralda (brillante si miniRoofOn está activo, o apagada si no)
        const activePlatformMat = lightingState.miniRoofOn ? neonPlatform : neonPlatformOff;
        this.drawBox(gl, shader, cube, activePlatformMat, 0, 0.17, 0, 6.1, 0.04, 3.1);

        // Columnas cilíndricas que sostienen la marquesina del minitecho
        for (const sx of [-1, 1]) {
            const colMat = Matrix4.compose(
                Matrix4.translation(2.6 * sx, 1.75, 0),
                Matrix4.scaling(0.9, 3.4, 0.9)
            );
            BumperCar.drawPart(gl, shader, cylinder, colMat, metal);
        }

        // Techo / Marquesina superior de la plataforma
        this.drawBox(gl, shader, cube, metal, 0, 3.5, 0, 6.6, 0.25, 3.6);

        // Moldura perimetral verde neón en el borde del techo de la plataforma
        this.drawBox(gl, shader, cube, activePlatformMat, 0, 3.38, 0, 6.7, 0.06, 3.7);

        // Tubos fluorescentes de neón colgados bajo la marquesina (controlados por tecla Y)
        const activeNeonTubeMat = lightingState.miniRoofOn ? neonTube : neonTubeOff;
        for (const dz of [-0.65, 0.65]) {
            const neonMat = Matrix4.compose(
                Matrix4.translation(0, 3.28, dz),
                Matrix4.rotationZ(Math.PI / 2),
                Matrix4.scaling(0.08, 5.2, 0.08)
            );
            BumperCar.drawPart(gl, shader, cylinder, neonMat, activeNeonTubeMat);
        }

        // Neumáticos de seguridad dispuestos en el suelo junto a la plataforma
        this.platformTires.forEach(t => {
            const tireMat = Matrix4.compose(
                Matrix4.translation(t.x, 0.14, t.z),
                Matrix4.rotationX(Math.PI / 2),
                Matrix4.scaling(0.55, 0.55, 0.45)
            );
            BumperCar.drawPart(gl, shader, torus, tireMat, rubber);
        });

        // 5. FOCOS DIRECCIONALES EN EL TECHO PRINCIPAL (Controlados por tecla T)
        const activeBulbMat = lightingState.mainRoofOn ? roofSpotBulbOn : roofSpotBulbOff;
        this.roofSpotlights.forEach(spot => {
            // Vástago vertical de suspensión fijado al techo
            const stemMat = Matrix4.compose(
                Matrix4.translation(spot.x, 3.92, spot.z),
                Matrix4.scaling(0.03, 0.45, 0.03)
            );
            BumperCar.drawPart(gl, shader, cylinder, stemMat, metal);

            // Campana / pantalla reflectora cónica orientada hacia abajo
            const hoodMat = Matrix4.compose(
                Matrix4.translation(spot.x, 3.70, spot.z),
                Matrix4.scaling(0.60, 0.22, 0.60)
            );
            BumperCar.drawPart(gl, shader, cylinder, hoodMat, metal);

            // Bombilla emisiva del foco (brilla cuando mainRoofOn está activo)
            const bulbMat = Matrix4.compose(
                Matrix4.translation(spot.x, 3.60, spot.z),
                Matrix4.scaling(0.25, 0.08, 0.25)
            );
            BumperCar.drawPart(gl, shader, sphere, bulbMat, activeBulbMat);
        });

        // 6. RENDERIZADO DE LOS CARRITOS BOTS ESTACIONADOS
        for (const bot of this.bots) {
            bot.render(gl, shader, geometries, materials);
        }
    }
}

window.ArenaEnvironment = ArenaEnvironment;
