import containersData from '../data/containers.json'
import pharmaData from '../data/pharma-units.json'

// Combine all equipment into a single object
const getAllEquipment = () => {
  const equipment = {}
  
  // Add ocean containers
  containersData.ocean.forEach(container => {
    equipment[container.id] = container
  })
  
  // Add truck containers
  containersData.truck.forEach(container => {
    equipment[container.id] = container
  })
  
  // Add pharma units
  pharmaData.active.forEach(unit => {
    equipment[unit.id] = unit
  })
  
  pharmaData.passive.forEach(unit => {
    equipment[unit.id] = unit
  })
  
  return equipment
}

// Get equipment by category
const getEquipmentByCategory = () => {
  return {
    "Ocean": containersData.ocean,
    "Truck": containersData.truck,
    "Active Temp": pharmaData.active,
    "Passive Temp": pharmaData.passive
  }
}

// Get single equipment by ID
const getEquipmentById = (id) => {
  const allEquipment = getAllEquipment()
  return allEquipment[id] || null
}

export {
  getAllEquipment,
  getEquipmentByCategory,
  getEquipmentById
}