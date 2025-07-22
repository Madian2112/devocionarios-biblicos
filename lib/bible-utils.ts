export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export interface ParsedReference {
  book: string;
  startChapter: number;
  startVerse?: number;
  endChapter?: number;
  endVerse?: number;
}

export function parseReference(ref: string): ParsedReference | null {
  if (!ref) return null;

  const normalizedRef = ref.trim();
  
  // Intenta coincidir con referencias de versículos: ej., "Juan 3:16", "Juan 3:16-18"
  const verseMatch = normalizedRef.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (verseMatch) {
    const [, bookName, chapter, startVerse, endVerse] = verseMatch;
    return {
      book: normalizeText(bookName.trim()),
      startChapter: parseInt(chapter, 10),
      startVerse: parseInt(startVerse, 10),
      endVerse: endVerse ? parseInt(endVerse, 10) : undefined,
    };
  }

  // Intenta coincidir con referencias de capítulos: ej., "Juan 3", "Juan 3-5"
  const chapterMatch = normalizedRef.match(/^(.+?)\s+(\d+)(?:-(\d+))?$/);
  if (chapterMatch) {
    const [, bookName, startChapter, endChapter] = chapterMatch;
    return {
      book: normalizeText(bookName.trim()),
      startChapter: parseInt(startChapter, 10),
      endChapter: endChapter ? parseInt(endChapter, 10) : undefined,
    };
  }

  return null;
} 