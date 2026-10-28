/**
 * ===================================================================
 * COMPUTACIÓN GRÁFICA - UNIDAD 01
 * Proyecto: Arena 3D de Carritos Chocones
 * Archivo: js/physics/PhysicsEngine.js
 * Descripción: Motor de física simplificado para vehículos de choque:
 *              aceleración, inercia, fricción, rodamiento de ruedas y
 *              sistema de colisiones elásticas con muros y obstáculos (Sección 12).
 * ===================================================================
 */

class PhysicsEngine {
    constructor() {
        // Límites espaciales de la pista (mitad del ancho y largo utilizable)
        this.arenaHalfWidth = 11.2;
        this.arenaHalfLength = 11.2;

        // Parámetros dinámicos del vehículo
        this.accelerationRate = 10.0;    // Tasa de aceleración (m/s²)
        this.frictionFactor = 1.4;       // Fricción pasiva de la pista
        this.maxForwardSpeed = 7.5;      // Velocidad máxima hacia adelante
        this.maxReverseSpeed = -4.0;     // Velocidad máxima marcha atrás
        this.turnRate = 2.0;             // Velocidad angular de giro (rad/s)
        this.restitution = 0.5;          // Coeficiente de restitución (rebote elástico)
        this.wheelRadius = 0.22;         // Radio para cálculo de rodamiento
    }

    /**
     * Actualiza el estado físico del carrito del jugador
     * @param {Object} car Estado del carrito (x, z, rumbo, vel, giroRuedas)
     * @param {number} throttle Entrada de aceleración (-1, 0, 1)
     * @param {number} steer Entrada de dirección (-1, 0, 1)
     * @param {number} dt Delta time en segundos
     * @param {Array<Object>} obstacles Lista de obstáculos circulares [{x, z, radius}]
     */
    updateCar(car, throttle, steer, dt, obstacles = []) {
        // 1. Aceleración y fricción
        car.vel += throttle * this.accelerationRate * dt;
        car.vel -= car.vel * this.frictionFactor * dt;

        // Limitar velocidad dentro de rango físico
        car.vel = Math.max(this.maxReverseSpeed, Math.min(this.maxForwardSpeed, car.vel));

        // 2. Giro direccional (el giro es más efectivo cuando el auto está en movimiento)
        const speedRatio = Math.max(-1.0, Math.min(1.0, car.vel / 2.5));
        car.rumbo += steer * this.turnRate * dt * speedRatio;

        // 3. Integración de la posición (hacia adelante según el vector rumbo)
        // Rumbo 0 apunta hacia -Z en el sistema de coordenadas
        const fwdX = -Math.sin(car.rumbo);
        const fwdZ = -Math.cos(car.rumbo);

        car.x += fwdX * car.vel * dt;
        car.z += fwdZ * car.vel * dt;

        // 4. Rotación física de las ruedas según velocidad y radio
        // theta = s / r
        car.giroRuedas -= (car.vel * dt) / this.wheelRadius;

        // Ángulo de giro de las ruedas delanteras para dirección visual
        car.steerAngle = steer * 0.45;

        // 5. Colisión elástica contra los muros perimetrales
        const L = this.arenaHalfWidth;
        if (Math.abs(car.x) > L) {
            car.x = Math.sign(car.x) * L;
            car.vel *= -this.restitution; // Rebote elástico
        }
        if (Math.abs(car.z) > L) {
            car.z = Math.sign(car.z) * L;
            car.vel *= -this.restitution;
        }

        // 6. Colisión circular con obstáculos (plataforma, columnas, otros autos)
        const carRadius = 0.85;
        for (const obs of obstacles) {
            const dx = car.x - obs.x;
            const dz = car.z - obs.z;
            const dist = Math.hypot(dx, dz);
            const minDist = carRadius + obs.radius;

            if (dist < minDist && dist > 0.0001) {
                // Normal de impacto
                const nx = dx / dist;
                const nz = dz / dist;

                // Separar el auto para evitar solapamiento (penetración)
                car.x = obs.x + nx * minDist;
                car.z = obs.z + nz * minDist;

                // Aplicar rebote de choque de carritos chocones
                car.vel *= -this.restitution;
            }
        }
    }
}

window.PhysicsEngine = PhysicsEngine;
