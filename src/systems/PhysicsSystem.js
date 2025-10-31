/**
 * Physics System - Simple physics and collision detection
 * Note: For a full AAA experience, consider integrating Cannon.js or Ammo.js
 */

import * as THREE from 'three';

export class PhysicsSystem {
    constructor() {
        this.gravity = -9.81;
        this.bodies = [];
        this.colliders = [];
    }

    update(deltaTime) {
        // Update all physics bodies
        for (const body of this.bodies) {
            if (body.isKinematic) continue;

            // Apply gravity
            body.velocity.y += this.gravity * deltaTime;

            // Update position
            body.position.x += body.velocity.x * deltaTime;
            body.position.y += body.velocity.y * deltaTime;
            body.position.z += body.velocity.z * deltaTime;

            // Ground collision (simple)
            if (body.position.y < 0) {
                body.position.y = 0;
                body.velocity.y = 0;
            }
        }
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
        }
    }

    // Simple sphere-sphere collision detection
    checkCollision(pos1, radius1, pos2, radius2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        const distanceSq = dx * dx + dy * dy + dz * dz;
        const radiusSum = radius1 + radius2;

        return distanceSq < (radiusSum * radiusSum);
    }

    // Raycast for shooting
    raycast(origin, direction, maxDistance, objects) {
        const raycaster = new THREE.Raycaster(origin, direction, 0, maxDistance);
        const intersections = raycaster.intersectObjects(objects, true);

        return intersections.length > 0 ? intersections[0] : null;
    }

    // Simple AABB collision
    checkAABBCollision(box1Min, box1Max, box2Min, box2Max) {
        return (
            box1Min.x <= box2Max.x && box1Max.x >= box2Min.x &&
            box1Min.y <= box2Max.y && box1Max.y >= box2Min.y &&
            box1Min.z <= box2Max.z && box1Max.z >= box2Min.z
        );
    }
}
