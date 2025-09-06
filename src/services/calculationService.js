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

  console.log(`Calculating volume for container: ${containerId}`)

  return {
    totalVolume: totalVolume.toFixed(3),
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
    const response = await fetch(`${API_BASE}/api/volume-calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cargo,
        containerId,
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
    return calculateVolumeLocally(cargo, containerId, units)
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