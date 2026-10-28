/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/materials/TextureGenerator.js
 * Descripción: Generador de texturas procedurales 2D mediante Canvas API
 *              y subida a texturas WebGL2 con Mipmapping (Paso 9 y 10).
 *              Recrea con fidelidad la atmósfera de las capturas de pantalla.
 * ===================================================================
 */

class TextureGenerator {
    /**
     * Crea y sube una textura a WebGL2 a partir de una función de dibujo 2D
     * @param {WebGL2RenderingContext} gl Contexto WebGL2
     * @param {Function} drawFn Función que dibuja en el contexto 2D (ctx, w, h)
     * @param {number} width Ancho en píxeles (potencia de 2)
     * @param {number} height Alto en píxeles (potencia de 2)
     * @returns {WebGLTexture}
     */
    static create(gl, drawFn, width = 512, height = 512) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Ejecutar rutina de dibujo
        drawFn(ctx, width, height);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        return texture;
    }

    /**
     * Textura de baldosas industriales para el suelo de la pista
     * (Planchas metálicas/cemento oscuro con juntas y reflejos tenues)
     */
    static createFloorTiles(gl) {
        return this.create(gl, (ctx, w, h) => {
            // Fondo base gris oscuro industrial
            ctx.fillStyle = "#1e2225";
            ctx.fillRect(0, 0, w, h);

            // Rejilla de 4x4 losas metálicas por textura
            const cols = 4, rows = 4;
            const tileW = w / cols, tileH = h / rows;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * tileW, y = j * tileH;
                    // Gradiente sutil para relieve de cada baldosa
                    const grad = ctx.createLinearGradient(x, y, x + tileW, y + tileH);
                    const shade = 28 + ((i + j) % 3) * 6;
                    grad.addColorStop(0, `rgb(${shade + 10}, ${shade + 12}, ${shade + 14})`);
                    grad.addColorStop(1, `rgb(${shade - 5}, ${shade - 3}, ${shade})`);

                    ctx.fillStyle = grad;
                    ctx.fillRect(x + 2, y + 2, tileW - 4, tileH - 4);

                    // Micro-arañazos y desgaste industrial
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
                    ctx.lineWidth = 1;
                    for (let s = 0; s < 8; s++) {
                        const sx = x + Math.random() * tileW;
                        const sy = y + Math.random() * tileH;
                        ctx.beginPath();
                        ctx.moveTo(sx, sy);
                        ctx.lineTo(sx + (Math.random() - 0.5) * 35, sy + (Math.random() - 0.5) * 35);
                        ctx.stroke();
                    }
                }
            }

            // Ranuras y juntas oscuras de separación
            ctx.strokeStyle = "#08090a";
            ctx.lineWidth = 4;
            for (let i = 0; i <= cols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * tileW, 0);
                ctx.lineTo(i * tileW, h);
                ctx.stroke();
            }
            for (let j = 0; j <= rows; j++) {
                ctx.beginPath();
                ctx.moveTo(0, j * tileH);
                ctx.lineTo(w, j * tileH);
                ctx.stroke();
            }
        }, 512, 512);
    }

    /**
     * Textura del mural artístico de las paredes del fondo
     * (Paisaje otoñal de pinos estilizados en tonos sepia, naranja y negro)
     */
    static createWallMural(gl) {
        return this.create(gl, (ctx, w, h) => {
            // Fondo con degradado de atardecer crepuscular (cálido sepia/ámbar)
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, "#2c2a22");
            sky.addColorStop(0.3, "#544636");
            sky.addColorStop(0.7, "#734e34");
            sky.addColorStop(1, "#38291f");
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);

            // Montañas y colinas de fondo
            ctx.fillStyle = "#8a5839";
            ctx.beginPath();
            ctx.moveTo(0, h * 0.7);
            ctx.lineTo(w * 0.25, h * 0.45);
            ctx.lineTo(w * 0.5, h * 0.65);
            ctx.lineTo(w * 0.75, h * 0.4);
            ctx.lineTo(w, h * 0.7);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.fill();

            // Función para dibujar un pino puntiagudo estilizado (estilo de la captura)
            const drawPine = (cx, baseY, treeW, treeH, color) => {
                ctx.fillStyle = color;
                // Tronco
                ctx.fillRect(cx - treeW * 0.08, baseY - treeH * 0.2, treeW * 0.16, treeH * 0.2);
                // Capas triangulares del pino
                const layers = 4;
                for (let l = 0; l < layers; l++) {
                    const layerY = baseY - treeH * 0.15 - (l / layers) * (treeH * 0.85);
                    const layerW = treeW * (1.0 - l * 0.18);
                    const layerH = treeH * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(cx, layerY - layerH);
                    ctx.lineTo(cx + layerW * 0.5, layerY);
                    ctx.lineTo(cx - layerW * 0.5, layerY);
                    ctx.closePath();
                    ctx.fill();
                }
            };

            // Capa 1: Pinos de término medio en color naranja/rojizo quemado
            const numMidTrees = 12;
            for (let i = 0; i < numMidTrees; i++) {
                const tx = (i / numMidTrees) * w + (Math.sin(i * 3) * 15);
                drawPine(tx, h * 0.82, 45, 130 + (i % 3) * 25, "rgba(175, 75, 40, 0.85)");
            }

            // Capa 2: Pinos en primer plano en silueta oscura/negra
            const numFrontTrees = 8;
            for (let i = 0; i < numFrontTrees; i++) {
                const tx = ((i + 0.5) / numFrontTrees) * w + (Math.cos(i * 2.5) * 20);
                drawPine(tx, h * 0.92, 65, 170 + (i % 2) * 40, "#121415");
            }

            // Zócalo inferior oscuro de desgaste
            ctx.fillStyle = "rgba(10, 12, 14, 0.75)";
            ctx.fillRect(0, h * 0.85, w, h * 0.15);

            // Línea de separación superior decorativa
            ctx.strokeStyle = "#1b1d1f";
            ctx.lineWidth = 6;
            ctx.strokeRect(0, 0, w, h);
        }, 512, 512);
    }

    /**
     * Textura de muro con ventilador industrial circular
     * (Visto en el muro del fondo en las capturas 1, 2 y 4)
     */
    static createWallWithVent(gl) {
        return this.create(gl, (ctx, w, h) => {
            // Muro de hormigón desgastado
            ctx.fillStyle = "#333638";
            ctx.fillRect(0, 0, w, h);

            // Marco metálico cuadrado del extractor
            const cx = w * 0.5, cy = h * 0.5;
            const frameSize = w * 0.6;
            ctx.fillStyle = "#181a1c";
            ctx.fillRect(cx - frameSize / 2, cy - frameSize / 2, frameSize, frameSize);
            ctx.strokeStyle = "#404448";
            ctx.lineWidth = 6;
            ctx.strokeRect(cx - frameSize / 2, cy - frameSize / 2, frameSize, frameSize);

            // Conducto circular oscuro
            const radius = frameSize * 0.42;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = "#0a0b0d";
            ctx.fill();
            ctx.strokeStyle = "#555b62";
            ctx.lineWidth = 4;
            ctx.stroke();

            // Aspas del ventilador (4 aspas curvadas)
            ctx.fillStyle = "#2d3135";
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2 + 0.3;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.ellipse(radius * 0.5, 0, radius * 0.45, radius * 0.18, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Eje central
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = "#1e2225";
            ctx.fill();
            ctx.strokeStyle = "#727a82";
            ctx.lineWidth = 3;
            ctx.stroke();
        }, 512, 512);
    }

    /**
     * Textura de la pared lateral con apertura exterior a la feria nocturna
     * (Captura 1 y 4: feria nocturna con guirnaldas de luces doradas, carpas y árboles)
     */
    static createOutdoorFair(gl) {
        return this.create(gl, (ctx, w, h) => {
            // Cielo nocturno azul oscuro / azul petróleo
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, "#080c14");
            sky.addColorStop(0.6, "#101a28");
            sky.addColorStop(1, "#18222d");
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);

            // Estrellas sutiles en el cielo
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            for (let s = 0; s < 45; s++) {
                const sx = Math.random() * w;
                const sy = Math.random() * (h * 0.5);
                ctx.fillRect(sx, sy, 1.5, 1.5);
            }

            // Siluetas de árboles de fondo
            ctx.fillStyle = "#0c141a";
            for (let i = 0; i < 7; i++) {
                const bx = (i / 6) * w;
                ctx.beginPath();
                ctx.arc(bx, h * 0.72, 70 + (i % 3) * 20, 0, Math.PI * 2);
                ctx.fill();
            }

            // Carpas de feria (techos puntiagudos a rayas de colores de festival)
            const tents = [
                { x: w * 0.2, w: 90, h: 70, c1: "#e03e3e", c2: "#f3e8d2" },
                { x: w * 0.55, w: 120, h: 90, c1: "#e5a122", c2: "#2d5be3" },
                { x: w * 0.85, w: 80, h: 60, c1: "#28a745", c2: "#f8f9fa" }
            ];

            tents.forEach(t => {
                const baseY = h * 0.75;
                // Carpa triangular
                ctx.beginPath();
                ctx.moveTo(t.x, baseY - t.h);
                ctx.lineTo(t.x + t.w / 2, baseY);
                ctx.lineTo(t.x - t.w / 2, baseY);
                ctx.closePath();
                ctx.fillStyle = t.c1;
                ctx.fill();

                // Rayas de la carpa
                ctx.strokeStyle = t.c2;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(t.x, baseY - t.h);
                ctx.lineTo(t.x - t.w * 0.2, baseY);
                ctx.moveTo(t.x, baseY - t.h);
                ctx.lineTo(t.x + t.w * 0.2, baseY);
                ctx.stroke();
            });

            // Guirnaldas de luces festivas (Fairground string lights colgantes)
            const drawGarland = (y1, y2, yMid) => {
                ctx.beginPath();
                ctx.moveTo(0, y1);
                ctx.quadraticCurveTo(w * 0.5, yMid, w, y2);
                ctx.strokeStyle = "rgba(40, 40, 40, 0.7)";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Focos cálidos a lo largo de la catenaria
                const bulbs = 22;
                for (let b = 0; b <= bulbs; b++) {
                    const t = b / bulbs;
                    const bx = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * (w * 0.5) + t * t * w;
                    const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * yMid + t * t * y2;

                    // Resplandor cálido amarillo
                    ctx.beginPath();
                    ctx.arc(bx, by, 6, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 230, 140, 0.35)";
                    ctx.fill();

                    // Bulbo brillante
                    ctx.beginPath();
                    ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = "#fffbd1";
                    ctx.fill();
                }
            };

            drawGarland(h * 0.25, h * 0.35, h * 0.42);
            drawGarland(h * 0.4, h * 0.48, h * 0.55);

            // Barandilla / muro perimetral con listones de madera en primer plano
            ctx.fillStyle = "#221915";
            ctx.fillRect(0, h * 0.8, w, h * 0.2);
            ctx.strokeStyle = "#38291f";
            ctx.lineWidth = 8;
            ctx.strokeRect(0, h * 0.8, w, h * 0.2);
            for (let p = 0; p < 8; p++) {
                ctx.fillStyle = "#1a120e";
                ctx.fillRect(p * (w / 7) - 6, h * 0.75, 16, h * 0.25);
            }
        }, 512, 512);
    }

    /**
     * Textura de hormigón para el techo del recinto
     */
    static createCeiling(gl) {
        return this.create(gl, (ctx, w, h) => {
            ctx.fillStyle = "#202325";
            ctx.fillRect(0, 0, w, h);

            // Cuadrícula de vigas de techo
            ctx.strokeStyle = "#111314";
            ctx.lineWidth = 10;
            const cols = 2, rows = 2;
            for (let i = 0; i <= cols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * (w / cols), 0);
                ctx.lineTo(i * (w / cols), h);
                ctx.stroke();
            }
            for (let j = 0; j <= rows; j++) {
                ctx.beginPath();
                ctx.moveTo(0, j * (h / rows));
                ctx.lineTo(w, j * (h / rows));
                ctx.stroke();
            }

            // Manchas de humedad y textura
            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            for (let k = 0; k < 12; k++) {
                ctx.beginPath();
                ctx.arc(Math.random() * w, Math.random() * h, 30 + Math.random() * 40, 0, Math.PI * 2);
                ctx.fill();
            }
        }, 512, 512);
    }

    /**
     * Textura de la superficie verde esmeralda de la plataforma central
     * (Visto en el centro de todas las capturas)
     */
    static createNeonPlatform(gl) {
        return this.create(gl, (ctx, w, h) => {
            // Fondo verde esmeralda vibrante
            ctx.fillStyle = "#1aa564";
            ctx.fillRect(0, 0, w, h);

            // Resplandor central más claro
            const glow = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/2);
            glow.addColorStop(0, "#48ff9f");
            glow.addColorStop(0.7, "#1aa564");
            glow.addColorStop(1, "#0d6a3e");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);

            // Rejilla geométrica sutil
            ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 3;
            for (let i = 0; i <= 8; i++) {
                ctx.beginPath();
                ctx.moveTo(i * (w / 8), 0);
                ctx.lineTo(i * (w / 8), h);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * (h / 8));
                ctx.lineTo(w, i * (h / 8));
                ctx.stroke();
            }

            // Borde oscuro perimetral
            ctx.strokeStyle = "#082817";
            ctx.lineWidth = 12;
            ctx.strokeRect(0, 0, w, h);
        }, 512, 512);
    }

    /**
     * Textura para tubos fluorescentes de neón (blanco/verde brillante)
     */
    static createNeonTube(gl) {
        return this.create(gl, (ctx, w, h) => {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, "#8effc9");
            grad.addColorStop(0.5, "#ffffff");
            grad.addColorStop(1, "#8effc9");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }, 128, 128);
    }

    /**
     * Textura de metal cepillado / aluminio desgastado
     */
    static createBrushedMetal(gl) {
        return this.create(gl, (ctx, w, h) => {
            ctx.fillStyle = "#6c7278";
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 1;
            for (let i = 0; i < 200; i++) {
                const y = Math.random() * h;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y + (Math.random() - 0.5) * 8);
                ctx.stroke();
            }

            ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
            for (let i = 0; i < 150; i++) {
                const y = Math.random() * h;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y + (Math.random() - 0.5) * 8);
                ctx.stroke();
            }
        }, 256, 256);
    }

    /**
     * Textura de goma de neumáticos y parachoques
     */
    static createRubber(gl) {
        return this.create(gl, (ctx, w, h) => {
            ctx.fillStyle = "#151617";
            ctx.fillRect(0, 0, w, h);

            // Estrías longitudinales de la goma
            ctx.strokeStyle = "#25282b";
            ctx.lineWidth = 4;
            for (let i = 0; i < w; i += 12) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, h);
                ctx.stroke();
            }
        }, 256, 256);
    }

    /**
     * Textura de la rejilla frontal vintage del carrito
     */
    static createCarGrille(gl) {
        return this.create(gl, (ctx, w, h) => {
            // Fondo oscuro detrás de la rejilla
            ctx.fillStyle = "#101010";
            ctx.fillRect(0, 0, w, h);

            // Rejillas horizontales cromadas
            const slats = 12;
            const slatH = h / slats;
            for (let i = 0; i < slats; i++) {
                const y = i * slatH;
                const grad = ctx.createLinearGradient(0, y, 0, y + slatH * 0.7);
                grad.addColorStop(0, "#d8dede");
                grad.addColorStop(0.5, "#ffffff");
                grad.addColorStop(1, "#808a8e");
                ctx.fillStyle = grad;
                ctx.fillRect(w * 0.08, y + 2, w * 0.84, slatH * 0.65);
            }

            // Marco exterior cromado
            ctx.strokeStyle = "#d8dede";
            ctx.lineWidth = 10;
            ctx.strokeRect(w * 0.05, 5, w * 0.9, h - 10);
        }, 256, 256);
    }
}

window.TextureGenerator = TextureGenerator;
