import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Plane, Circle, Html, useGLTF } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function RotatingGroup({ rotation }) {
  const groupRef = useRef();
  const [drone, setDrone] = useState(null);
  const [error, setError] = useState(null);
  const glbModel = useGLTF('/obj/flying_synthwave_bird.glb').scene; // Ensure this path is correct

  useEffect(() => {
    const loader = new OBJLoader();
    loader.load(
      '/obj/uploads_files_3653841_Drone_Ob.obj',
      (object) => {
        object.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.color.set('red');
          }
        });
        setDrone(object);
      },
      undefined, // onProgress
      (err) => {
        console.error('An error happened loading the drone model:', err.message);
        setError('Failed to load drone model.');
      }
    );
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Plane */}
      <Plane args={[200, 200]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="lightblue" />
      </Plane>

      {/* 2D Circle on the plane (outline only) */}
      <Circle args={[100, 64]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <lineBasicMaterial attach="material" color="lightgreen" />
      </Circle>

      {/* Hemisphere */}
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Drone Model */}
      {drone && <primitive object={drone} position={[60, 50, 0]} scale={[0.05, 0.05, 0.05]} />}

      {/* GLB Model */}
      {glbModel && <primitive object={glbModel} position={[-60, 50, 0]} scale={[0.05, 0.05, 0.05]} />}

      {/* Error Handling */}
      {error && (
        <Html position={[0, 2, 0]}>
          <div style={{ color: 'red' }}>
            {error}
          </div>
        </Html>
      )}
    </group>
  );
}

function CameraController({ view, fov }) {
  const { camera } = useThree();

  useEffect(() => {
    const angle = (view / 90) * (Math.PI / 2); // Calculate angle in radians for 0 to 90 degrees
    camera.position.set(
      Math.sin(angle) * 200, // X position
      Math.cos(angle) * 200, // Y position
      0 // Z position
    );
    camera.lookAt(0, 0, 0);
  }, [view, camera]);

  useEffect(() => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [fov, camera]);

  return null;
}

function App() {
  const [rotation, setRotation] = useState(0);
  const [view, setView] = useState(0); // Initial view
  const [fov, setFov] = useState(50); // Initial field of view

  const handleRotationChange = (event) => {
    const degrees = parseFloat(event.target.value);
    const radians = degrees * (Math.PI / 180);
    setRotation(radians);
  };

  const handleViewChange = (event) => {
    setView(parseFloat(event.target.value));
  };

  const handleFovChange = (event) => {
    setFov(parseFloat(event.target.value));
  };

  const handleReset = () => {
    setRotation(0); // Reset rotation to 0 radians
    setView(50); // Set vertical view to 50 degrees
    setFov(50); // Reset field of view to 50
  };

  return (
    <>
      <Canvas
        style={{ height: '100vh', width: '100vw', background: '#f0f0f0' }}
        camera={{ position: [0, 200, 200], fov: fov }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 100, 50]} intensity={1} />
        <RotatingGroup rotation={rotation} />
        <CameraController view={view} fov={fov} />
      </Canvas>

      {/* Rotation Control */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '20px',
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      }}>
        <label htmlFor="rotationControl">Rotate:</label>
        <input
          id="rotationControl"
          type="range"
          min="0"
          max="360"
          step="1"
          value={rotation * (180 / Math.PI)}
          onChange={handleRotationChange}
          style={{ width: '200px' }}
        />
        <span>{(rotation * (180 / Math.PI)).toFixed(1)}°</span>
      </div>

      {/* View Control */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <label htmlFor="viewControl">View:</label>
        <input
          id="viewControl"
          type="range"
          min="0"
          max="90"
          step="1"
          value={view}
          onChange={handleViewChange}
          style={{
            height: '200px',
            writingMode: 'bt-lr',
            transform: 'rotate(180deg)',
            margin: '0 10px'
          }}
        />
        <span>
          {`${view}° View`}
        </span>
      </div>

      {/* Zoom Control */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <label htmlFor="fovControl">Zoom:</label>
        <input
          id="fovControl"
          type="range"
          min="10"
          max="100"
          step="1"
          value={fov}
          onChange={handleFovChange}
          style={{ width: '200px' }}
        />
        <span>{`${fov} FOV`}</span>
      </div>

      {/* Reset Button */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      }}>
        <button onClick={handleReset}>Reset View and Rotation</button>
      </div>
    </>
  );
}

export default App;
