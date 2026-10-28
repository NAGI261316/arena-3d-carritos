/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/materials/Shaders.js
 * Descripción: Fuentes GLSL 300 es para Vertex Shader y Fragment Shader.
 *              Incluye cálculo de normales, iluminación difusa + Blinn-Phong,
 *              atenuación cuadrática para luces puntuales y soporte de
 *              focos direccionales en el techo (Spotlights) y luces emisivas.
 * ===================================================================
 */

const Shaders = {
    // ---------------------------------------------------------------
    // VERTEX SHADER (GLSL 3.00 ES)
    // ---------------------------------------------------------------
    vertex: `#version 300 es
    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec3 aNormal;
    layout(location = 2) in vec2 aTexCoord;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;
    uniform vec2 uUVScale;

    out vec3 vNormal;
    out vec3 vWorldPosition;
    out vec2 vTexCoord;

    void main() {
        vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
        vWorldPosition = worldPosition.xyz;
        
        // Transformación de la normal con la matriz de normales
        vNormal = normalize(uNormalMatrix * aNormal);
        
        // Escalado de coordenadas de textura (tiling / repetición)
        vTexCoord = aTexCoord * uUVScale;
        
        // Posición proyectada en clip-space
        gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    }`,

    // ---------------------------------------------------------------
    // FRAGMENT SHADER (GLSL 3.00 ES)
    // ---------------------------------------------------------------
    fragment: `#version 300 es
    precision highp float;

    in vec3 vNormal;
    in vec3 vWorldPosition;
    in vec2 vTexCoord;

    uniform sampler2D uTexture;
    uniform vec3 uColor;
    uniform bool uEmissive;
    uniform float uShininess;
    uniform float uSpecularStrength;
    uniform vec3 uCameraPosition;

    // Sistema de hasta 7 luces dinámicas (puntuales y focos direccionales)
    #define NUM_LUCES 7
    uniform vec3 uLightPos[NUM_LUCES];
    uniform vec3 uLightColor[NUM_LUCES];
    uniform float uLightIntensity[NUM_LUCES];
    uniform vec3 uLightDir[NUM_LUCES];        // Dirección del haz (para focos direccionales)
    uniform int uLightType[NUM_LUCES];       // 0: Puntual, 1: Foco Direccional (Spotlight), 2: Direccional
    uniform float uLightCutoff[NUM_LUCES];   // Coseno del ángulo de corte del cono de luz

    out vec4 outColor;

    void main() {
        // Si el objeto es emisivo (tubos de neón encendidos, focos de techo encendidos, faros),
        // emite su color directamente sin verse atenuado por sombras
        if (uEmissive) {
            vec4 tex = texture(uTexture, vTexCoord);
            outColor = vec4(tex.rgb * uColor, 1.0);
            return;
        }

        vec4 texColor = texture(uTexture, vTexCoord);
        vec3 albedo = texColor.rgb * uColor;
        vec3 N = normalize(vNormal);
        vec3 V = normalize(uCameraPosition - vWorldPosition);

        // Luz ambiental base para atmósfera tenue de recinto cerrado
        vec3 iluminacionTotal = vec3(0.025, 0.028, 0.032);

        for (int i = 0; i < NUM_LUCES; i++) {
            float intensidad = uLightIntensity[i];
            if (intensidad <= 0.001) continue;

            vec3 L;
            float factorAtenuacion = 1.0;
            float factorDireccional = 1.0;

            if (uLightType[i] == 2) {
                // Luz direccional pura (rayos paralelos desde uLightDir[i])
                L = normalize(-uLightDir[i]);
                factorAtenuacion = 1.0;
            } else {
                // Luz puntual o foco cónico ubicado en uLightPos[i]
                vec3 haciaLuz = uLightPos[i] - vWorldPosition;
                float distancia = length(haciaLuz);
                if (distancia < 0.0001) continue;

                L = haciaLuz / distancia;

                // Atenuación cuadrática con la distancia (Pasos 8 y 12)
                factorAtenuacion = 1.0 / (1.0 + 0.08 * distancia + 0.03 * distancia * distancia);

                // Si es un FOCO DIRECCIONAL (Spotlight cónico en el techo)
                if (uLightType[i] == 1) {
                    vec3 dirFoco = normalize(uLightDir[i]);
                    // Ángulo entre la dirección del foco y el rayo hacia el fragmento
                    float cosTheta = dot(-L, dirFoco);
                    float cutoff = uLightCutoff[i];
                    float outerCutoff = cutoff - 0.14; // Penumbra suave en el borde del cono
                    factorDireccional = clamp((cosTheta - outerCutoff) / (cutoff - outerCutoff), 0.0, 1.0);
                    if (factorDireccional <= 0.0) continue;
                }
            }

            // 1. Difusa de Lambert
            float difusa = max(dot(N, L), 0.0);

            // 2. Especular Blinn-Phong
            vec3 H = normalize(L + V);
            float specFactor = pow(max(dot(N, H), 0.0), uShininess);
            vec3 especular = uLightColor[i] * specFactor * uSpecularStrength;

            iluminacionTotal += (uLightColor[i] * difusa + especular) * factorAtenuacion * factorDireccional * intensidad;
        }

        vec3 colorFinal = albedo * iluminacionTotal;
        outColor = vec4(colorFinal, 1.0);
    }`
};

window.Shaders = Shaders;
