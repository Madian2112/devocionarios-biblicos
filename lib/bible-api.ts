import { parseReference } from './bible-utils';

interface Verse {
  verse: string;
  number: number;
  study?: string;
  id: number;
}

interface ChapterData {
  testament: string;
  name: string;
  num_chapters: number;
  chapter: number;
  vers: Verse[];
}

export async function fetchVerseText(reference: string, version: string = 'rv1960'): Promise<string> {
  const parsed = parseReference(reference);
  if (!parsed) {
    return "Referencia inválida.";
  }

  try {
    const apiUrl = `https://bible-api.deno.dev/api/read/${version}/${parsed.book}/${parsed.startChapter}`;
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error('No se pudo obtener el texto del versículo.');
    }
    const data: ChapterData = await res.json();

    if (parsed.startVerse) {
      // Si se especifica un rango de versículos
      const endVerse = parsed.endVerse || parsed.startVerse;
      const verses = data.vers
        .filter(v => v.number >= parsed.startVerse! && v.number <= endVerse)
        .map(v => v.verse);
      return verses.join(" ");
    } else {
      // Si es un capítulo entero
      const chapterText = data.vers.map(v => `${v.number} ${v.verse}`).join("\n");
      return chapterText;
    }
  } catch (error) {
    console.error("Error fetching verse text:", error);
    return "No se pudo cargar el texto.";
  }
} 