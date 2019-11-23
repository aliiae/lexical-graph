export type POS = 'n' | 'v' | 'a' | 'r' | 's';

export type SynsetDefinition = { gloss: string; examples?: string[]; terms: string[] };

export type Definition = {
  lemma: string;
  pos: POS;
  synsets: SynsetDefinition[];
};

export type LemmaDefinition = Definition[];
export type QueryDefinition = LemmaDefinition[];

export type PosToGlosses = { [pos in POS]?: SynsetDefinition[] };
export type LemmaToDefinition = { [lemma: string]: PosToGlosses };
