import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildProduct3DModel } from './ProductModels';

export default function Hero3DStage({ product, activeColor, className = '' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const particlesRef = useRef(null);
  const animIdRef = useRef(null);

  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isHoveredRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    let disposed = false;

    const buildScene = () => {
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    // 4. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const cyanKey = new THREE.DirectionalLight(0x38bdf8, 3.2);
    cyanKey.position.set(5, 4, 4);
    scene.add(cyanKey);

    const purpleRim = new THREE.DirectionalLight(0xa855f7, 2.5);
    purpleRim.position.set(-5, -2, -4);
    scene.add(purpleRim);

    const topSpot = new THREE.SpotLight(0xffffff, 3.5, 12, Math.PI / 4, 0.4);
    topSpot.position.set(0, 7, 2);
    scene.add(topSpot);

    // 5. Floating Cyber Particle Galaxy
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colCyan = new THREE.Color('#06b6d4');
    const colPurple = new THREE.Color('#a855f7');
    const colWhite = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      const mixedCol = Math.random() > 0.5 ? colCyan : Math.random() > 0.3 ? colPurple : colWhite;
      colors[i * 3] = mixedCol.r;
      colors[i * 3 + 1] = mixedCol.g;
      colors[i * 3 + 2] = mixedCol.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 6. Build Initial 3D Model
    const primaryHex = activeColor?.hex || product.colors[0]?.hex || '#06b6d4';
    const accentHex = activeColor?.accentHex || product.colors[0]?.accentHex || '#0891b2';
    const model = buildProduct3DModel(product.modelType, primaryHex, accentHex);
    model.position.set(0, 0, 0);
    modelGroupRef.current = model;
    scene.add(model);

    // 7. Render Loop with Smooth Inertia & Parallax
    let clock = new THREE.Clock();

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.05;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.05;

      // Particle floating drift
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.03;
        particlesRef.current.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;
      }

      // Hero Model floating bobbing & subtle auto-rotation
      if (modelGroupRef.current) {
        const bobOffset = Math.sin(elapsedTime * 1.5) * 0.08;
        modelGroupRef.current.position.y = bobOffset;

        const baseRotY = elapsedTime * 0.4;
        const targetRotY = baseRotY + mousePosRef.current.x * 0.8;
        const targetRotX = mousePosRef.current.y * 0.5 + 0.15;

        modelGroupRef.current.rotation.y = targetRotY;
        modelGroupRef.current.rotation.x = targetRotX;

        // Animate drone rotors if present
        const rotors = modelGroupRef.current.getObjectByName('rotors');
        if (rotors) {
          rotors.children.forEach(blade => {
            blade.rotation.y += 0.4;
          });
        }
      }

      renderer.render(scene, camera);
    };

    animIdRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 550;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    // Browsers cap concurrent WebGL contexts; opening DevTools (extra GPU/
    // compositor overhead) can force-lose one. Rebuild instead of staying blank.
    const handleContextLost = (event) => {
      event.preventDefault();
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };

    const handleContextRestored = () => {
      if (disposed) return;
      if (rendererRef.current) rendererRef.current.dispose();
      buildScene();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    buildScene();
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [product.modelType]);

  // Handle Model Hot-swap when hero product or color changes
  useEffect(() => {
    if (!sceneRef.current) return;
    if (modelGroupRef.current) {
      sceneRef.current.remove(modelGroupRef.current);
    }
    const primaryHex = activeColor?.hex || product.colors[0]?.hex || '#06b6d4';
    const accentHex = activeColor?.accentHex || product.colors[0]?.accentHex || '#0891b2';
    const model = buildProduct3DModel(product.modelType, primaryHex, accentHex);
    modelGroupRef.current = model;
    sceneRef.current.add(model);
  }, [product.id, activeColor]);

  // Track Mouse Parallax
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePosRef.current.targetX = x;
    mousePosRef.current.targetY = y;
  };

  const handleMouseLeave = () => {
    mousePosRef.current.targetX = 0;
    mousePosRef.current.targetY = 0;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full min-h-[450px] sm:min-h-[520px] lg:min-h-[580px] select-none flex items-center justify-center ${className}`}
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent rounded-3xl blur-3xl pointer-events-none -z-10" />

      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />

      {/* Futuristic Floating Telemetry HUD Badges */}
      <div className="absolute bottom-6 left-6 pointer-events-none p-3.5 rounded-2xl glass-panel border border-cyan-500/20 backdrop-blur-xl shadow-2xl hidden sm:block">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
            Interactive 3D Stage
          </span>
        </div>
        <p className="text-xs text-slate-600 font-medium">
          Move cursor to tilt • Click product to inspect 3D studio
        </p>
      </div>
    </div>
  );
}
