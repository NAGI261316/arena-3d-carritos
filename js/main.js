/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Estudiante: Quispe Quispe Jefferson Christian - Código: 236722
 * Archivo: js/main.js
 * Descripción: Módulo principal integrador (Paso 16: Mini Motor Gráfico).
 *              Inicializa el contexto WebGL2, shaders, geometrías, texturas,
 *              cámara, física, controles de iluminación (teclas T e Y)
 *              y ejecuta el bucle interactivo de simulación.
 * ===================================================================
 */

(function () {
    "use strict";

    // 1. INICIALIZACIÓN DEL CONTEXTO WEBGL2 (Paso 1)
    const glContext = new WebGLContext("glCanvas");
    const gl = glContext.gl;

    // 2. COMPILACIÓN Y ENLACE DE SHADERS (Paso 2 y Paso 8)
    const shader = new ShaderProgram(gl, Shaders.vertex, Shaders.fragment);
    shader.use();

    // 3. GEOMETRÍAS PARAMÉTRICAS REUTILIZABLES (Pasos 5 y 7)
    const geometries = {
        cube: new CubeGeometry(gl, 1.0, 1.0, 1.0),
        sphere: new SphereGeometry(gl, 1.0, 24, 24),
        cylinder: new CylinderGeometry(gl, 0.5, 0.5, 1.0, 24),
        torus: new TorusGeometry(gl, 0.85, 0.25, 16, 24)
    };

    // 4. GENERACIÓN DE TEXTURAS PROCEDURALES (Pasos 9 y 10)
    const textures = {
        floor: TextureGenerator.createFloorTiles(gl),
        wallMural: TextureGenerator.createWallMural(gl),
        wallVent: TextureGenerator.createWallWithVent(gl),
        outdoorFair: TextureGenerator.createOutdoorFair(gl),
        ceiling: TextureGenerator.createCeiling(gl),
        neonPlatform: TextureGenerator.createNeonPlatform(gl),
        neonTube: TextureGenerator.createNeonTube(gl),
        metal: TextureGenerator.createBrushedMetal(gl),
        rubber: TextureGenerator.createRubber(gl),
        grille: TextureGenerator.createCarGrille(gl)
    };

    // 5. DEFINICIÓN DE MATERIALES CON ILUMINACIÓN BLINN-PHONG
    const materials = {
        floor: new Material({
            texture: textures.floor,
            color: [1.0, 1.0, 1.0],
            uvScale: [8.0, 8.0],
            shininess: 40.0,
            specularStrength: 0.7
        }),
        ceiling: new Material({
            texture: textures.ceiling,
            color: [0.75, 0.78, 0.8],
            uvScale: [4.0, 4.0],
            shininess: 10.0,
            specularStrength: 0.1
        }),
        wallMural: new Material({
            texture: textures.wallMural,
            color: [1.0, 1.0, 1.0],
            uvScale: [3.0, 1.0],
            shininess: 16.0,
            specularStrength: 0.2
        }),
        wallVent: new Material({
            texture: textures.wallVent,
            color: [1.0, 1.0, 1.0],
            uvScale: [1.0, 1.0],
            shininess: 24.0,
            specularStrength: 0.4
        }),
        outdoorFair: new Material({
            texture: textures.outdoorFair,
            color: [1.1, 1.1, 1.05],
            uvScale: [2.5, 1.0],
            shininess: 32.0,
            specularStrength: 0.3
        }),
        // Minitecho: superficie verde neón encendida
        neonPlatform: new Material({
            texture: textures.neonPlatform,
            color: [0.6, 1.3, 0.8],
            uvScale: [2.0, 1.0],
            shininess: 64.0,
            specularStrength: 1.0
        }),
        // Minitecho: superficie verde neón apagada
        neonPlatformOff: new Material({
            texture: textures.neonPlatform,
            color: [0.22, 0.42, 0.28],
            uvScale: [2.0, 1.0],
            shininess: 16.0,
            specularStrength: 0.2
        }),
        // Minitecho: tubos de neón encendidos
        neonTube: new Material({
            texture: textures.neonTube,
            color: [0.8, 1.0, 0.9],
            emissive: true
        }),
        // Minitecho: tubos de neón apagados
        neonTubeOff: new Material({
            texture: textures.metal,
            color: [0.22, 0.28, 0.24],
            emissive: false,
            shininess: 12.0,
            specularStrength: 0.2
        }),
        // Techo principal: bombillas de focos encendidas (blanco cálido emisivo)
        roofSpotBulbOn: new Material({
            texture: textures.neonTube,
            color: [1.4, 1.35, 1.15],
            emissive: true
        }),
        // Techo principal: bombillas de focos apagadas
        roofSpotBulbOff: new Material({
            texture: textures.rubber,
            color: [0.12, 0.12, 0.14],
            emissive: false,
            shininess: 8.0,
            specularStrength: 0.1
        }),
        metal: new Material({
            texture: textures.metal,
            color: [0.85, 0.88, 0.90],
            shininess: 32.0,
            specularStrength: 0.6
        }),
        rubber: new Material({
            texture: textures.rubber,
            color: [0.2, 0.2, 0.2],
            shininess: 8.0,
            specularStrength: 0.15
        }),
        grille: new Material({
            texture: textures.grille,
            color: [1.0, 1.0, 1.0],
            shininess: 64.0,
            specularStrength: 1.0
        }),
        headlight: new Material({
            texture: textures.neonTube,
            color: [1.4, 1.35, 1.1],
            emissive: true
        }),
        seatLeather: new Material({
            texture: textures.rubber,
            color: [0.18, 0.16, 0.15],
            shininess: 12.0,
            specularStrength: 0.25
        }),
        antennaMat: new Material({
            texture: textures.metal,
            color: [0.95, 0.82, 0.20], // Amarillo metálico
            shininess: 48.0,
            specularStrength: 0.8
        }),
        carPaint: new Material({
            texture: textures.metal,
            color: [1.0, 1.0, 1.0],
            shininess: 48.0,
            specularStrength: 0.85
        })
    };

    // 6. ADMINISTRADOR DE ENTRADA Y CONTROLES (Teclado, Mouse Look, Zoom)
    const inputManager = new InputManager(glContext.canvas);

    // 7. CÁMARA (FPS 1ª persona en cabina por defecto, y 3ª persona con tecla C)
    const camera = new Camera({
        fovDegrees: 70,
        aspectRatio: glContext.canvas.width / glContext.canvas.height
    });

    // 8. MOTOR FÍSICO DE DINÁMICA VEHICULAR Y COLISIONES
    const physics = new PhysicsEngine();

    // 9. ENTIDAD DEL JUGADOR: CARRITO CHOCÓN CONTROLABLE
    const playerCar = new BumperCar({
        x: 0.0,
        z: 8.8,
        rumbo: 0.0,
        color: [0.88, 0.18, 0.18], // Rojo brillante vintage
        isPlayer: true
    });

    // 10. ENTORNO ARQUITECTÓNICO DE LA ARENA
    const arena = new ArenaEnvironment(gl);

    // ESTADOS DE CONTROL DE ILUMINACIÓN
    // Tecla T: Techo principal (todos los focos direccionales)
    // Tecla Y: Minitecho (marquesina y tubos de neón de la plataforma)
    let mainRoofLightsOn = true;
    let miniRoofLightsOn = true;

    // Actualización de elementos HUD de la interfaz
    const hudCameraIndicator = document.getElementById("hudCameraIndicator");
    const hudRoofIndicator = document.getElementById("hudRoofIndicator");
    const hudMiniRoofIndicator = document.getElementById("hudMiniRoofIndicator");

    const updateCameraHUD = () => {
        if (hudCameraIndicator) {
            hudCameraIndicator.textContent = camera.isThirdPerson 
                ? "Cámara: 3ª Persona (Externa)" 
                : "Cámara: 1ª Persona (Conductor)";
        }
    };

    const updateLightingHUD = () => {
        if (hudRoofIndicator) {
            hudRoofIndicator.textContent = `Luz Techo: ${mainRoofLightsOn ? "ENCENDIDA" : "APAGADA"}`;
            hudRoofIndicator.className = mainRoofLightsOn ? "badge-luz activa" : "badge-luz inactiva";
        }
        if (hudMiniRoofIndicator) {
            hudMiniRoofIndicator.textContent = `Luz Minitecho: ${miniRoofLightsOn ? "ENCENDIDA" : "APAGADA"}`;
            hudMiniRoofIndicator.className = miniRoofLightsOn ? "badge-luz activa-verde" : "badge-luz inactiva";
        }
    };

    // Conectar eventos de teclado con el InputManager
    inputManager.onToggleCamera = () => {
        camera.toggleMode();
        updateCameraHUD();
    };

    inputManager.onReset = () => {
        playerCar.reset();
        inputManager.resetLook();
    };

    inputManager.onToggleMainRoofLights = () => {
        mainRoofLightsOn = !mainRoofLightsOn;
        updateLightingHUD();
    };

    inputManager.onToggleMiniRoofLights = () => {
        miniRoofLightsOn = !miniRoofLightsOn;
        updateLightingHUD();
    };

    // 11. SISTEMA DE ILUMINACIÓN DINÁMICA (7 Fuentes de Luz)
    // - Luz 0: Minitecho (neón verde central) [Control tecla Y]
    // - Luces 1 a 4: Cuatro focos direccionales en el techo principal (Spotlights) [Control tecla T]
    // - Luz 5: Faros delanteros del carrito del jugador (luz móvil)
    // - Luz 6: Resplandor ambiental de la feria exterior
    const NUM_LUCES = 7;
    const lightPositions = new Float32Array(NUM_LUCES * 3);
    const lightColors = new Float32Array(NUM_LUCES * 3);
    const lightIntensities = new Float32Array(NUM_LUCES);
    const lightDirs = new Float32Array(NUM_LUCES * 3);
    const lightTypes = new Int32Array(NUM_LUCES);      // 0: Puntual, 1: Foco Direccional (Spotlight)
    const lightCutoffs = new Float32Array(NUM_LUCES);

    // --- Configuración Luz 0: Minitecho (Plataforma Central) ---
    lightPositions[0] = 0.0; lightPositions[1] = 3.2; lightPositions[2] = 0.0;
    lightColors[0] = 0.35 * 2.8; lightColors[1] = 1.15 * 2.8; lightColors[2] = 0.72 * 2.8;
    lightDirs[0] = 0.0; lightDirs[1] = -1.0; lightDirs[2] = 0.0;
    lightTypes[0] = 0; // Puntual omnidireccional
    lightCutoffs[0] = 0.0;

    // --- Configuración Luces 1..4: Focos Direccionales en el Techo Principal ---
    const roofSpots = arena.roofSpotlights;
    roofSpots.forEach((spot, idx) => {
        const i = 1 + idx;
        const i3 = i * 3;
        lightPositions[i3 + 0] = spot.x;
        lightPositions[i3 + 1] = 3.8;
        lightPositions[i3 + 2] = spot.z;

        // Tono blanco/cálido de foco reflector
        lightColors[i3 + 0] = 1.35;
        lightColors[i3 + 1] = 1.30;
        lightColors[i3 + 2] = 1.12;

        // Haz apuntando verticalmente hacia el suelo
        lightDirs[i3 + 0] = 0.0;
        lightDirs[i3 + 1] = -1.0;
        lightDirs[i3 + 2] = 0.0;

        lightTypes[i] = 1;      // Foco direccional cónico (Spotlight)
        lightCutoffs[i] = 0.76; // Semi-ángulo cónico de ~40° para amplio cono sobre el suelo
    });

    // --- Configuración Luz 5: Faro del auto del jugador ---
    lightColors[15] = 1.4; lightColors[16] = 1.35; lightColors[17] = 1.1;
    lightDirs[15] = 0.0; lightDirs[16] = 0.0; lightDirs[17] = -1.0;
    lightTypes[5] = 0; // Puntual móvil
    lightCutoffs[5] = 0.0;
    lightIntensities[5] = 1.8;

    // --- Configuración Luz 6: Feria nocturna exterior ---
    lightPositions[18] = 9.0; lightPositions[19] = 2.5; lightPositions[20] = 0.0;
    lightColors[18] = 0.85; lightColors[19] = 0.55; lightColors[20] = 0.25;
    lightDirs[18] = 0.0; lightDirs[19] = 0.0; lightDirs[20] = 0.0;
    lightTypes[6] = 0;
    lightCutoffs[6] = 0.0;
    lightIntensities[6] = 1.2;

    // 12. ACTUALIZACIÓN LÓGICA Y FÍSICA (Cada frame con dt)
    function update(dt) {
        const throttle = inputManager.getThrottle();
        const steer = inputManager.getSteer();

        // Actualizar física de traslación, giro y colisiones
        physics.updateCar(playerCar, throttle, steer, dt, arena.obstacles);

        // Actualizar cámara LookAt y perspectiva
        camera.update(playerCar, inputManager, glContext.canvas.width, glContext.canvas.height);

        // Actualizar estados de encendido de luces
        // Luz 0: Minitecho (tecla Y)
        lightIntensities[0] = miniRoofLightsOn ? 2.4 : 0.0;

        // Luces 1..4: Focos direccionales del techo principal (tecla T)
        const mainRoofIntensity = mainRoofLightsOn ? 2.2 : 0.0;
        for (let i = 1; i <= 4; i++) {
            lightIntensities[i] = mainRoofIntensity;
        }

        // Luz 5: Actualizar posición del faro del auto del jugador
        const fwdX = -Math.sin(playerCar.rumbo);
        const fwdZ = -Math.cos(playerCar.rumbo);
        lightPositions[15] = playerCar.x + fwdX * 0.95;
        lightPositions[16] = 0.65;
        lightPositions[17] = playerCar.z + fwdZ * 0.95;
    }

    // 13. RENDERIZADO GRÁFICO (WebGL2)
    function render(totalTime) {
        glContext.resizeToDisplaySize();
        glContext.clear();

        shader.use();

        // Pasar matrices de Cámara a los shaders (Paso 6)
        shader.setMatrix4("uViewMatrix", camera.viewMatrix);
        shader.setMatrix4("uProjectionMatrix", camera.projectionMatrix);
        shader.setVector3("uCameraPosition", camera.eye);

        // Pasar sistema de luces dinámicas con atenuación y focos direccionales (Pasos 8 y 12)
        shader.setVector3Array("uLightPos[0]", lightPositions);
        shader.setVector3Array("uLightColor[0]", lightColors);
        shader.setFloatArray("uLightIntensity[0]", lightIntensities);
        shader.setVector3Array("uLightDir[0]", lightDirs);
        shader.setIntArray("uLightType[0]", lightTypes);
        shader.setFloatArray("uLightCutoff[0]", lightCutoffs);

        // 1. Renderizar el entorno completo de la arena pasando el estado de luces
        arena.render(gl, shader, geometries, materials, {
            mainRoofOn: mainRoofLightsOn,
            miniRoofOn: miniRoofLightsOn
        });

        // 2. Renderizar el carrito del jugador
        playerCar.render(gl, shader, geometries, materials);
    }

    // 14. INICIO DEL CICLO DE ANIMACIÓN
    const renderLoop = new RenderLoop(update, render);
    renderLoop.start();

    // Actualizar indicadores HUD iniciales
    updateCameraHUD();
    updateLightingHUD();

    console.log("Arena 3D de Carritos Chocones inicializada con éxito.");
})();