import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  buildProduct3DModel,
  applyExplodedViewOffset,
  updateModelColors,
} from './ProductModels';
import {
  RotateCcw,
  Sun,
  Layers,
  Sparkles,
  Maximize2,
  Camera,
  Play,
  Pause,
  Grid,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function Product3DViewer({
  product,
  selectedColor,
  selectedMaterial,
  className = '',
  enableExplodeControl = true,
  autoRotateSpeed = 1.0,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Viewer state
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [explodeValue, setExplodeValue] = useState(0);
  const [isWireframe, setIsWireframe] = useState(false);
  const [lightingPreset, setLightingPreset] = useState('cyber'); // 'cyber', 'studio', 'golden', 'dark'
  const [isInteracting, setIsInteracting] = useState(false);

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const lightsGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Mouse drag / inertia state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.005 });
  const modelRotationRef = useRef({ x: 0.2, y: 0.5 });
  const cameraZoomRef = useRef(3.8);

  // Setup Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.3, cameraZoomRef.current);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and alpha transparency
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true, // enables screenshot capture
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const lightsGroup = new THREE.Group();
    lightsGroupRef.current = lightsGroup;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    ambientLight.name = 'ambient';
    lightsGroup.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    keyLight.position.set(5, 5, 5);
    keyLight.name = 'key';
    lightsGroup.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 2.0);
    rimLight.position.set(-5, -2, -5);
    rimLight.name = 'rim';
    lightsGroup.add(rimLight);

    const topSpot = new THREE.SpotLight(0xffffff, 3.0, 10, Math.PI / 4, 0.5);
    topSpot.position.set(0, 6, 0);
    topSpot.name = 'spot';
    lightsGroup.add(topSpot);

    scene.add(lightsGroup);

    // 5. Floor shadow ring
    const shadowGeo = new THREE.RingGeometry(0.01, 1.6, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      transparent: true,
      opacity: 0.6,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -1.35;
    scene.add(shadowMesh);

    // 6. Build Initial 3D Model
    const primaryHex = selectedColor?.hex || '#06b6d4';
    const accentHex = selectedColor?.accentHex || '#0891b2';
    const model = buildProduct3DModel(product.modelType, primaryHex, accentHex);
    modelGroupRef.current = model;
    scene.add(model);

    // 7. Animation Loop
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Handle continuous auto-spin when not dragging
      if (isAutoSpin && !isDraggingRef.current) {
        modelRotationRef.current.y += autoRotateSpeed * 0.008;
      }

      // Inertia dampening when user stopped dragging
      if (!isDraggingRef.current) {
        modelRotationRef.current.y += rotationVelocityRef.current.y;
        modelRotationRef.current.x += rotationVelocityRef.current.x;
        rotationVelocityRef.current.x *= 0.92;
        rotationVelocityRef.current.y *= 0.92;
      }

      // Clamp vertical tilt
      modelRotationRef.current.x = Math.max(-0.8, Math.min(0.8, modelRotationRef.current.x));

      // Apply rotation to 3D model
      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x = modelRotationRef.current.x;
        modelGroupRef.current.rotation.y = modelRotationRef.current.y;

        // Animate rotor blades on drone if present
        const rotors = modelGroupRef.current.getObjectByName('rotors');
        if (rotors) {
          rotors.children.forEach(blade => {
            blade.rotation.y += 0.35;
          });
        }
      }

      // Render Scene
      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [product.modelType]);

  // Update Model Color & Material in real-time
  useEffect(() => {
    if (!modelGroupRef.current) return;
    const primaryHex = selectedColor?.hex || '#06b6d4';
    const accentHex = selectedColor?.accentHex || '#0891b2';
    const roughness = selectedMaterial?.roughness ?? (selectedColor?.roughness || 0.25);
    const metalness = selectedMaterial?.metalness ?? (selectedColor?.metalness || 0.85);

    updateModelColors(modelGroupRef.current, primaryHex, accentHex, roughness, metalness, isWireframe);
  }, [selectedColor, selectedMaterial, isWireframe]);

  // Update Exploded View ratio
  useEffect(() => {
    if (!modelGroupRef.current) return;
    applyExplodedViewOffset(modelGroupRef.current, explodeValue);
  }, [explodeValue]);

  // Update Lighting Presets
  useEffect(() => {
    if (!lightsGroupRef.current) return;
    const key = lightsGroupRef.current.getObjectByName('key');
    const rim = lightsGroupRef.current.getObjectByName('rim');
    const ambient = lightsGroupRef.current.getObjectByName('ambient');

    if (!key || !rim || !ambient) return;

    switch (lightingPreset) {
      case 'cyber':
        ambient.color.setHex(0x0f172a);
        ambient.intensity = 1.0;
        key.color.setHex(0x06b6d4);
        key.intensity = 3.2;
        rim.color.setHex(0xa855f7);
        rim.intensity = 2.4;
        break;
      case 'studio':
        ambient.color.setHex(0xffffff);
        ambient.intensity = 1.6;
        key.color.setHex(0xffffff);
        key.intensity = 2.5;
        rim.color.setHex(0x94a3b8);
        rim.intensity = 1.2;
        break;
      case 'golden':
        ambient.color.setHex(0x451a03);
        ambient.intensity = 1.2;
        key.color.setHex(0xfbbf24);
        key.intensity = 3.5;
        rim.color.setHex(0xf43f5e);
        rim.intensity = 2.0;
        break;
      case 'dark':
        ambient.color.setHex(0x020617);
        ambient.intensity = 0.5;
        key.color.setHex(0x38bdf8);
        key.intensity = 1.8;
        rim.color.setHex(0x06b6d4);
        rim.intensity = 1.5;
        break;
      default:
        break;
    }
  }, [lightingPreset]);

  // Mouse & Touch Orbit Interactions
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    setIsInteracting(true);
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    rotationVelocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    const rotSpeed = 0.006;
    modelRotationRef.current.y += deltaX * rotSpeed;
    modelRotationRef.current.x += deltaY * rotSpeed;

    rotationVelocityRef.current = {
      x: deltaY * rotSpeed * 0.4,
      y: deltaX * rotSpeed * 0.4,
    };

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setTimeout(() => setIsInteracting(false), 800);
  };

  // Zoom with wheel
  const handleWheel = (e) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const zoomDelta = e.deltaY * 0.002;
    cameraZoomRef.current = Math.max(2.2, Math.min(6.5, cameraZoomRef.current + zoomDelta));
    cameraRef.current.position.z = cameraZoomRef.current;
  };

  // Snapshot Engine
  const takeSnapshot = () => {
    sound.playClick();
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${product.id}-3d-render.png`;
    link.href = dataUrl;
    link.click();
  };

  const resetView = () => {
    sound.playClick();
    modelRotationRef.current = { x: 0.2, y: 0.5 };
    rotationVelocityRef.current = { x: 0, y: 0 };
    setExplodeValue(0);
    if (cameraRef.current) {
      cameraZoomRef.current = 3.8;
      cameraRef.current.position.set(0, 0.3, 3.8);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] select-none overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/90 via-white/80 to-white border border-slate-900/10 ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating 3D HUD Watermark */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <span className="text-xs font-mono tracking-widest text-cyan-400 font-semibold uppercase">
          Live 3D WebGL • 60 FPS
        </span>
      </div>

      {/* Interactive Control Overlay Bar */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 rounded-xl glass-panel border border-slate-900/10 shadow-xl backdrop-blur-md">
        <button
          onClick={() => {
            sound.playClick();
            setIsAutoSpin(!isAutoSpin);
          }}
          title={isAutoSpin ? 'Pause Auto-Spin' : 'Resume Auto-Spin'}
          className={`p-2 rounded-lg transition-all ${
            isAutoSpin ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          {isAutoSpin ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setIsWireframe(!isWireframe);
          }}
          title="Toggle Wireframe Blueprint"
          className={`p-2 rounded-lg transition-all ${
            isWireframe ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sound.playClick();
            const presets = ['cyber', 'studio', 'golden', 'dark'];
            const nextIdx = (presets.indexOf(lightingPreset) + 1) % presets.length;
            setLightingPreset(presets[nextIdx]);
          }}
          title={`Lighting: ${lightingPreset.toUpperCase()} (Click to Cycle)`}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/5 transition-all flex items-center gap-1 text-xs font-mono"
        >
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="capitalize hidden sm:inline">{lightingPreset}</span>
        </button>

        <button
          onClick={takeSnapshot}
          title="Download High-Res 3D Snapshot"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/5 transition-all"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
        </button>

        <button
          onClick={resetView}
          title="Reset Camera & Rotation"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/5 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Exploded View Control Slider */}
      {enableExplodeControl && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 p-3 rounded-xl glass-panel border border-slate-900/10 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              3D Exploded Teardown
            </span>
            <span className="text-cyan-400 font-bold">{Math.round(explodeValue * 100)}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodeValue}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setExplodeValue(val);
              if (val > 0 && explodeValue === 0) sound.playExplode();
            }}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>Assembled</span>
            <span>Internal Components</span>
          </div>
        </div>
      )}

      {/* Interaction Hint */}
      <div
        className={`absolute bottom-4 left-4 text-xs font-mono text-slate-500/80 pointer-events-none transition-opacity duration-300 hidden md:flex items-center gap-1.5 ${
          isInteracting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-600">Drag</span> to rotate •{' '}
        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-600">Scroll</span> to zoom
      </div>
    </div>
  );
}
