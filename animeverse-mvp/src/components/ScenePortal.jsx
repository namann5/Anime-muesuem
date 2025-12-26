import React, { forwardRef, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshWobbleMaterial } from '@react-three/drei'
import { gsap } from 'gsap'

const ScenePortal = forwardRef(function ScenePortal(_, ref) {
  const torusRef = useRef()
  const pulseRef = useRef(0)
  const lightRef = useRef()
  const { camera } = useThree()

  useFrame((state, delta) => {
    if (torusRef.current) {
      torusRef.current.rotation.y += delta * 0.5
      pulseRef.current += delta * 3.0
      const s = 1 + Math.sin(pulseRef.current) * 0.02
      torusRef.current.scale.setScalar(s)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.8 + Math.sin(pulseRef.current) * 0.4
    }
  })

  useEffect(() => {
    function onEnter() {
      gsap.to(camera.position, { x: 0, y: 1.2, z: 2, duration: 1.6, ease: 'power2.inOut' })
    }
    window.addEventListener('enterMuseum', onEnter)
    return () => window.removeEventListener('enterMuseum', onEnter)
  }, [camera])

  return (
    <group>
      <pointLight ref={lightRef} position={[0, 1.5, 0]} color={0xff6ea6} intensity={1} distance={6} />

      <mesh position={[0, 0.8, 0]} ref={torusRef} castShadow>
        <torusGeometry args={[0.8, 0.28, 32, 64]} />
        <MeshWobbleMaterial factor={0.6} speed={1.2} color="#ff6ea6" clearcoat={0.2} />
      </mesh>

      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#0b0b0f" metalness={0.1} roughness={0.95} />
      </mesh>
    </group>
  )
})

export default ScenePortal
