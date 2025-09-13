import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Simple3DCargoFitter() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  
  // Container dimensions
  const [container, setContainer] = useState({ length: 10, width: 8, height: 6 });
  
  // Item input form
  const [itemInput, setItemInput] = useState({ 
    length: 3, 
    width: 2, 
    height: 2, 
    name: '',
    weight: 1
  });
  
  // Items list
  const [items, setItems] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  
  // Initialize Three.js scene
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    // Clear any existing content first
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, 700 / 500, 0.1, 1000);
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(700, 500);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Grid
    const gridHelper = new THREE.GridHelper(30, 30);
    scene.add(gridHelper);
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    
    // Mouse controls
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    
    const onMouseDown = (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const onMouseMove = (event) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const onMouseUp = () => {
      isMouseDown = false;
    };
    
    const onWheel = (event) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(scale);
      event.preventDefault();
    };
    
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);
    
    return () => {
      // Cancel animation
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Remove event listeners
      canvas.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      
      // Clean up Three.js
      renderer.dispose();
      
      // Remove from DOM if still attached
      if (mount && canvas && mount.contains(canvas)) {
        mount.removeChild(canvas);
      }
      
      // Clear refs
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
    };
  }, []);
  
  // Update 3D visualization when container, items, or optimization result changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    
    // Clear existing cargo meshes
    const meshesToRemove = [];
    scene.traverse((object) => {
      if (object.isMesh && object.userData.isCargoMesh) {
        meshesToRemove.push(object);
      }
    });
    meshesToRemove.forEach(mesh => scene.remove(mesh));
    
    // Container (wireframe)
    const containerGeometry = new THREE.BoxGeometry(container.length, container.height, container.width);
    const containerMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const containerMesh = new THREE.Mesh(containerGeometry, containerMaterial);
    containerMesh.position.set(container.length/2, container.height/2, container.width/2);
    containerMesh.userData.isCargoMesh = true;
    scene.add(containerMesh);
    
    // Items
    let outsideOffsetX = container.length + 2;
    
    items.forEach((item, index) => {
      const itemGeometry = new THREE.BoxGeometry(item.length, item.height, item.width);
      
      // Color based on fit status
      let color, opacity, transparent;
      if (optimizationResult) {
        const resultItem = optimizationResult.find(r => r.id === item.id);
        const fitted = resultItem?.fitted || false;
        color = fitted ? 0x4CAF50 : 0xF44336;
        opacity = fitted ? 1 : 0.7;
        transparent = !fitted;
      } else {
        // Default colors when no optimization
        const hue = (index * 0.618033988749895) % 1;
        color = new THREE.Color().setHSL(hue, 0.7, 0.5);
        opacity = 0.7;
        transparent = true;
      }
      
      const itemMaterial = new THREE.MeshLambertMaterial({
        color: color,
        transparent: transparent,
        opacity: opacity
      });
      
      const itemMesh = new THREE.Mesh(itemGeometry, itemMaterial);
      
      // Position based on optimization result
      if (optimizationResult) {
        const resultItem = optimizationResult.find(r => r.id === item.id);
        if (resultItem?.fitted && resultItem.x !== undefined) {
          // Use optimized position
          itemMesh.position.set(
            resultItem.x + item.length/2,
            resultItem.z + item.height/2,
            resultItem.y + item.width/2
          );
        } else {
          // Place outside container
          itemMesh.position.set(outsideOffsetX + item.length/2, item.height/2, item.width/2);
          outsideOffsetX += item.length + 1;
        }
      } else {
        // Default positioning (stack outside)
        itemMesh.position.set(outsideOffsetX + item.length/2, item.height/2, item.width/2);
        outsideOffsetX += item.length + 1;
      }
      
      itemMesh.userData.isCargoMesh = true;
      itemMesh.castShadow = true;
      itemMesh.receiveShadow = true;
      scene.add(itemMesh);
    });
    
  }, [container, items, optimizationResult]);
  
  // Add new item
  const addItem = () => {
    if (itemInput.length <= 0 || itemInput.width <= 0 || itemInput.height <= 0) {
      alert('Please enter valid dimensions (greater than 0)');
      return;
    }
    
    const newItem = {
      id: Date.now() + Math.random(), // Simple ID generation
      name: itemInput.name || `Item ${items.length + 1}`,
      length: itemInput.length,
      width: itemInput.width,
      height: itemInput.height,
      weight: itemInput.weight
    };
    
    setItems([...items, newItem]);
    
    // Reset form
    setItemInput({
      length: 3,
      width: 2, 
      height: 2,
      name: '',
      weight: 1
    });
    
    // Clear optimization result when adding new items
    setOptimizationResult(null);
  };
  
  // Remove item
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setOptimizationResult(null);
  };
  
  // Clear all items
  const clearItems = () => {
    setItems([]);
    setOptimizationResult(null);
  };
  
  // Optimize packing using backend API
  const optimizePacking = async () => {
    if (items.length === 0) {
      alert('Please add items first');
      return;
    }
    
    setIsOptimizing(true);
    
    try {
      const payload = {
        container: {
          length: container.length,
          width: container.width,
          height: container.height
        },
        items: items.map(item => ({
          id: item.id,
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          name: item.name
        }))
      };
      
      const response = await fetch('https://freight-calculator-backend.onrender.com/api/pack-cargo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const result = await response.json();
      setOptimizationResult(result.packedItems || result.items || []);
      
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Optimization failed. Please check your network connection and try again.');
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Calculate statistics
  const stats = {
    totalItems: items.length,
    fitted: optimizationResult ? optimizationResult.filter(item => item.fitted).length : 0,
    unfitted: optimizationResult ? optimizationResult.filter(item => !item.fitted).length : items.length
  };
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        3D Cargo Fitter with AI Optimization
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Container Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>Container</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Length:
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={container.length}
              onChange={(e) => setContainer({...container, length: Number(e.target.value) || 1})}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Width:
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={container.width}
              onChange={(e) => setContainer({...container, width: Number(e.target.value) || 1})}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Height:
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={container.height}
              onChange={(e) => setContainer({...container, height: Number(e.target.value) || 1})}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>
        
        {/* Add Item Form */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>Add Item</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Name:
            </label>
            <input
              type="text"
              value={itemInput.name}
              onChange={(e) => setItemInput({...itemInput, name: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Optional"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Length:
            </label>
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={itemInput.length}
              onChange={(e) => setItemInput({...itemInput, length: Number(e.target.value) || 0.1})}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Width:
            </label>
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={itemInput.width}
              onChange={(e) => setItemInput({...itemInput, width: Number(e.target.value) || 0.1})}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Height:
            </label>
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={itemInput.height}
              onChange={(e) => setItemInput({...itemInput, height: Number(e.target.value) || 0.1})}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Weight:
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={itemInput.weight}
              onChange={(e) => setItemInput({...itemInput, weight: Number(e.target.value) || 0.1})}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <button
            onClick={addItem}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Add Item
          </button>
        </div>
        
        {/* Statistics & Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>Statistics</h3>
          <div style={{ marginBottom: '15px' }}>
            <p><strong>Total Items:</strong> {stats.totalItems}</p>
            <p><strong>Fitted:</strong> <span style={{color: '#4CAF50'}}>{stats.fitted}</span></p>
            <p><strong>Unfitted:</strong> <span style={{color: '#F44336'}}>{stats.unfitted}</span></p>
          </div>
          
          <button
            onClick={optimizePacking}
            disabled={isOptimizing || items.length === 0}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: isOptimizing ? '#999' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Packing'}
          </button>
          
          <button
            onClick={clearItems}
            disabled={items.length === 0}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: items.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Clear All Items
          </button>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* 3D Visualization */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>3D Visualization</h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '15px' 
          }}>
            Drag to rotate • Scroll to zoom • 
            <span style={{ color: '#333' }}>Gray wireframe = Container</span> • 
            <span style={{ color: '#4CAF50' }}>Green = Fitted</span> • 
            <span style={{ color: '#F44336' }}>Red = Unfitted</span>
          </p>
          <div 
            ref={mountRef} 
            style={{ 
              width: '700px', 
              height: '500px', 
              margin: '0 auto',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f8f8f8'
            }} 
          />
        </div>
        
        {/* Items List */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>Items ({items.length})</h3>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px'
          }}>
            {items.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center' }}>No items added yet</p>
            ) : (
              items.map((item) => {
                const resultItem = optimizationResult?.find(r => r.id === item.id);
                const fitted = resultItem?.fitted || false;
                
                return (
                  <div 
                    key={item.id}
                    style={{ 
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: fitted ? '#f0f8f0' : optimizationResult ? '#fff0f0' : '#f9f9f9'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{item.name}</strong>
                        <br />
                        <small>
                          {item.length} × {item.width} × {item.height}
                          <br />
                          Weight: {item.weight}
                        </small>
                        {optimizationResult && (
                          <div style={{ 
                            color: fitted ? '#4CAF50' : '#F44336',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}>
                            {fitted ? '✓ FITTED' : '✗ UNFITTED'}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          backgroundColor: '#F44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '5px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}