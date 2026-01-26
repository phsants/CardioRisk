// Utility functions
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Cria URL para uma página baseada no nome
 * @param {string} pageName - Nome da página (Home, NewAssessment, History, Guidelines)
 * @returns {string} URL da página
 */
export function createPageUrl(pageName) {
  const routes = {
    Home: '/home',
    NewAssessment: '/new-assessment',
    History: '/history',
    Guidelines: '/guidelines',
  }
  
  return routes[pageName] || '/home'
}

/**
 * Classe CSS helper (combina clsx e tailwind-merge)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


