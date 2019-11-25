// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import lemmatize from 'wink-lemmatizer';

export const capitalize = (string: string): string => (
  string.charAt(0).toUpperCase() + string.slice(1)
);

const spaceRegexp = new RegExp(/\s+/, 'g');
const underscoreRegexp = new RegExp('_', 'g');
const nonAlphaRegexp = new RegExp(/[^0-9a-z\-.'\s]/, 'g');
/**
 * Lowercases, removes non-alphanumeric characters.
 */
export const processQuery = (query: string): string => (
  query
    .toLowerCase()
    .replace(underscoreRegexp, ' ')
    .replace(nonAlphaRegexp, '')
    .trim()
);

export const replaceSpaces = (query: string): string => (
    query.replace(spaceRegexp, '_')
);

/**
 * Retrieves all possible unique lemmata for the given word
 * (if not found, returns the word itself to fallback to WordNet's lemma lookup).
 */
export const getLemma = (word: string): string[] => {
  const lemmata: string[] = [...new Set([
    lemmatize.noun(word),
    lemmatize.adjective(word),
    lemmatize.verb(word),
  ])].filter(Boolean);
  return lemmata.length > 0 ? lemmata.map((lemma) => replaceSpaces(lemma)) : [replaceSpaces(word)];
};

export const getPromisePerLemma = (
  word: string, callbacks: ((word: string, args?: any) => any)[], args?: any[],
): Promise<any>[] => {
  const possibleLemmata = getLemma(processQuery(word));
  const promises: Promise<any>[] = [];
  possibleLemmata.forEach((lemma) => {
    callbacks.forEach((cb) => {
      if (args) {
        promises.push(cb(lemma, ...args));
      } else {
        promises.push(cb(lemma));
      }
    });
  });
  return promises;
};


export const splitGlossToExamples = (gloss: string): { gloss: string; examples?: string[] } => {
  const parts = gloss.split(/(.+?); "(.+)/).filter(Boolean);
  if (parts.length === 1) {
    return { gloss };
  }
  const examples = parts[1].replace(/"/g, '')
    .split('; ')
    .map((e) => capitalize(e));
  return { gloss: parts[0], examples };
};

export const replaceUnderscores = (word: string): string => word.replace(underscoreRegexp, ' ');
