export function checkContact(resume: string): boolean {
  return /@/.test(resume) && /\d{3}/.test(resume);
}

export function checkSections(resume: string): boolean {
  return /education/i.test(resume) && /(skills|experience|projects)/i.test(resume);
}

export function formatScore(hasContact: boolean, hasSections: boolean): number {
  return (hasContact ? 50 : 20) + (hasSections ? 50 : 20);
}
