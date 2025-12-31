/**
 * Quran Data Service
 * Provides a clean API for accessing Quran metadata using quran-meta package
 */

import { quran } from 'quran-meta';
import { Surah, Juz, Ayah } from '@/types';

/**
 * Get information about a specific Surah
 */
export function surah(surahId: number): Surah | null {
  if (surahId < 1 || surahId > 114) {
    return null;
  }
  
  const surahMeta = quran.getSurahMeta(surahId as any);
  
  if (!surahMeta) {
    return null;
  }
  
  // Get the starting and ending pages for this surah
  const startAyahId = surahMeta.firstAyahId;
  const endAyahId = surahMeta.lastAyahId;
  
  const startAyahMeta = quran.getAyahMeta(startAyahId);
  const endAyahMeta = quran.getAyahMeta(endAyahId);
  
  return {
    id: surahId,
    name: surahMeta.name,
    nameArabic: surahMeta.name,
    nameTransliteration: surahMeta.name,
    nameTranslation: surahMeta.name,
    ayahCount: surahMeta.ayahCount,
    revelationType: surahMeta.isMeccan ? 'Meccan' : 'Medinan',
    startPage: startAyahMeta.page,
    endPage: endAyahMeta.page,
  };
}

/**
 * Get information about a specific Juz
 */
export function juz(juzNumber: number): Juz | null {
  if (juzNumber < 1 || juzNumber > 30) {
    return null;
  }
  
  const juzMeta = quran.getJuzMeta(juzNumber as any);
  
  if (!juzMeta) {
    return null;
  }
  
  const startSurahAyah = quran.findSurahAyahByAyahId(juzMeta.firstAyahId);
  const endSurahAyah = quran.findSurahAyahByAyahId(juzMeta.lastAyahId);
  
  // Get page numbers
  const startAyahMeta = quran.getAyahMeta(juzMeta.firstAyahId);
  const endAyahMeta = quran.getAyahMeta(juzMeta.lastAyahId);
  
  return {
    id: juzNumber,
    startSurah: startSurahAyah[0],
    startAyah: startSurahAyah[1],
    endSurah: endSurahAyah[0],
    endAyah: endSurahAyah[1],
    startPage: startAyahMeta.page,
    endPage: endAyahMeta.page,
  };
}

/**
 * Get list of all Surahs
 */
export function getSurahList(): Surah[] {
  const surahs: Surah[] = [];
  
  for (let i = 1; i <= 114; i++) {
    const surahInfo = surah(i);
    if (surahInfo) {
      surahs.push(surahInfo);
    }
  }
  
  return surahs;
}

/**
 * Get list of all Juzs
 */
export function getJuzList(): Juz[] {
  const juzs: Juz[] = [];
  
  for (let i = 1; i <= 30; i++) {
    const juzInfo = juz(i);
    if (juzInfo) {
      juzs.push(juzInfo);
    }
  }
  
  return juzs;
}

/**
 * Get total number of pages in the Quran
 */
export function getPageCount(): number {
  return 604;
}

/**
 * Get information about a specific page
 */
export function page(pageNumber: number): { startSurah: number; startAyah: number; endSurah: number; endAyah: number } | null {
  if (pageNumber < 1 || pageNumber > 604) {
    return null;
  }
  
  const pageMeta = quran.getPageMeta(pageNumber as any);
  
  if (!pageMeta) {
    return null;
  }
  
  const startSurahAyah = quran.findSurahAyahByAyahId(pageMeta.firstAyahId);
  const endSurahAyah = quran.findSurahAyahByAyahId(pageMeta.lastAyahId);
  
  return {
    startSurah: startSurahAyah[0],
    startAyah: startSurahAyah[1],
    endSurah: endSurahAyah[0],
    endAyah: endSurahAyah[1],
  };
}

/**
 * Get all ayahs in a specific Surah
 */
export function getAyahsForSurah(surahId: number): Ayah[] {
  const surahInfo = surah(surahId);
  
  if (!surahInfo) {
    return [];
  }
  
  const ayahs: Ayah[] = [];
  
  for (let i = 1; i <= surahInfo.ayahCount; i++) {
    ayahs.push({
      surahId,
      ayahNumber: i,
      ayahKey: `${surahId}:${i}`,
    });
  }
  
  return ayahs;
}

/**
 * Get verses for a specific page
 */
export function getVersesByPage(pageNum: number): Ayah[] {
  const pageInfo = page(pageNum);
  
  if (!pageInfo) {
    return [];
  }
  
  const ayahs: Ayah[] = [];
  
  if (pageInfo.startSurah === pageInfo.endSurah) {
    for (let i = pageInfo.startAyah; i <= pageInfo.endAyah; i++) {
      ayahs.push({
        surahId: pageInfo.startSurah,
        ayahNumber: i,
        ayahKey: `${pageInfo.startSurah}:${i}`,
      });
    }
  } else {
    const firstSurahInfo = surah(pageInfo.startSurah);
    if (firstSurahInfo) {
      for (let i = pageInfo.startAyah; i <= firstSurahInfo.ayahCount; i++) {
        ayahs.push({
          surahId: pageInfo.startSurah,
          ayahNumber: i,
          ayahKey: `${pageInfo.startSurah}:${i}`,
        });
      }
    }
    
    for (let s = pageInfo.startSurah + 1; s < pageInfo.endSurah; s++) {
      const middleSurahInfo = surah(s);
      if (middleSurahInfo) {
        for (let i = 1; i <= middleSurahInfo.ayahCount; i++) {
          ayahs.push({
            surahId: s,
            ayahNumber: i,
            ayahKey: `${s}:${i}`,
          });
        }
      }
    }
    
    for (let i = 1; i <= pageInfo.endAyah; i++) {
      ayahs.push({
        surahId: pageInfo.endSurah,
        ayahNumber: i,
        ayahKey: `${pageInfo.endSurah}:${i}`,
      });
    }
  }
  
  return ayahs;
}

/**
 * Get a specific Juz by ID (alias for juz function)
 */
export function getJuzById(juzId: number): Juz | null {
  return juz(juzId);
}

/**
 * Get a specific Surah by ID (alias for surah function)
 */
export function getSurahById(surahId: number): Surah | null {
  return surah(surahId);
}

/**
 * Get the ayah range for a specific page
 */
export function getAyahRangeForPage(pageNum: number): { start: string; end: string } | null {
  const pageInfo = page(pageNum);
  
  if (!pageInfo) {
    return null;
  }
  
  return {
    start: `${pageInfo.startSurah}:${pageInfo.startAyah}`,
    end: `${pageInfo.endSurah}:${pageInfo.endAyah}`,
  };
}

/**
 * Get page number for a specific ayah
 */
export function getPageForAyah(surahId: number, ayahNumber: number): number | null {
  try {
    const ayahId = quran.findAyahIdBySurah(surahId as any, ayahNumber as any);
    const ayahMeta = quran.getAyahMeta(ayahId);
    return ayahMeta.page;
  } catch (error) {
    return null;
  }
}

/**
 * Parse an ayah reference string into surah and ayah numbers
 */
export function parseAyahReference(ayahRef: string): { surahId: number; ayahNumber: number } | null {
  const parts = ayahRef.split(':');
  
  if (parts.length !== 2) {
    return null;
  }
  
  const surahId = parseInt(parts[0], 10);
  const ayahNumber = parseInt(parts[1], 10);
  
  if (isNaN(surahId) || isNaN(ayahNumber)) {
    return null;
  }
  
  return { surahId, ayahNumber };
}
