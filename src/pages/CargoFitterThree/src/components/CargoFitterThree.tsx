import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import "../../../../styles/cargo-fitter.css";

// Inlined PlacedItem type to keep this file self-contained in canvas
interface PlacedItem {
  id: string;
  length: number;
  width: number; 
  height: number;
  x: number;
  y: number;
  z: number;
  fitted: boolean;  // ← Remove the ? to make it required
}

// Types for local UI state
interface CargoItem extends PlacedItem {
  weight: number; // kg
  name: string;
  quantity: number; // always 1 after expansion
  nonStackable?: boolean;
  nonRotatable?: boolean;
}

interface CargoContainer {
  length: number;
  width: number;
  height: number;
}

interface ContainerPreset {
  length: number;
  width: number;
  height: number;
  name: string;
  units: string; // "in", "cm", etc.
}

interface OrbitControlsLike {
  update: () => void;
  dispose: () => void;
}

interface ContainerDimensions {
  length: string;
  width: string;
  height: string;
}

interface ItemInput {
  length: string;
  width: string;
  height: string;
  weight: string;
  name: string;
  quantity: string;
  nonStackable: boolean;
  nonRotatable: boolean;
}

interface LoadingStats {
  totalItems: number;
  fitted: number;
  unfitted: number;
  efficiency: number;
  totalWeight: number;
  fittedWeight: number;
}

interface ConversionFactors { 
  [unit: string]: number; 
}

const uid = () => `${Date.now()}-${Math.random()}`;

// Unit conversions (dimensions in cm; weight in kg)
const conversionFactors: ConversionFactors = { 
  cm: 1, 
  m: 100, 
  in: 2.54, 
  ft: 30.48 
};

const weightConversion: ConversionFactors = { 
  kg: 1, 
  g: 1 / 1000, 
  lb: 0.45359237, 
  oz: 0.0283495231 
};

// Presets (inner dimensions)
const containerPresets: Record<string, ContainerPreset> = {
  "53-truck": { length: 636, width: 102, height: 110, name: "53' Truck Trailer", units: "in" },
  "48-truck": { length: 576, width: 102, height: 110, name: "48' Truck Trailer", units: "in" },
  "sprinter": { length: 142, width: 67, height: 71, name: "Mercedes Sprinter Van", units: "in" },
  "20ft-dv": { length: 233, width: 92, height: 94, name: "20ft Dry Van Container", units: "in" },
  "40ft-dv": { length: 472, width: 92, height: 94, name: "40ft Dry Van Container", units: "in" },
  "40ft-hc": { length: 473, width: 93, height: 106, name: "40ft High Cube Container", units: "in" },
  "45ft-hq": { length: 534, width: 92, height: 106, name: "45ft High Cube Container", units: "in" },
};

function toCm(value: number, unit: string): number { 
  return value * (conversionFactors[unit] ?? 1); 
}

function fromCm(valueCm: number, unit: string): number { 
  return valueCm / (conversionFactors[unit] ?? 1); 
}

function weightToKg(value: number, unit: string): number { 
  return value * (weightConversion[unit] ?? 1); 
}

function weightFromKg(valueKg: number, unit: string): number { 
  return valueKg / (weightConversion[unit] ?? 1); 
}

export default function CargoFitterThree() {
  // UI state
  const [units, setUnits] = useState<string>("in"); // default to inches
  const [weightUnits, setWeightUnits] = useState<string>("lb"); // default to pounds

  const [container, setContainer] = useState<ContainerDimensions>({ 
    length: "", 
    width: "", 
    height: "" 
  });
  
  const [itemInput, setItemInput] = useState<ItemInput>({
    length: "", 
    width: "", 
    height: "", 
    weight: "", 
    name: "", 
    quantity: "1",
    nonStackable: false, 
    nonRotatable: false,
  });

  // Items kept in a ref so three.js can mutate without re-renders
  const itemsRef = useRef<CargoItem[]>([]);
  const [, forceRerender] = useState<number>(0);

  // Track previous units for smooth conversion on change
  const [previousUnits, setPreviousUnits] = useState<string>("in");
  const [previousWeightUnits, setPreviousWeightUnits] = useState<string>("lb");

  useEffect(() => {
    if (previousUnits !== units && (container.length || container.width || container.height)) {
      const converted = (v: string) => {
        const n = Number(v) || 0;
        return n > 0 ? fromCm(toCm(n, previousUnits), units).toFixed(1) : "";
      };
      setContainer(c => ({
        length: converted(c.length),
        width: converted(c.width),
        height: converted(c.height),
      }));
      setItemInput(i => ({
        ...i,
        length: converted(i.length),
        width: converted(i.width),
        height: converted(i.height),
      }));
      setPreviousUnits(units);
    }
  }, [units, previousUnits, container.length, container.width, container.height]);

  useEffect(() => {
    if (previousWeightUnits !== weightUnits && itemInput.weight) {
      const n = Number(itemInput.weight) || 0;
      const conv = n > 0 ? weightFromKg(weightToKg(n, previousWeightUnits), weightUnits).toFixed(1) : "";
      setItemInput(prev => ({ ...prev, weight: conv }));
      setPreviousWeightUnits(weightUnits);
    }
  }, [weightUnits, previousWeightUnits, itemInput.weight]);

  // Three.js refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControlsLike | null>(null);
  const boxesGroupRef = useRef<THREE.Group | null>(null);

  // Stats
  const [stats, setStats] = useState<LoadingStats>({
    totalItems: 0, 
    fitted: 0, 
    unfitted: 0, 
    efficiency: 0, 
    totalWeight: 0, 
    fittedWeight: 0,
  });

  // Helper to get container in cm (internal canonical)
  const getContainerCm = useCallback((): CargoContainer => {
    const cL = toCm(Number(container.length || 0), units);
    const cW = toCm(Number(container.width || 0), units);
    const cH = toCm(Number(container.height || 0), units);
    return { length: cL, width: cW, height: cH };
  }, [container.length, container.width, container.height, units]);

  const hashString = (s: string): number => { 
    let h = 0; 
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i); 
    }
    return Math.abs(h); 
  };

  // -------- PACKING --------
// Replace your customPack function with this tight-packing version:

const customPack = useCallback((container: CargoContainer, items: CargoItem[]): CargoItem[] => {
  const result = items.map(item => ({ ...item, fitted: false }));
  const placed: CargoItem[] = [];

  // Sort items by volume (largest first) for better space utilization
  const sortedItems = [...result].sort((a, b) => {
    const volA = a.length * a.width * a.height;
    const volB = b.length * b.width * b.height;
    return volB - volA;
  });

  // Geometry collision check
  const overlaps = (
    a: {x: number; y: number; z: number; length: number; width: number; height: number}, 
    b: {x: number; y: number; z: number; length: number; width: number; height: number}
  ) => {
    return !(
      a.x >= b.x + b.length - 0.01 || 
      a.x + a.length <= b.x + 0.01 ||
      a.y >= b.y + b.width - 0.01 || 
      a.y + a.width <= b.y + 0.01 ||
      a.z >= b.z + b.height - 0.01 || 
      a.z + a.height <= b.z + 0.01
    );
  };

  // Find the best position with minimal gaps
  const findBestPosition = (L: number, W: number, H: number, item: CargoItem) => {
    const candidates = [];

    // Method 1: Try positions adjacent to existing items (tight packing)
    const adjacentPositions = [];
    
    if (placed.length === 0) {
      // First item goes at origin
      adjacentPositions.push({ x: 0, y: 0, z: 0 });
    } else {
      // Generate positions that are adjacent to existing items
      for (const existing of placed) {
        // Right side of existing item
        if (existing.x + existing.length + L <= container.length) {
          adjacentPositions.push({
            x: existing.x + existing.length,
            y: existing.y,
            z: existing.z
          });
        }
        
        // Front side of existing item
        if (existing.y + existing.width + W <= container.width) {
          adjacentPositions.push({
            x: existing.x,
            y: existing.y + existing.width,
            z: existing.z
          });
        }
        
        // Top of existing item (if stacking allowed)
        if (!existing.nonStackable && !item.nonStackable && existing.z + existing.height + H <= container.height) {
          adjacentPositions.push({
            x: existing.x,
            y: existing.y,
            z: existing.z + existing.height
          });
        }

        // Try positions that align with existing item edges
        for (const other of placed) {
          if (other.id === existing.id) continue;
          
          // Align with other item's right edge
          if (other.x + other.length + L <= container.length) {
            adjacentPositions.push({
              x: other.x + other.length,
              y: existing.y,
              z: existing.z
            });
          }
          
          // Align with other item's front edge
          if (other.y + other.width + W <= container.width) {
            adjacentPositions.push({
              x: existing.x,
              y: other.y + other.width,
              z: existing.z
            });
          }
        }
      }
    }

    // Test each adjacent position
    for (const pos of adjacentPositions) {
      const candidate = {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        length: L,
        width: W,
        height: H
      };

      // Check if position is within container bounds
      if (pos.x + L > container.length || pos.y + W > container.width || pos.z + H > container.height) {
        continue;
      }

      // Check for collisions
      if (placed.some(p => overlaps(candidate, p))) {
        continue;
      }

      // Check stacking support if not on ground
      let hasAdequateSupport = true;
      if (pos.z > 0) {
        if (item.nonStackable) {
          hasAdequateSupport = false;
        } else {
          let supportArea = 0;
          const requiredSupport = L * W * 0.7; // 70% support required
          
          for (const p of placed) {
            if (p.nonStackable) continue;
            
            // Check if this item provides support at our level
            if (Math.abs(p.z + p.height - pos.z) < 0.1) {
              const overlapX = Math.min(pos.x + L, p.x + p.length) - Math.max(pos.x, p.x);
              const overlapY = Math.min(pos.y + W, p.y + p.width) - Math.max(pos.y, p.y);
              
              if (overlapX > 0 && overlapY > 0) {
                supportArea += overlapX * overlapY;
              }
            }
          }
          
          hasAdequateSupport = supportArea >= requiredSupport;
        }
      }

      if (hasAdequateSupport) {
        // Calculate "tightness" score - prefer positions with more adjacent items
        let adjacencyScore = 0;
        let touchingItems = 0;
        
        for (const p of placed) {
          // Check if items are touching (sharing a face)
          const touchingX = (Math.abs(p.x + p.length - pos.x) < 0.1) || (Math.abs(pos.x + L - p.x) < 0.1);
          const touchingY = (Math.abs(p.y + p.width - pos.y) < 0.1) || (Math.abs(pos.y + W - p.y) < 0.1);
          const touchingZ = (Math.abs(p.z + p.height - pos.z) < 0.1) || (Math.abs(pos.z + H - p.z) < 0.1);
          
          const alignedX = (pos.x >= p.x && pos.x + L <= p.x + p.length) || (p.x >= pos.x && p.x + p.length <= pos.x + L) || (pos.x < p.x + p.length && pos.x + L > p.x);
          const alignedY = (pos.y >= p.y && pos.y + W <= p.y + p.width) || (p.y >= pos.y && p.y + p.width <= pos.y + W) || (pos.y < p.y + p.width && pos.y + W > p.y);
          const alignedZ = (pos.z >= p.z && pos.z + H <= p.z + p.height) || (p.z >= pos.z && p.z + p.height <= pos.z + H) || (pos.z < p.z + p.height && pos.z + H > p.z);
          
          if ((touchingX && alignedY && alignedZ) || (touchingY && alignedX && alignedZ) || (touchingZ && alignedX && alignedY)) {
            touchingItems++;
          }
        }
        
        adjacencyScore = touchingItems * 1000;
        
        // Prefer lower positions (z), then closer to back-left corner
        const priority = -adjacencyScore + pos.z * 100 + pos.y * 10 + pos.x;
        
        candidates.push({
          ...candidate,
          priority,
          touchingItems
        });
      }
    }

    // Method 2: If no good adjacent positions, try a systematic grid search
    if (candidates.length === 0) {
      const step = Math.min(L, W, H) / 4; // Smaller steps for better gap filling
      
      for (let z = 0; z <= container.height - H; z += step) {
        for (let y = 0; y <= container.width - W; y += step) {
          for (let x = 0; x <= container.length - L; x += step) {
            const candidate = { x, y, z, length: L, width: W, height: H };
            
            if (placed.some(p => overlaps(candidate, p))) continue;

            let isValid = true;
            if (z > 0) {
              if (item.nonStackable) {
                isValid = false;
              } else {
                let support = 0;
                for (const p of placed) {
                  if (p.nonStackable) continue;
                  if (Math.abs(p.z + p.height - z) < 1) {
                    const ox = Math.min(x + L, p.x + p.length) - Math.max(x, p.x);
                    const oy = Math.min(y + W, p.y + p.width) - Math.max(y, p.y);
                    if (ox > 0 && oy > 0) support += ox * oy;
                  }
                }
                isValid = support >= (L * W * 0.6);
              }
            }

            if (isValid) {
              const priority = z * 100 + y * 10 + x;
              candidates.push({ ...candidate, priority, touchingItems: 0 });
            }
          }
        }
      }
    }

    // Return the best candidate (highest adjacency score, lowest position)
    candidates.sort((a, b) => a.priority - b.priority);
    return candidates.length > 0 ? candidates[0] : null;
  };

  // Place each item
  for (const item of sortedItems) {
    let bestPosition: CargoItem | null = null;

    // Try different orientations
    const orientations = item.nonRotatable ? 
      [{ l: item.length, w: item.width, h: item.height }] :
      [
        { l: item.length, w: item.width, h: item.height },
        { l: item.width, w: item.length, h: item.height }
      ];

    for (const orient of orientations) {
      const { l: L, w: W, h: H } = orient;
      
      if (L > container.length || W > container.width || H > container.height) continue;

      const position = findBestPosition(L, W, H, item);
      
      if (position) {
        bestPosition = {
          ...item,
          x: position.x,
          y: position.y,
          z: position.z,
          length: L,
          width: W,
          height: H,
          fitted: true
        };
        break; // Use first fitting orientation
      }
    }

    // Place the item if we found a valid position
    if (bestPosition) {
      placed.push(bestPosition);
      const originalIndex = result.findIndex(r => r.id === item.id);
      if (originalIndex !== -1) {
        result[originalIndex] = bestPosition;
      }
    }
  }

  return result;
}, []);
  // -------- VISUALS --------
  const rebuildBoxes = useCallback(() => {
    if (!boxesGroupRef.current) return;
    const group = boxesGroupRef.current;
    while (group.children.length) group.remove(group.children[0]);

    const { length: cL, width: cW, height: cH } = getContainerCm();

    // Floor/base
    const baseGeo = new THREE.BoxGeometry(cL, 2, cW);
    const baseMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.2 
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(cL / 2, -1, cW / 2);
    group.add(base);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x999999, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide 
    });
    
    const back = new THREE.Mesh(new THREE.PlaneGeometry(cL, cH), wallMat); 
    back.position.set(cL / 2, cH / 2, 0); 
    group.add(back);
    
    const left = new THREE.Mesh(new THREE.PlaneGeometry(cW, cH), wallMat); 
    left.rotation.y = Math.PI / 2; 
    left.position.set(0, cH / 2, cW / 2); 
    group.add(left);
    
    const right = new THREE.Mesh(new THREE.PlaneGeometry(cW, cH), wallMat); 
    right.rotation.y = -Math.PI / 2; 
    right.position.set(cL, cH / 2, cW / 2); 
    group.add(right);

    // Unfitted area
    let outsideOffsetX = 50; 
    const outsideGap = 20;

    for (const item of itemsRef.current) {
      const hue = (hashString(item.name) % 360) / 360;
      const color = new THREE.Color().setHSL(hue, 0.6, item.fitted ? 0.55 : 0.3);
      const mat = new THREE.MeshStandardMaterial({ 
        color, 
        transparent: !item.fitted, 
        opacity: item.fitted ? 1 : 0.5 
      });
      const geo = new THREE.BoxGeometry(item.length, item.height, item.width);
      const mesh = new THREE.Mesh(geo, mat);

      let dx = item.x, dy = item.y, dz = item.z;
      if (!item.fitted) {
        dx = cL + outsideOffsetX; 
        dy = 0; 
        dz = 0; 
        outsideOffsetX += item.length + outsideGap;
        
        const wf = new THREE.LineSegments(
          new THREE.WireframeGeometry(geo), 
          new THREE.LineBasicMaterial({ color: 0xff0000 })
        );
        wf.position.set(dx + item.length / 2, dz + item.height / 2, dy + item.width / 2);
        group.add(wf);
      }

      mesh.position.set(dx + item.length / 2, dz + item.height / 2, dy + item.width / 2);
      group.add(mesh);
    }
  }, [getContainerCm]);

  const updateStatsAndRender = useCallback(() => {
    const totals = itemsRef.current;
    const fittedItems = totals.filter(i => i.fitted);
    const totalWeight = totals.reduce((s, i) => s + i.weight, 0);
    const fittedWeight = fittedItems.reduce((s, i) => s + i.weight, 0);

    const { length: cL, width: cW, height: cH } = getContainerCm();
    const containerVolume = cL * cW * cH;
    const usedVolume = fittedItems.reduce((s, i) => s + i.length * i.width * i.height, 0);
    const efficiency = containerVolume > 0 ? Math.round((usedVolume / containerVolume) * 100) : 0;

    setStats({
      totalItems: totals.length,
      fitted: fittedItems.length,
      unfitted: totals.length - fittedItems.length,
      efficiency,
      totalWeight: Math.round(totalWeight * 100) / 100,
      fittedWeight: Math.round(fittedWeight * 100) / 100,
    });

    rebuildBoxes();
    forceRerender(v => v + 1);
  }, [getContainerCm, rebuildBoxes]);

  // Minimal custom orbit controls
  const setupOrbitControls = useCallback((camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): OrbitControlsLike => {
    let isMouseDown = false; 
    let mouseX = 0, mouseY = 0;
    let targetX = 600, targetY = 400, targetZ = 800;
    let currentX = targetX, currentY = targetY, currentZ = targetZ;

    const onMouseDown = (e: MouseEvent) => { 
      isMouseDown = true; 
      mouseX = e.clientX; 
      mouseY = e.clientY; 
      renderer.domElement.style.cursor = "grabbing"; 
    };
    
    const onMouseMove = (e: MouseEvent) => { 
      if (!isMouseDown) return; 
      const dx = e.clientX - mouseX; 
      const dy = e.clientY - mouseY; 
      targetX = Math.max(200, Math.min(1500, targetX - dx)); 
      targetY = Math.max(100, Math.min(800, targetY + dy)); 
      mouseX = e.clientX; 
      mouseY = e.clientY; 
    };
    
    const onMouseUp = () => { 
      isMouseDown = false; 
      renderer.domElement.style.cursor = "grab"; 
    };
    
    const onWheel = (e: WheelEvent) => { 
      targetZ = Math.max(300, Math.min(2000, targetZ + e.deltaY * 0.5)); 
      e.preventDefault(); 
    };

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel);

    return {
      update: () => {
        const { length: cL, width: cW } = getContainerCm();
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        currentZ += (targetZ - currentZ) * 0.08;
        camera.position.set(currentX, currentY, currentZ);
        camera.lookAt(cL / 2, 0, cW / 2);
      },
      dispose: () => {
        renderer.domElement.removeEventListener("mousedown", onMouseDown);
        renderer.domElement.removeEventListener("mousemove", onMouseMove);
        renderer.domElement.removeEventListener("mouseup", onMouseUp);
        renderer.domElement.removeEventListener("mouseleave", onMouseUp);
        renderer.domElement.removeEventListener("wheel", onWheel);
        renderer.domElement.style.cursor = "default";
      }
    };
  }, [getContainerCm]);

  // Init Three.js
  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const width = 1500, height = 580;

    const scene = new THREE.Scene(); 
    scene.background = new THREE.Color(0xf5f7fb);
    
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 5000); 
    camera.position.set(600, 400, 800);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true }); 
    renderer.setSize(width, height);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9); 
    dir.position.set(500, 1000, 500); 
    scene.add(dir);
    
    const amb = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(amb);
    
    const grid = new THREE.GridHelper(2000, 40, 0xcccccc, 0xeeeeee); 
    scene.add(grid);

    const boxesGroup = new THREE.Group(); 
    scene.add(boxesGroup);

    const controls = setupOrbitControls(camera, renderer);
    el.appendChild(renderer.domElement);

    sceneRef.current = scene; 
    rendererRef.current = renderer; 
    cameraRef.current = camera; 
    controlsRef.current = controls; 
    boxesGroupRef.current = boxesGroup;

    let frameId: number;
    const animate = () => { 
      controls.update(); 
      renderer.render(scene, camera); 
      frameId = requestAnimationFrame(animate); 
    };
    animate();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      controls.dispose(); 
      renderer.dispose();
      if (renderer.domElement && el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
      sceneRef.current = null; 
      rendererRef.current = null; 
      cameraRef.current = null; 
      controlsRef.current = null; 
      boxesGroupRef.current = null;
    };
  }, [setupOrbitControls]);

  // -------- Actions --------
  const addItem = useCallback(() => {
    const l = Number(itemInput.length);
    const w = Number(itemInput.width);
    const h = Number(itemInput.height);
    const wt = Number(itemInput.weight); 
    const qty = Math.max(1, Math.floor(Number(itemInput.quantity) || 1));
    const nm = itemInput.name.trim() || "Item";
    
    if (!(l > 0 && w > 0 && h > 0 && wt > 0 && qty > 0)) return;

    const lcm = toCm(l, units);
    const wcm = toCm(w, units);
    const hcm = toCm(h, units);
    const kg = weightToKg(wt, weightUnits);
    
    const newItems: CargoItem[] = Array.from({ length: qty }, (_, i) => ({
      id: uid(), 
      name: qty > 1 ? `${nm} #${i + 1}` : nm,
      length: lcm, 
      width: wcm, 
      height: hcm, 
      x: 0, 
      y: 0, 
      z: 0, 
      fitted: false,
      weight: kg, 
      quantity: 1,
      nonStackable: itemInput.nonStackable, 
      nonRotatable: itemInput.nonRotatable,
    }));

    itemsRef.current.push(...newItems);
    updateStatsAndRender();
  }, [itemInput, units, weightUnits, updateStatsAndRender]);

  const clearItems = useCallback(() => { 
    itemsRef.current = []; 
    updateStatsAndRender(); 
  }, [updateStatsAndRender]);

  const removeItem = useCallback((id: string) => { 
    itemsRef.current = itemsRef.current.filter(i => i.id !== id); 
    updateStatsAndRender(); 
  }, [updateStatsAndRender]);

  const fitItems = useCallback(() => {
    const { length: cL, width: cW, height: cH } = getContainerCm();
    if (cL <= 0 || cW <= 0 || cH <= 0) { 
      alert("Please enter valid container dimensions"); 
      return; 
    }

    const packed = customPack({ length: cL, width: cW, height: cH }, itemsRef.current.map(i => ({ ...i })));
    const byId = new Map(packed.map(p => [p.id, p] as const));
    itemsRef.current = itemsRef.current.map(i => {
      const p = byId.get(i.id);
      return p ? { 
        ...i, 
        x: p.x, 
        y: p.y, 
        z: p.z, 
        length: p.length, 
        width: p.width, 
        height: p.height, 
        fitted: p.fitted 
      } : i;
    });

    updateStatsAndRender();
  }, [getContainerCm, customPack, updateStatsAndRender]);

  const applyPreset = useCallback((key: string) => {
    const preset = containerPresets[key]; 
    if (!preset) return;
    const L = fromCm(toCm(preset.length, preset.units), units);
    const W = fromCm(toCm(preset.width, preset.units), units);
    const H = fromCm(toCm(preset.height, preset.units), units);
    setContainer({ 
      length: L.toFixed(1), 
      width: W.toFixed(1), 
      height: H.toFixed(1) 
    });
  }, [units]);

  useEffect(() => { 
    updateStatsAndRender(); 
  }, [updateStatsAndRender]);

// -------- RENDER --------
  return (
  <div className="cargo-fitter">
    <div className="cargo-container">
      {/* Header */}
      <div className="cargo-section">
        <h2>Cargo Fitter 3D</h2>
        <p>Interactive 3D cargo loading optimization with Next.js and Three.js</p>
      </div>

      {/* Three main sections in a row */}
      <div className="cargo-controls">
        {/* Container Settings */}
        <div className="cargo-section">
          <h3>Container Dimensions</h3>
          <div className="cargo-dimension-inputs">
            <div className="cargo-dimension-group">
              <label>Length ({units})</label>
              <input
                className="cargo-input"
                value={container.length}
                onChange={e => setContainer({ ...container, length: e.target.value })}
              />
            </div>
            <div className="cargo-dimension-group">
              <label>Width ({units})</label>
              <input
                className="cargo-input"
                value={container.width}
                onChange={e => setContainer({ ...container, width: e.target.value })}
              />
            </div>
            <div className="cargo-dimension-group">
              <label>Height ({units})</label>
              <input
                className="cargo-input"
                value={container.height}
                onChange={e => setContainer({ ...container, height: e.target.value })}
              />
            </div>
          </div>

          <div className="cargo-input-group">
            <label>Units</label>
            <select className="cargo-input" value={units} onChange={e => setUnits(e.target.value)}>
              <option value="in">Inches (in)</option>
              <option value="ft">Feet (ft)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="m">Meters (m)</option>
            </select>
          </div>

          <div className="cargo-input-group">
            <label>Equipment Presets</label>
            <select
              className="cargo-input"
              onChange={(e) => {
                if (e.target.value) {
                  applyPreset(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="">-- Select Equipment --</option>
              <optgroup label="Trucks & Trailers">
                <option value="53-truck">53' Truck Trailer</option>
                <option value="48-truck">48' Truck Trailer</option>
                <option value="sprinter">Mercedes Sprinter Van</option>
              </optgroup>
              <optgroup label="Sea Containers">
                <option value="20ft-dv">20ft Dry Van Container</option>
                <option value="40ft-dv">40ft Dry Van Container</option>
                <option value="40ft-hc">40ft High Cube Container</option>
                <option value="45ft-hq">45ft High Cube Container</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Add Cargo Item */}
        <div className="cargo-section">
          <h3>Add Cargo Item</h3>
          <div className="cargo-dimension-inputs">
            <div className="cargo-dimension-group">
              <label>Length ({units})</label>
              <input
                className="cargo-input"
                value={itemInput.length}
                onChange={e => setItemInput({ ...itemInput, length: e.target.value })}
              />
            </div>
            <div className="cargo-dimension-group">
              <label>Width ({units})</label>
              <input
                className="cargo-input"
                value={itemInput.width}
                onChange={e => setItemInput({ ...itemInput, width: e.target.value })}
              />
            </div>
            <div className="cargo-dimension-group">
              <label>Height ({units})</label>
              <input
                className="cargo-input"
                value={itemInput.height}
                onChange={e => setItemInput({ ...itemInput, height: e.target.value })}
              />
            </div>
          </div>

          <div className="cargo-input-group">
            <label>Weight ({weightUnits})</label>
            <input
              className="cargo-input"
              value={itemInput.weight}
              onChange={e => setItemInput({ ...itemInput, weight: e.target.value })}
            />
          </div>

          <div className="cargo-input-group">
            <label>Weight Units</label>
            <select className="cargo-input" value={weightUnits} onChange={e => setWeightUnits(e.target.value)}>
              <option value="lb">Pounds (lb)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="oz">Ounces (oz)</option>
              <option value="g">Grams (g)</option>
            </select>
          </div>

          <div className="cargo-input-group">
            <label>Quantity</label>
            <input
              className="cargo-input"
              value={itemInput.quantity}
              onChange={e => setItemInput({ ...itemInput, quantity: e.target.value })}
            />
          </div>

          <div className="cargo-input-group">
            <label>Name</label>
            <input
              className="cargo-input"
              value={itemInput.name}
              onChange={e => setItemInput({ ...itemInput, name: e.target.value })}
            />
          </div>

          <div className="cargo-checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={itemInput.nonStackable}
                onChange={e => setItemInput({ ...itemInput, nonStackable: e.target.checked })}
              />
              Non-stackable
            </label>
            <label>
              <input
                type="checkbox"
                checked={itemInput.nonRotatable}
                onChange={e => setItemInput({ ...itemInput, nonRotatable: e.target.checked })}
              />
              Non-rotatable
            </label>
          </div>

          <div className="cargo-btn-group">
            <button onClick={addItem} className="cargo-btn cargo-btn-success">
              Add Item
            </button>
            <button onClick={clearItems} className="cargo-btn cargo-btn-danger">
              Clear All
            </button>
            <button onClick={fitItems} className="cargo-btn">
              Optimize Fit
            </button>
          </div>
          </div>

        {/* Stats */}
        <div className="cargo-section">
          <h3>Loading Statistics</h3>
          <div className="cargo-stats">
            <div className="cargo-stat-card">
              <div className="cargo-stat-value">{stats.totalItems}</div>
              <div className="cargo-stat-label">Total Items</div>
            </div>
            <div className="cargo-stat-card">
              <div className="cargo-stat-value">{stats.fitted}</div>
              <div className="cargo-stat-label">✅ Fitted</div>
            </div>
            <div className="cargo-stat-card">
              <div className="cargo-stat-value">{stats.unfitted}</div>
              <div className="cargo-stat-label">❌ Unfitted</div>
            </div>
            <div className="cargo-stat-card">
              <div className="cargo-stat-value">{stats.efficiency}%</div>
              <div className="cargo-stat-label">Space Efficiency</div>
            </div>
            <div className="cargo-stat-card">
              <div className="cargo-stat-value">
                {(weightFromKg(stats.totalWeight, weightUnits) || 0).toFixed(1)}
              </div>
              <div className="cargo-stat-label">Total Weight ({weightUnits})</div>
            </div>
            <div className="cargo-stat-card">
              <div className="cargo-stat-value">
                {(weightFromKg(stats.fittedWeight, weightUnits) || 0).toFixed(1)}
              </div>
              <div className="cargo-stat-label">Fitted Weight ({weightUnits})</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="cargo-visualization">
        <h4>3D Cargo Visualization</h4>
        <p>Controls: Drag to rotate • Scroll to zoom • Green = Fitted • Red wireframe = Unfitted</p>
        <div ref={mountRef} style={{ height: "560px", background: "#f8fafc" }} />
      </div>

      {/* Items List */}
      <div className="cargo-items-section">
        <h4>Items List</h4>
        <div className="cargo-items-list">
          {itemsRef.current.length === 0 ? (
            <div className="cargo-items-empty">
              <p>No items added yet</p>
              <p>Add items to see them here</p>
            </div>
          ) : (
            <div>
              {itemsRef.current.map(item => (
                <div 
                  key={item.id} 
                  className={`cargo-item ${item.fitted ? 'cargo-item-fitted' : 'cargo-item-unfitted'}`}
                >
                  <div className="cargo-item-info">
                    <div className="cargo-item-name">{item.name}</div>
                    <div className="cargo-item-dimensions">
                      {fromCm(item.length, units).toFixed(1)} × {fromCm(item.width, units).toFixed(1)} × {fromCm(item.height, units).toFixed(1)} {units}
                    </div>
                    <div className="cargo-item-weight">
                      {(weightFromKg(item.weight, weightUnits) || 0).toFixed(2)} {weightUnits}
                    </div>
                  </div>
                  <div className="cargo-item-status">
                    <span className="cargo-item-icon">{item.fitted ? "✅" : "❌"}</span>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="cargo-item-remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How to Use */}
      <div className="cargo-instructions">
        <h4>How to Use</h4>
        <div className="cargo-instructions-grid">
          <div className="cargo-instruction-item">
            <h5>1. Set Container</h5>
            <p>Define your container dimensions or choose a preset.</p>
          </div>
          <div className="cargo-instruction-item">
            <h5>2. Add Items</h5>
            <p>Add items with dimensions, weight, and quantity.</p>
          </div>
          <div className="cargo-instruction-item">
            <h5>3. Optimize</h5>
            <p>Click "Optimize Fit" to arrange items efficiently.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}