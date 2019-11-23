import axios, { AxiosResponse } from 'axios';
import { LemmaPosToHierarchy, LemmaToDefinition, RelationType } from './types';

axios.defaults.baseURL = '/';

export default class WordnetAPI {
  public static RELATION_TYPES: RelationType[] = [
    'synonym',
    'antonym',
    'hypernym',
    'hyponym',
    'holonym',
    'meronym',
    'attribute',
    'entailment',
    'cause',
  ];

  public static colors = {
    antonym: '#d95f02',
    attribute: '#a6761d',
    cause: '#1b9e77',
    entailment: '#666666',
    holonym: '#66a61e',
    hypernym: '#7570b3',
    hyponym: '#e7298a',
    meronym: '#e6ab02',
    synonym: '#1b9e77',
  };

  public static posMap = {
    a: 'adjective',
    n: 'noun',
    v: 'verb',
    r: 'adverb',
    s: 'adjective',
  };

  public static async getDefinitions(word: string): Promise<LemmaToDefinition> {
    const response: AxiosResponse = await axios.get(`/api/wordnet/lemma/${word}`);
    return response.data;
  }

  public static async getRelations(word: string): Promise<LemmaPosToHierarchy> {
    const response: AxiosResponse = await axios.get(`/api/wordnet/synset/${word}`);
    return response.data;
  }
}
