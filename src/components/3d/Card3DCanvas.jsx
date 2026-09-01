import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildProduct3DModel } from './ProductModels';

export default function Card3DCanvas({
  product,
  isHovered = false,
  activeColor = null,
  className = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const animIdRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 240;
    const height = containerRef.current.clientHeight || 200;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight.position.set(4, 4, 4);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 2.0);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Initial Model
    const primaryHex = activeColor?.hex || product.colors[0]?.hex || '#06b6d4';
    const accentHex = activeColor?.accentHex || product.colors[0]?.accentHex || '#0891b2';
    const model = buildProduct3DModel(product.modelType, primaryHex, accentHex);
    model.rotation.set(0.15, 0.4, 0);
    modelGroupRef.current = model;
    scene.add(model);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (modelGroupRef.current) {
        // Continuous subtle spin + speed up on hover
        const spinSpeed = isHovered ? 1.4 : 0.4;
        modelGroupRef.current.rotation.y += 0.008 * spinSpeed;
        modelGroupRef.current.position.y = Math.sin(elapsed * 2) * 0.05;

        // Animate drone blades if present
        const rotors = modelGroupRef.current.getObjectByName('rotors');
        if (rotors) {
          rotors.children.forEach(blade => {
            blade.rotation.y += isHovered ? 0.45 : 0.15;
          });
        }
      }

      renderer.render(scene, camera);
    };

    animIdRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [product.modelType]);

  // Update Model Color
  useEffect(() => {
    if (!sceneRef.current) return;
    if (modelGroupRef.current) {
      sceneRef.current.remove(modelGroupRef.current);
    }
    const primaryHex = activeColor?.hex || product.colors[0]?.hex || '#06b6d4';
    const accentHex = activeColor?.accentHex || product.colors[0]?.accentHex || '#0891b2';
    const model = buildProduct3DModel(product.modelType, primaryHex, accentHex);
    model.rotation.set(0.15, 0.4, 0);
    modelGroupRef.current = model;
    sceneRef.current.add(model);
  }, [product.id, activeColor]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
