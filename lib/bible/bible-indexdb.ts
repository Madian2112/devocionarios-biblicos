import { BibleBook } from "./bible-data";


const USER_BOOKS_KEY = 'bible_books_cache';

export const preloadBibleBooks = async (): Promise<void> => {
  try {
    // Verificar si ya están en localStorage
    const stored = localStorage.getItem(USER_BOOKS_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.books && data.books.length > 0) {
        console.log('✅ Libros ya están en localStorage');
        return;
      }
    }

    // Si no están, cargarlos
    console.log('🚀 Precargando libros bíblicos...');
    const response = await fetch('https://api.biblesupersearch.com/api/books?language=es');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const apiData = await response.json();
    const books: BibleBook[] = apiData.results.map((book: any) => ({
      id: book.id,
      name: book.name,
      shortname: book.shortname,
      chapters: book.chapters,
      chapter_verses: book.chapter_verses,
    }));

    // Guardar en localStorage
    localStorage.setItem(USER_BOOKS_KEY, JSON.stringify({ 
      books, 
      timestamp: Date.now() 
    }));

    console.log('✅ Libros precargados y guardados en localStorage');
  } catch (error) {
    console.error('❌ Error precargando libros:', error);
  }
};

export const getBooksFromStorage = async (): Promise<BibleBook[]> => {
  try {
    const stored = localStorage.getItem(USER_BOOKS_KEY);
    // console.log('Asi me lleva el local storage de los libros: ', stored)
    if (stored) {
      const data = JSON.parse(stored);
      return data.books;
    }
    else{
      return await loadBooksFromAPI()
    }
  } catch (error) {
    console.warn('Error leyendo localStorage:', error);
  }
  return [];
};

// 🚀 FUNCIÓN SIMPLE: Cargar desde API como fallback
const loadBooksFromAPI = async (): Promise<BibleBook[]> => {
  try {
    console.log('🌐 Cargando libros desde API (fallback)...');
    const response = await fetch('https://api.biblesupersearch.com/api/books?language=es');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const books: BibleBook[] = data.results.map((book: any) => ({
      id: book.id,
      name: book.name,
      shortname: book.shortname,
      chapters: book.chapters,
      chapter_verses: book.chapter_verses,
    }));

    // Guardar en localStorage para próximas veces
    localStorage.setItem(USER_BOOKS_KEY, JSON.stringify({ 
      books, 
      timestamp: Date.now() 
    }));

    return books;
  } catch (error) {
    console.error('Error cargando desde API:', error);
    return [];
  }
};