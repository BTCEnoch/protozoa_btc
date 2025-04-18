/**
 * ParticleRenderer Component
 *
 * Renders particles using Three.js with instanced rendering.
 * This component is responsible for the efficient 3D rendering
 * of particles using instanced meshes and custom shaders.
 */

import React, { useRef, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Role } from '../../types/core';
import { Vector3 } from '../../types/common';
import { VisualTrait } from '../../types/visual';
import { getInstancedRenderer } from '../../services/rendering';

/**
 * ParticleRenderer Props
 */
interface ParticleRendererProps {
  particles: Array<{
    id: string;
    position: Vector3;
    role: Role;
    groupId: string;
    visualTrait?: VisualTrait;
  }>;
  width?: number;
  height?: number;
  backgroundColor?: string;
  zoom?: number;
  autoRotate?: boolean;
}

/**
 * ParticleRenderer component
 */
const ParticleRenderer: React.FC<ParticleRendererProps> = ({
  particles,
  width = 800,
  height = 600,
  backgroundColor = '#000000',
  zoom = 1,
  autoRotate = false
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);

  // State
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 20;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Initialize instanced renderer
    const instancedRenderer = getInstancedRenderer();
    instancedRenderer.initialize(scene);

    setIsInitialized(true);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current);

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [backgroundColor, width, height, autoRotate]);

  // Update camera aspect ratio when dimensions change
  useEffect(() => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    }
  }, [width, height]);

  // Update camera zoom
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.zoom = zoom;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [zoom]);

  // Render particles
  useEffect(() => {
    if (!isInitialized || !sceneRef.current) return;

    // Get instanced renderer
    const instancedRenderer = getInstancedRenderer();

    // Group particles by role for efficient instanced rendering
    const particlesByRole = particles.reduce((acc, particle) => {
      if (!acc[particle.role]) {
        acc[particle.role] = [];
      }
      acc[particle.role].push(particle);
      return acc;
    }, {} as Record<Role, typeof particles>);

    // Clear previous particles
    instancedRenderer.clearInstances();

    // Render particles by role
    Object.entries(particlesByRole).forEach(([role, roleParticles]) => {
      instancedRenderer.renderParticleGroup(roleParticles, role as Role);
    });

  }, [particles, isInitialized]);

  return (
    <RendererContainer ref={containerRef} style={{ width, height }} />
  );
};

// Styled components
const RendererContainer = styled('div')({
  position: 'relative',
  overflow: 'hidden',
});

export default ParticleRenderer;
