import { ScaffoldingMode } from '../types';

const SPANISH_VOWELS = /[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/g;

/**
 * Transforms Spanish text according to the selected scaffolding level:
 * - full: unmodified ("Hola", "Buenos días")
 * - vowels_removed: vowels replaced with asterisks ("H*l*", "B**n*s d**s")
 * - initials_only: only the first letter of each word preserved ("H***", "B***** d***")
 * - no_scaffolding: every alphanumeric letter turned into asterisk ("****", "****** ****")
 */
export function getScaffoldedText(text: string, mode: ScaffoldingMode): string {
  if (!text) return '';
  if (mode === 'full') return text;

  if (mode === 'vowels_removed') {
    return text.replace(SPANISH_VOWELS, '*');
  }

  if (mode === 'initials_only') {
    // Replace each word's continuation letters with *
    // Using regex matching letters \p{L}
    return text.replace(/(\p{L})(\p{L}*)/gu, (_match, firstChar, restOfWord) => {
      return firstChar + '*'.repeat(restOfWord.length);
    });
  }

  if (mode === 'no_scaffolding') {
    // Replace all letters and digits with *
    return text.replace(/\p{L}|\p{N}/gu, '*');
  }

  return text;
}

/**
 * Returns scaffolding description for teacher clarity
 */
export function getScaffoldingLabel(mode: ScaffoldingMode): string {
  switch (mode) {
    case 'full':
      return 'Full Words (Normal)';
    case 'vowels_removed':
      return 'Partial (Vowels Removed: H*l*)';
    case 'initials_only':
      return 'Initials Only (H***)';
    case 'no_scaffolding':
      return 'No Clues (****)';
  }
}
