// Temporary mapping solution for species constraint issue
// This maps dynamic species from app settings to the database-constrained values

export const CONSTRAINED_SPECIES = ['Chien', 'Chat', 'Oiseau', 'Lapin', 'Furet', 'Autre'] as const;

export type ConstrainedSpecies = typeof CONSTRAINED_SPECIES[number];

/**
 * Maps a dynamic species name to a constrained database species value
 * This is a temporary solution until the database constraint is removed
 */
export function mapToConstrainedSpecies(species: string): ConstrainedSpecies {
  const normalized = species.toLowerCase();
  
  // Exact matches first
  if (CONSTRAINED_SPECIES.includes(species as ConstrainedSpecies)) {
    return species as ConstrainedSpecies;
  }
  
  // Common mappings
  const mappings: Record<string, ConstrainedSpecies> = {
    // Bovine mappings
    'bovin': 'Autre',
    'bovins': 'Autre',
    'vache': 'Autre',
    'taureau': 'Autre',
    'boeuf': 'Autre',
    
    // Équine mappings  
    'cheval': 'Autre',
    'équin': 'Autre',
    'jument': 'Autre',
    'poulain': 'Autre',
    'âne': 'Autre',
    
    // Ovine/Caprine mappings
    'mouton': 'Autre',
    'brebis': 'Autre',
    'agneau': 'Autre',
    'ovin': 'Autre',
    'chèvre': 'Autre',
    'bouc': 'Autre',
    'caprin': 'Autre',
    
    // Porcine mappings
    'porc': 'Autre',
    'cochon': 'Autre',
    'truie': 'Autre',
    'porcin': 'Autre',
    
    // Bird mappings (already has Oiseau)
    'volaille': 'Oiseau',
    'poule': 'Oiseau',
    'coq': 'Oiseau',
    'canard': 'Oiseau',
    'oie': 'Oiseau',
    'dindon': 'Oiseau',
    
    // Small animals
    'hamster': 'Autre',
    'souris': 'Autre',
    'rat': 'Autre',
    'cochon d\'inde': 'Autre',
    'chinchilla': 'Autre',
    
    // Reptiles
    'reptile': 'Autre',
    'serpent': 'Autre',
    'lézard': 'Autre',
    'tortue': 'Autre',
    
    // Fish
    'poisson': 'Autre',
    'aquarium': 'Autre'
  };
  
  // Try exact mapping
  if (mappings[normalized]) {
    return mappings[normalized];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default to 'Autre' for any unmapped species
  return 'Autre';
}

/**
 * Validates if a species can be stored in the database
 */
export function isValidConstrainedSpecies(species: string): species is ConstrainedSpecies {
  return CONSTRAINED_SPECIES.includes(species as ConstrainedSpecies);
}

/**
 * Gets the display name for a species (for UI purposes)
 * This allows showing the original species name while storing the mapped value
 */
export function getSpeciesDisplayName(originalSpecies: string, mappedSpecies: ConstrainedSpecies): string {
  // If they're the same, just return the original
  if (originalSpecies === mappedSpecies) {
    return originalSpecies;
  }
  
  // If different, show both
  return `${originalSpecies} (${mappedSpecies})`;
}