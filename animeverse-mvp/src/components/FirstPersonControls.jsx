import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

export default function FirstPersonControls({ speed = 5, lookSpeed = 0.002 }) {
    const { camera, gl } = useThree();
    const controlsRef = useRef();
    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
        shift: false
    });

    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());

    useEffect(() => {
        // Set camera to eye level
        camera.position.set(0, 1.7, 5);

        const handleKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    moveState.current.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    moveState.current.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    moveState.current.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    moveState.current.right = true;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    moveState.current.shift = true;
                    break;
            }
        };

        const handleKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    moveState.current.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    moveState.current.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    moveState.current.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    moveState.current.right = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    moveState.current.shift = false;
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [camera]);

    useFrame((state, delta) => {
        if (!controlsRef.current) return;

        const actualSpeed = moveState.current.shift ? speed * 1.5 : speed;

        // Calculate movement direction
        direction.current.set(0, 0, 0);

        if (moveState.current.forward) direction.current.z -= 1;
        if (moveState.current.backward) direction.current.z += 1;
        if (moveState.current.left) direction.current.x -= 1;
        if (moveState.current.right) direction.current.x += 1;

        // Normalize for diagonal movement
        direction.current.normalize();

        // Apply camera rotation to movement direction
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Keep movement horizontal
        cameraDirection.normalize();

        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(camera.up, cameraDirection).normalize();

        // Calculate final velocity
        velocity.current.set(0, 0, 0);
        velocity.current.addScaledVector(cameraDirection, -direction.current.z);
        velocity.current.addScaledVector(cameraRight, -direction.current.x);

        // Apply movement
        const moveDistance = actualSpeed * delta;
        const newPosition = camera.position.clone();
        newPosition.add(velocity.current.multiplyScalar(moveDistance));

        // Collision detection - keep within museum bounds
        const bounds = {
            minX: -25,
            maxX: 25,
            minZ: -25,
            maxZ: 25
        };

        if (newPosition.x >= bounds.minX && newPosition.x <= bounds.maxX &&
            newPosition.z >= bounds.minZ && newPosition.z <= bounds.maxZ) {
            camera.position.copy(newPosition);
        }

        // Keep camera at eye level
        camera.position.y = 1.7;
    });

    return (
        <PointerLockControls
            ref={controlsRef}
            args={[camera, gl.domElement]}
            selector="#museum-canvas"
        />
    );
}
