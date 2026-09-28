import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface Verse {
  reference: string;
  text: string;
  version: string;
  book_slug: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
}

interface CachedVerse {
  date: string;
  verse: Verse;
}

const API_BASE = 'https://api.midvash.com';
const VERSION = 'nvi';
const CACHE_KEY = 'js-palavra-do-dia';
const TIMEOUT_MS = 3000;

// Mapeamento de slugs/nomes de livros da Bíblia (inglês -> português)
const BOOK_NAMES_PT: Record<string, string> = {
  genesis: 'Gênesis',
  exodus: 'Êxodo',
  leviticus: 'Levítico',
  numbers: 'Números',
  deuteronomy: 'Deuteronômio',
  joshua: 'Josué',
  judges: 'Juízes',
  ruth: 'Rute',
  '1samuel': '1 Samuel',
  '2samuel': '2 Samuel',
  '1kings': '1 Reis',
  '2kings': '2 Reis',
  '1chronicles': '1 Crônicas',
  '2chronicles': '2 Crônicas',
  ezra: 'Esdras',
  nehemiah: 'Neemias',
  esther: 'Ester',
  job: 'Jó',
  psalms: 'Salmos',
  proverbs: 'Provérbios',
  ecclesiastes: 'Eclesiastes',
  songofsolomon: 'Cânticos',
  isaiah: 'Isaías',
  jeremiah: 'Jeremias',
  lamentations: 'Lamentações',
  ezekiel: 'Ezequiel',
  daniel: 'Daniel',
  hosea: 'Oséias',
  joel: 'Joel',
  amos: 'Amós',
  obadiah: 'Obadias',
  jonah: 'Jonas',
  micah: 'Miquéias',
  nahum: 'Naum',
  habakkuk: 'Habacuque',
  zephaniah: 'Sofonias',
  haggai: 'Ageu',
  zechariah: 'Zacarias',
  malachi: 'Malaquias',
  matthew: 'Mateus',
  mark: 'Marcos',
  luke: 'Lucas',
  john: 'João',
  acts: 'Atos',
  romans: 'Romanos',
  '1corinthians': '1 Coríntios',
  '2corinthians': '2 Coríntios',
  galatians: 'Gálatas',
  ephesians: 'Efésios',
  philippians: 'Filipenses',
  colossians: 'Colossenses',
  '1thessalonians': '1 Tessalonicenses',
  '2thessalonians': '2 Tessalonicenses',
  '1timothy': '1 Timóteo',
  '2timothy': '2 Timóteo',
  titus: 'Tito',
  philemon: 'Filemom',
  hebrews: 'Hebreus',
  james: 'Tiago',
  '1peter': '1 Pedro',
  '2peter': '2 Pedro',
  '1john': '1 João',
  '2john': '2 João',
  '3john': '3 João',
  jude: 'Judas',
  revelation: 'Apocalipse',
};

function translateReference(reference: string, bookSlug: string): string {
  const ptName = BOOK_NAMES_PT[bookSlug.toLowerCase()];
  if (!ptName) return reference;
  // Substituir o nome do livro em inglês pelo português
  // O formato da API é "BookName Chapter:Verse" ou "BookName Chapter:Verse-Verse"
  return reference.replace(/^[A-Za-z0-9\s]+/, ptName);
}

const FALLBACK_VERSES: Verse[] = [
  {
    reference: 'Salmos 23:1',
    text: 'O Senhor é o meu pastor; de nada terei falta.',
    version: 'nvi',
    book_slug: 'psalms',
    chapter: 23,
    verse_start: 1,
    verse_end: 1,
  },
  {
    reference: 'Salmos 46:1',
    text: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.',
    version: 'nvi',
    book_slug: 'psalms',
    chapter: 46,
    verse_start: 1,
    verse_end: 1,
  },
  {
    reference: 'Filipenses 4:13',
    text: 'Tudo posso naquele que me fortalece.',
    version: 'nvi',
    book_slug: 'philippians',
    chapter: 4,
    verse_start: 13,
    verse_end: 13,
  },
  {
    reference: 'Romanos 8:28',
    text: 'Sabemos que Deus age em todas as coisas para o bem daqueles que o amam.',
    version: 'nvi',
    book_slug: 'romans',
    chapter: 8,
    verse_start: 28,
    verse_end: 28,
  },
  {
    reference: 'Jeremias 29:11',
    text: 'Pois sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de lhes causar dano, planos de dar-lhes esperança e um futuro.',
    version: 'nvi',
    book_slug: 'jeremiah',
    chapter: 29,
    verse_start: 11,
    verse_end: 11,
  },
];

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getRandomFallback(): Verse {
  const today = getTodayString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_VERSES[hash % FALLBACK_VERSES.length];
}

function readCache(): CachedVerse | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;
    const parsed: CachedVerse = JSON.parse(stored);
    if (parsed.date !== getTodayString()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(verse: Verse): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ date: getTodayString(), verse }),
    );
  } catch {
    // Ignore quota exceeded
  }
}

export function PalavraDoDia() {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchVerse() {
      const cached = readCache();
      if (cached) {
        if (!cancelled) {
          setVerse(cached.verse);
          setLoading(false);
        }
        return;
      }

      const fallback = getRandomFallback();
      if (!cancelled) {
        setVerse(fallback);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(`${API_BASE}/v1/votd?version=${VERSION}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const apiVerse: Verse = {
          reference: data.reference,
          text: data.text,
          version: data.version,
          book_slug: data.book_slug,
          chapter: data.chapter,
          verse_start: data.verse_start,
          verse_end: data.verse_end,
        };

        writeCache(apiVerse);

        if (!cancelled) {
          setVerse(apiVerse);
        }
      } catch {
        if (!cancelled) {
          // Keep fallback verse on error
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchVerse();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !verse) {
    return (
      <div className="flex items-center gap-2 text-sm" aria-busy="true">
        <div className="text-primary h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="text-muted-foreground">
          Carregando Palavra do Dia...
        </span>
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-2"
      role="region"
      aria-label="Palavra do Dia"
    >
      <div className="text-primary flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        <span>Palavra do Dia</span>
      </div>
      <blockquote className="border-primary/30 text-muted-foreground border-l-2 pl-3 text-sm leading-relaxed italic">
        &ldquo;{verse.text}&rdquo;
      </blockquote>
      <cite className="text-muted-foreground/80 text-xs font-normal not-italic">
        {translateReference(verse.reference, verse.book_slug)} —{' '}
        {verse.version.toUpperCase()}
      </cite>
    </motion.div>
  );
}
