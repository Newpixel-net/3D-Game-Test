/**
 * Input Manager - Handles keyboard, mouse, and touch input
 */

export class InputManager {
    constructor() {
        // Keyboard state
        this.keys = {};

        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            leftButton: false,
            rightButton: false,
        };

        // Touch state (for mobile)
        this.touch = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
        };

        // Mobile joystick
        this.joystick = {
            active: false,
            x: 0,
            y: 0,
        };

        // Pointer lock state
        this.pointerLocked = false;
    }

    initialize() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Touch events (for mobile)
        document.addEventListener('touchstart', (e) => this.onTouchStart(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e));
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // Pointer lock
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());

        console.log('✅ Input manager initialized');
    }

    onKeyDown(event) {
        this.keys[event.code] = true;

        // Prevent default for game keys
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
            event.preventDefault();
        }
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Mouse delta for camera rotation (if pointer locked)
        if (this.pointerLocked) {
            this.mouse.deltaX = event.movementX || 0;
            this.mouse.deltaY = event.movementY || 0;
        }
    }

    onMouseDown(event) {
        if (event.button === 0) {
            this.mouse.leftButton = true;
        } else if (event.button === 2) {
            this.mouse.rightButton = true;
        }
    }

    onMouseUp(event) {
        if (event.button === 0) {
            this.mouse.leftButton = false;
        } else if (event.button === 2) {
            this.mouse.rightButton = false;
        }
    }

    onTouchStart(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.touch.active = true;
            this.touch.startX = touch.clientX;
            this.touch.startY = touch.clientY;
            this.touch.currentX = touch.clientX;
            this.touch.currentY = touch.clientY;

            // Activate joystick if on left side
            if (touch.clientX < window.innerWidth / 2) {
                this.joystick.active = true;
            }
        }
    }

    onTouchMove(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.touch.currentX = touch.clientX;
            this.touch.currentY = touch.clientY;

            // Update joystick
            if (this.joystick.active) {
                const deltaX = this.touch.currentX - this.touch.startX;
                const deltaY = this.touch.currentY - this.touch.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const maxDistance = 50;

                this.joystick.x = Math.max(-1, Math.min(1, deltaX / maxDistance));
                this.joystick.y = Math.max(-1, Math.min(1, deltaY / maxDistance));
            }
        }

        event.preventDefault();
    }

    onTouchEnd(event) {
        this.touch.active = false;
        this.joystick.active = false;
        this.joystick.x = 0;
        this.joystick.y = 0;
    }

    onPointerLockChange() {
        this.pointerLocked = document.pointerLockElement === document.getElementById('gameCanvas');
    }

    requestPointerLock() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.requestPointerLock();
        }
    }

    // Helper methods for common inputs
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }

    getMovementInput() {
        const movement = { x: 0, y: 0 };

        // Keyboard input
        if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) {
            movement.y += 1;
        }
        if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) {
            movement.y -= 1;
        }
        if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) {
            movement.x -= 1;
        }
        if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) {
            movement.x += 1;
        }

        // Mobile joystick input
        if (this.joystick.active) {
            movement.x = this.joystick.x;
            movement.y = -this.joystick.y; // Invert Y for forward movement
        }

        // Normalize diagonal movement
        const length = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
        if (length > 1) {
            movement.x /= length;
            movement.y /= length;
        }

        return movement;
    }

    isShootPressed() {
        return this.mouse.leftButton || this.isKeyPressed('Space');
    }

    isReloadPressed() {
        return this.isKeyPressed('KeyR');
    }

    dispose() {
        // Remove event listeners
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchstart', this.onTouchStart);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
    }
}
