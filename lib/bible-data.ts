// Datos bíblicos simulados - en producción esto vendría de una API
export interface BibleBook {
  id: string
  name: string
  chapters: number
}

export interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
  version: string
}

export interface BibleVersion {
  id: string
  name: string
  abbreviation: string
}

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "rvr1960", name: "Reina-Valera 1960", abbreviation: "RVR1960" },
  { id: "nvi", name: "Nueva Versión Internacional", abbreviation: "NVI" },
  { id: "dhh", name: "Dios Habla Hoy", abbreviation: "DHH" },
  { id: "lbla", name: "La Biblia de las Américas", abbreviation: "LBLA" },
  { id: "ntv", name: "Nueva Traducción Viviente", abbreviation: "NTV" },
]

export const BIBLE_BOOKS: BibleBook[] = [
  // Antiguo Testamento
  { id: "genesis", name: "Génesis", chapters: 50 },
  { id: "exodo", name: "Éxodo", chapters: 40 },
  { id: "levitico", name: "Levítico", chapters: 27 },
  { id: "numeros", name: "Números", chapters: 36 },
  { id: "deuteronomio", name: "Deuteronomio", chapters: 34 },
  { id: "josue", name: "Josué", chapters: 24 },
  { id: "jueces", name: "Jueces", chapters: 21 },
  { id: "rut", name: "Rut", chapters: 4 },
  { id: "1samuel", name: "1 Samuel", chapters: 31 },
  { id: "2samuel", name: "2 Samuel", chapters: 24 },
  { id: "1reyes", name: "1 Reyes", chapters: 22 },
  { id: "2reyes", name: "2 Reyes", chapters: 25 },
  { id: "1cronicas", name: "1 Crónicas", chapters: 29 },
  { id: "2cronicas", name: "2 Crónicas", chapters: 36 },
  { id: "esdras", name: "Esdras", chapters: 10 },
  { id: "nehemias", name: "Nehemías", chapters: 13 },
  { id: "ester", name: "Ester", chapters: 10 },
  { id: "job", name: "Job", chapters: 42 },
  { id: "salmos", name: "Salmos", chapters: 150 },
  { id: "proverbios", name: "Proverbios", chapters: 31 },
  { id: "eclesiastes", name: "Eclesiastés", chapters: 12 },
  { id: "cantares", name: "Cantares", chapters: 8 },
  { id: "isaias", name: "Isaías", chapters: 66 },
  { id: "jeremias", name: "Jeremías", chapters: 52 },
  { id: "lamentaciones", name: "Lamentaciones", chapters: 5 },
  { id: "ezequiel", name: "Ezequiel", chapters: 48 },
  { id: "daniel", name: "Daniel", chapters: 12 },
  { id: "oseas", name: "Oseas", chapters: 14 },
  { id: "joel", name: "Joel", chapters: 3 },
  { id: "amos", name: "Amós", chapters: 9 },
  { id: "abdias", name: "Abdías", chapters: 1 },
  { id: "jonas", name: "Jonás", chapters: 4 },
  { id: "miqueas", name: "Miqueas", chapters: 7 },
  { id: "nahum", name: "Nahúm", chapters: 3 },
  { id: "habacuc", name: "Habacuc", chapters: 3 },
  { id: "sofonias", name: "Sofonías", chapters: 3 },
  { id: "hageo", name: "Hageo", chapters: 2 },
  { id: "zacarias", name: "Zacarías", chapters: 14 },
  { id: "malaquias", name: "Malaquías", chapters: 4 },

  // Nuevo Testamento
  { id: "mateo", name: "Mateo", chapters: 28 },
  { id: "marcos", name: "Marcos", chapters: 16 },
  { id: "lucas", name: "Lucas", chapters: 24 },
  { id: "juan", name: "Juan", chapters: 21 },
  { id: "hechos", name: "Hechos", chapters: 28 },
  { id: "romanos", name: "Romanos", chapters: 16 },
  { id: "1corintios", name: "1 Corintios", chapters: 16 },
  { id: "2corintios", name: "2 Corintios", chapters: 13 },
  { id: "galatas", name: "Gálatas", chapters: 6 },
  { id: "efesios", name: "Efesios", chapters: 6 },
  { id: "filipenses", name: "Filipenses", chapters: 4 },
  { id: "colosenses", name: "Colosenses", chapters: 4 },
  { id: "1tesalonicenses", name: "1 Tesalonicenses", chapters: 5 },
  { id: "2tesalonicenses", name: "2 Tesalonicenses", chapters: 3 },
  { id: "1timoteo", name: "1 Timoteo", chapters: 6 },
  { id: "2timoteo", name: "2 Timoteo", chapters: 4 },
  { id: "tito", name: "Tito", chapters: 3 },
  { id: "filemon", name: "Filemón", chapters: 1 },
  { id: "hebreos", name: "Hebreos", chapters: 13 },
  { id: "santiago", name: "Santiago", chapters: 5 },
  { id: "1pedro", name: "1 Pedro", chapters: 5 },
  { id: "2pedro", name: "2 Pedro", chapters: 3 },
  { id: "1juan", name: "1 Juan", chapters: 5 },
  { id: "2juan", name: "2 Juan", chapters: 1 },
  { id: "3juan", name: "3 Juan", chapters: 1 },
  { id: "judas", name: "Judas", chapters: 1 },
  { id: "apocalipsis", name: "Apocalipsis", chapters: 22 },
]

// Datos de ejemplo de versículos - en producción esto vendría de una API bíblica
export const SAMPLE_VERSES: Record<string, Record<string, string>> = {
  "juan-3-16": {
    rvr1960:
      "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
    nvi: "Porque tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna.",
    dhh: "Pues Dios amó tanto al mundo, que dio a su Hijo único, para que todo aquel que cree en él no muera, sino que tenga vida eterna.",
    lbla: "Porque de tal manera amó Dios al mundo, que dio a su Hijo unigénito, para que todo aquel que cree en El, no se pierda, mas tenga vida eterna.",
    ntv: "Pues Dios amó tanto al mundo que dio a su único Hijo, para que todo el que crea en él no perezca, sino que tenga vida eterna.",
  },
  "salmos-23-1": {
    rvr1960: "Jehová es mi pastor; nada me faltará.",
    nvi: "El Señor es mi pastor, nada me falta.",
    dhh: "El Señor es mi pastor; nada me falta.",
    lbla: "El Señor es mi pastor, nada me faltará.",
    ntv: "El Señor es mi pastor; tengo todo lo que necesito.",
  },
  "filipenses-4-13": {
    rvr1960: "Todo lo puedo en Cristo que me fortalece.",
    nvi: "Todo lo puedo en Cristo que me fortalece.",
    dhh: "Todo lo puedo por medio de Cristo, que me da las fuerzas.",
    lbla: "Todo lo puedo en Cristo que me fortalece.",
    ntv: "Porque todo lo puedo hacer por medio de Cristo, quien me da las fuerzas.",
  },
}

export const bibleService = {
  async getVerse(book: string, chapter: number, verse: number, version = "rvr1960"): Promise<string> {
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 300))

    const key = `${book}-${chapter}-${verse}`
    return SAMPLE_VERSES[key]?.[version] || `${book} ${chapter}:${verse} - Texto no disponible en esta versión`
  },

  async getVerseRange(
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
    version = "rvr1960",
  ): Promise<string[]> {
    const verses = []
    for (let i = startVerse; i <= endVerse; i++) {
      const verse = await this.getVerse(book, chapter, i, version)
      verses.push(verse)
    }
    return verses
  },

  formatReference(book: string, chapter: number, startVerse: number, endVerse?: number): string {
    const bookName = BIBLE_BOOKS.find((b) => b.id === book)?.name || book
    if (endVerse && endVerse !== startVerse) {
      return `${bookName} ${chapter}:${startVerse}-${endVerse}`
    }
    return `${bookName} ${chapter}:${startVerse}`
  },
}
