import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param birthDate - Date de naissance au format YYYY-MM-DD
 * @returns L'âge en années et mois
 */
export function calculateAge(birthDate: string): string {
  if (!birthDate) return "Âge inconnu";
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (isNaN(birth.getTime())) return "Date invalide";
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  // Ajuster si l'anniversaire n'est pas encore passé cette année
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  
  if (years === 0) {
    if (months === 0) {
      const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} jour${days > 1 ? 's' : ''}`;
    }
    return `${months} mois`;
  } else if (months === 0) {
    return `${years} an${years > 1 ? 's' : ''}`;
  } else {
    return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
  }
}

/**
 * Calcule l'âge en années seulement
 * @param birthDate - Date de naissance au format YYYY-MM-DD
 * @returns L'âge en années
 */
export function calculateAgeInYears(birthDate: string): number {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (isNaN(birth.getTime())) return 0;
  
  let years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  
  // Ajuster si l'anniversaire n'est pas encore passé cette année
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  
  return Math.max(0, years);
}

/**
 * Formate une date pour l'affichage
 * @param dateString - Date au format YYYY-MM-DD
 * @returns Date formatée
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "Non renseigné";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Date invalide";
  
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
