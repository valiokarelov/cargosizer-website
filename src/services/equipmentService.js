// Enhanced equipment service with recommendation logic
import containersData from '../data/containers.json'

// Get all equipment
export const getAllEquipment = () => {
  return containersData
}

// Get equipment grouped by category
export const getEquipmentByCategory = () => {
  const equipment = getAllEquipment()
  const grouped = {}
  
  Object.values(equipment).forEach(item => {
    const category = item.category || 'Other'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(item)
  })
  
  return grouped
}

// Equipment recommendation logic
export const getEquipmentRecommendations = (requirements) => {
  const equipment = getAllEquipment()
  const recommendations = []
  
  // Extract requirements
  const {
    totalVolume = 0,
    totalWeight = 0,
    temperatureRequired = false,
    tempRange = null,
    maxTransitHours = null,
    specialRequirements = [],
    routeType = null
  } = requirements
  
  Object.values(equipment).forEach(item => {
    let score = 0
    let reasons = []
    let issues = []
    
    // Check basic capacity
    if (totalVolume <= item.volume && totalWeight <= item.maxWeight) {
      score += 50
      reasons.push('Sufficient capacity')
    } else {
      if (totalVolume > item.volume) {
        issues.push(`Volume exceeded by ${(totalVolume - item.volume).toFixed(1)} CBM`)
      }
      if (totalWeight > item.maxWeight) {
        issues.push(`Weight exceeded by ${(totalWeight - item.maxWeight).toFixed(0)} kg`)
      }
    }
    
    // Temperature requirements
    if (temperatureRequired) {
      if (item.temperatureControlled) {
        score += 30
        reasons.push('Temperature controlled')
        
        // Check specific temperature range if provided
        if (tempRange && item.tempRange.includes(tempRange)) {
          score += 10
          reasons.push('Matches temperature range')
        }
      } else {
        score -= 30
        issues.push('No temperature control')
      }
    } else if (!temperatureRequired && !item.temperatureControlled) {
      score += 10
      reasons.push('No unnecessary temperature control')
    }
    
    // Transit time constraints
    if (maxTransitHours && item.maxTransitHours) {
      if (maxTransitHours <= item.maxTransitHours) {
        score += 15
        reasons.push('Suitable for transit time')
      } else {
        score -= 20
        issues.push(`Transit time limit exceeded`)
      }
    }
    
    // Route compatibility
    if (routeType && item.typicalRoutes.includes(routeType)) {
      score += 20
      reasons.push('Route compatible')
    }
    
    // Special features matching
    specialRequirements.forEach(req => {
      if (item.specialFeatures.includes(req)) {
        score += 15
        reasons.push(`Has ${req}`)
      }
    })
    
    // Efficiency scoring (prefer good utilization)
    if (totalVolume > 0 && item.volume > 0) {
      const utilization = (totalVolume / item.volume) * 100
      if (utilization >= 70 && utilization <= 95) {
        score += 20
        reasons.push('Excellent space utilization')
      } else if (utilization >= 50 && utilization < 70) {
        score += 10
        reasons.push('Good space utilization')
      } else if (utilization > 95) {
        score -= 10
        issues.push('Very tight fit')
      }
    }
    
    // Cost considerations
    if (item.costCategory === 'standard') {
      score += 5
      reasons.push('Cost effective')
    } else if (item.costCategory === 'premium') {
      score -= 5
      issues.push('Premium pricing')
    }
    
    // Only include if basic requirements are met
    if (score > 0) {
      recommendations.push({
        equipment: item,
        score: Math.max(0, score),
        reasons,
        issues,
        utilization: totalVolume > 0 ? Math.min(100, (totalVolume / item.volume) * 100) : 0,
        suitable: issues.length === 0
      })
    }
  })
  
  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score)
}

// Filter equipment by specific criteria
export const filterEquipment = (filters) => {
  const equipment = getAllEquipment()
  const {
    category = null,
    temperatureControlled = null,
    powerRequired = null,
    minVolume = 0,
    maxVolume = Infinity,
    specialFeatures = []
  } = filters
  
  return Object.values(equipment).filter(item => {
    // Category filter
    if (category && item.category !== category) return false
    
    // Temperature control filter
    if (temperatureControlled !== null && item.temperatureControlled !== temperatureControlled) return false
    
    // Power requirement filter
    if (powerRequired !== null && item.powerRequired !== powerRequired) return false
    
    // Volume range filter
    if (item.volume < minVolume || item.volume > maxVolume) return false
    
    // Special features filter
    if (specialFeatures.length > 0) {
      const hasAllFeatures = specialFeatures.every(feature => 
        item.specialFeatures.includes(feature)
      )
      if (!hasAllFeatures) return false
    }
    
    return true
  })
}

// Get equipment by temperature capability
export const getTemperatureCapableEquipment = () => {
  const equipment = getAllEquipment()
  return Object.values(equipment).filter(item => item.temperatureControlled)
}

// Get equipment categories
export const getEquipmentCategories = () => {
  const equipment = getAllEquipment()
  const categories = new Set()
  
  Object.values(equipment).forEach(item => {
    categories.add(item.category)
  })
  
  return Array.from(categories).sort()
}