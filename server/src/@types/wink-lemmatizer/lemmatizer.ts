export default interface Lemmatizer {
  noun: (noun: string) => string;
  verb: (verb: string) => string;
  adjective: (adjective: string) => string;
}
