// Reemplazo toda la data hardcodeada por funciones que consultan Bible API

export interface BibleBook {
  id: number;
  name: string;
  shortname: string;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
}

// Versiones soportadas por la API
export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "rv_1909", name: "Reina Valera 1909", abbreviation: "RV1909" },
  { id: "rv_1858", name: "Reina Valera 1858 NT", abbreviation: "RV1858" },
  { id: "rvg", name: "Reina Valera Gómez", abbreviation: "RVG" },
  {
    id: "rv_1909_strongs",
    name: "Reina-Valera 1909 w/Strong's",
    abbreviation: "RV1909 S",
  },
  {
    id: "sagradas",
    name: "Sagradas Escrituras 1569",
    abbreviation: "SAGRADAS",
  },
];

// Obtener libros de la Biblia en español
export async function fetchBibleBooks(): Promise<BibleBook[]> {
  const res = await fetch(
    "https://api.biblesupersearch.com/api/books?language=es"
  );
  if (!res.ok)
    throw new Error("No se pudieron obtener los libros de la Biblia");
  const data = await res.json();
  console.log("Respuesta completa de fetchBibleBooks:", data);
  var result = data.results.map((book: any) => ({
    id: book.id,
    name: book.name,
    shortname: book.shortname,
    chapters: book.chapters, // ✅ Agregado
    chapter_verses: book.chapter_verses, // ✅ Agregado
  }));
  console.log("Libros obtenidos:", result);
  return result;
}

// Obtener un versículo específico
export async function fetchBibleVerse(
  book: string,
  chapter: number,
  verse: number,
  version: string = "rv_1909"
): Promise<string> {
  // Ejemplo de referencia: "Juan 3:16"
  const reference = `${book} ${chapter}:${verse}`;
  const url = `https://api.biblesupersearch.com/api?bible=${version}&reference=${encodeURIComponent(
    reference
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo obtener el versículo");
  const data = await res.json();
  // El texto está en: data.results[0].verses[version][chapter][verse].text
  try {
    const text =
      data.results[0].verses[version][chapter.toString()][verse.toString()]
        .text;
    return text;
  } catch {
    return "Versículo no encontrado";
  }
}

// Obtener un rango de versículos
export async function fetchBibleVerseRange(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
  version: string = "rv_1909"
): Promise<string[]> {
  const reference = `${book} ${chapter}:${startVerse}-${endVerse}`;
  const url = `https://api.biblesupersearch.com/api?bible=${version}&reference=${encodeURIComponent(
    reference
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo obtener el rango de versículos");
  const data = await res.json();
  try {
    const versesObj = data.results[0].verses[version][chapter.toString()];
    const verses: string[] = [];
    for (let i = startVerse; i <= endVerse; i++) {
      verses.push(versesObj[i.toString()]?.text || "No encontrado");
    }
    return verses;
  } catch {
    return ["Versículos no encontrados"];
  }
}

export const bibleService = {
  async getVerse(
    book: string,
    chapter: number,
    verse: number,
    version = "rv_1909"
  ): Promise<string> {
    return fetchBibleVerse(book, chapter, verse, version);
  },
  async getVerseRange(
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
    version = "rv_1909"
  ): Promise<string[]> {
    return fetchBibleVerseRange(book, chapter, startVerse, endVerse, version);
  },
  formatReference(
    book: string,
    chapter: number,
    startVerse: number,
    endVerse?: number
  ): string {
    if (endVerse && endVerse !== startVerse) {
      return `${book} ${chapter}:${startVerse}-${endVerse}`;
    }
    return `${book} ${chapter}:${startVerse}`;
  },
};
