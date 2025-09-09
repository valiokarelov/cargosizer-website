const API_BASE = import.meta.env.VITE_API_URL || 'https://freight-calculator-backend.onrender.com'

// Local calculation functions (current implementation)
export const calculateVolumeLocally = (cargo, containerId, units) => {
  let totalVolume = 0
  const cargoDetails = []

  cargo.forEach((item, index) => {
    let l = parseFloat(item.length) || 0
    let w = parseFloat(item.width) || 0
    let h = parseFloat(item.height) || 0
    const q = parseInt(item.quantity) || 0

    // Convert inches to cm if needed
    if (units === 'in') {
      l = l * 2.54
      w = w * 2.54
      h = h * 2.54
    }

    const itemVolume = (l * w * h) / 1000000 // Convert to CBM
    const totalItemVolume = itemVolume * q
    totalVolume += totalItemVolume

    if (l > 0 && w > 0 && h > 0 && q > 0) {
      cargoDetails.push({
        index: index + 1,
        dimensions: units === 'cm' 
          ? `${item.length} × ${item.width} × ${item.height} cm`
          : `${item.length} × ${item.width} × ${item.height} in`,
        quantity: q,
        unitVolume: itemVolume.toFixed(3),
        totalVolume: totalItemVolume.toFixed(3)
      })
    }
  })

  // Use containerId parameter for logging
  console.log(`Calculating volume for container: ${containerId}`)

  return {
    totalVolume: totalVolume,  
    cargoDetails,
    containerId,
    units
  }
}

export const calculateWeightLocally = (dimensions, mode, units) => {
  let length = parseFloat(dimensions.length) || 0
  let width = parseFloat(dimensions.width) || 0  
  let height = parseFloat(dimensions.height) || 0
  let weight = parseFloat(dimensions.weight) || 0

  // Convert units if needed  
  if (units === 'in') {
    length = length * 2.54
    width = width * 2.54
    height = height * 2.54
  }

  const volume = (length * width * height) / 1000000 // CBM
  let chargeableWeight = weight

  if (mode === 'air') {
    const volumetricWeight = volume * 167 // Air freight factor
    chargeableWeight = Math.max(weight, volumetricWeight)
  } else if (mode === 'ocean') {
    const volumetricWeight = volume * 1000 // Ocean freight factor  
    chargeableWeight = Math.max(weight, volumetricWeight)
  }

  return {
    actualWeight: weight.toFixed(2),
    volumetricWeight: (volume * (mode === 'air' ? 167 : 1000)).toFixed(2),
    chargeableWeight: chargeableWeight.toFixed(2),
    volume: volume.toFixed(3),
    mode,
    units
  }
}

// Future backend integration
export const calculateVolumeOnBackend = async (cargo, containerId, units) => {
  try {
    // Get container information for the API call
    const { getAllEquipment } = await import('./equipmentService')
    const allEquipment = getAllEquipment()
    const containerInfo = allEquipment[containerId]
    
    if (!containerInfo) {
      throw new Error(`Container ${containerId} not found`)
    }

    // Prepare cargo data for backend
    const cargoItems = cargo.filter(item => 
      parseFloat(item.length) > 0 && 
      parseFloat(item.width) > 0 && 
      parseFloat(item.height) > 0 && 
      parseInt(item.quantity) > 0
    ).map((item, index) => {
      // Convert units to cm for backend
      let l = parseFloat(item.length)
      let w = parseFloat(item.width) 
      let h = parseFloat(item.height)
      const q = parseInt(item.quantity)

      if (units === 'in') {
        l = l * 2.54
        w = w * 2.54
        h = h * 2.54
      }

      return {
        id: `item-${index}`,
        length: l,
        width: w,
        height: h,
        quantity: q,
        name: `Item ${index + 1}`
      }
    })

    if (cargoItems.length === 0) {
      return {
        totalVolume: '0.000',
        fittedVolume: '0.000',
        unfittedVolume: '0.000',
        spatiallyValid: true,
        cargoDetails: [],
        fittingIssues: []
      }
    }

    const requestData = {
      container: {
        id: containerId,
        length: containerInfo.dimensions?.length || containerInfo.volume * 100, // fallback calculation
        width: containerInfo.dimensions?.width || 200,
        height: containerInfo.dimensions?.height || 200,
        maxWeight: containerInfo.maxWeight
      },
      cargo: cargoItems,
      options: {
        units: 'cm', // Backend expects cm
        algorithm: 'bin-packing-3d',
        optimizeFor: 'space-efficiency'
      }
    }

    const response = await fetch(`${API_BASE}/api/volume-calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`)
    }
    
    const result = await response.json()

    // Process backend response
    const processedResult = {
      totalVolume: result.totalVolume?.toFixed(3) || '0.000',
      fittedVolume: result.fittedVolume?.toFixed(3) || '0.000', 
      unfittedVolume: result.unfittedVolume?.toFixed(3) || '0.000',
      spatiallyValid: result.allItemsFit || false,
      fittingIssues: result.issues || [],
      cargoDetails: result.itemPlacements?.map(placement => ({
        index: placement.itemIndex + 1,
        dimensions: units === 'cm' 
          ? `${placement.originalDimensions.length} × ${placement.originalDimensions.width} × ${placement.originalDimensions.height} cm`
          : `${(placement.originalDimensions.length / 2.54).toFixed(1)} × ${(placement.originalDimensions.width / 2.54).toFixed(1)} × ${(placement.originalDimensions.height / 2.54).toFixed(1)} in`,
        quantity: placement.quantity,
        unitVolume: ((placement.originalDimensions.length * placement.originalDimensions.width * placement.originalDimensions.height) / 1000000).toFixed(3),
        totalVolume: ((placement.originalDimensions.length * placement.originalDimensions.width * placement.originalDimensions.height * placement.quantity) / 1000000).toFixed(3),
        fitted: placement.fitted || false,
        position: placement.position || null
      })) || [],
      loadingSequence: result.loadingSequence || []
    }

    return processedResult
    
  } catch (error) {
    console.error('Backend calculation failed:', error)
    
    // Enhanced fallback with clear messaging
    return {
      error: `3D Spatial calculation unavailable: ${error.message}. Using local volume calculation.`,
      fallbackUsed: true,
      // Fall back to local calculation
      ...calculateVolumeLocally(cargo, containerId, units)
    }
  }
}

export const calculateWeightOnBackend = async (dimensions, mode, units) => {
  try {
    const response = await fetch(`${API_BASE}/api/weight-calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dimensions,
        mode,
        units
      })
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Backend calculation failed:', error)
    // Fallback to local calculation
    return calculateWeightLocally(dimensions, mode, units)
  }
}

// Main calculation functions that choose between local/backend
export const calculateVolume = async (cargo, containerId, units, useBackend = false) => {
  if (useBackend) {
    return await calculateVolumeOnBackend(cargo, containerId, units)
  } else {
    return calculateVolumeLocally(cargo, containerId, units)
  }
}

export const calculateWeight = async (dimensions, mode, units, useBackend = false) => {
  if (useBackend) {
    return await calculateWeightOnBackend(dimensions, mode, units)
  } else {
    return calculateWeightLocally(dimensions, mode, units)
  }
}