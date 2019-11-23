import { POS } from '../api/types';

export const getLemmaId = (lemma: string, pos: POS): string => `${pos}.${lemma}`;

export const replaceUnderscores = (word: string): string => word.replace(/_+/g, ' ').trim();
