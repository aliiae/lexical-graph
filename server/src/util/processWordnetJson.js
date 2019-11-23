/**
 * A dirty script to re-format wordnet.json from https://github.com/fluhus/wordnet-to-json
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '..', '..', 'data', 'wordnet.json');
const OUTPUT_FOLDER = path.join(__dirname, '..', '..', 'data');

const includedRelationsMap = new Map([
  ['&', 'synonym'],
  ['!', 'antonym'],
  ['@', 'hypernym'],
  ['~', 'hyponym'],
  ['%p', 'meronym'],
  ['#p', 'holonym'],
  ['*', 'entailment'],
  ['>', 'cause'],
  ['=', 'attribute'],
]);

function getLemmaPos(lemmaId) {
  // "a.amphoric" => {pos: 'a', lemma: 'amphoric'}
  const [pos, lemma] = [lemmaId.slice(0, 1), lemmaId.slice(2)];
  return { pos, lemma };
}

function extractData(wordnet) {
  const lemmata = Object.entries(wordnet.lemma).map(([lemma, synsets]) => ({
    _id: lemma,
    synsets,
    ...getLemmaPos(lemma),
  }));

  const synsets = Object.entries(wordnet.synset).map(([synsetID, synset]) => {
    const {
      frame, example, offset, pos, pointer, ...includedFields
    } = synset;

    const synsetRelations = pointer.filter(({ symbol, source, target }) => (
      // keep only the necessary relation types where the whole source (-1) refers
      // to the whole target (-1)
      includedRelationsMap.has(symbol) && source === -1 && target === -1
    )).map(({ symbol, synset: targetSynsetId }) => ({
      rel: symbol,
      tgt: targetSynsetId,
    }));

    return {
      _id: synsetID,
      pos,
      edges: synsetRelations,
      ...includedFields,
    };
  });
  return { lemmata, synsets };
}

function processWordnetJson() {
  fs.readFile(INPUT_PATH, 'utf8', (readErr, json) => {
    if (readErr) {
      console.error('File read failed:', readErr);
      return;
    }
    try {
      const wordnet = JSON.parse(json);
      const output = extractData(wordnet);
      Object.entries(output).forEach(([key, value]) => {
        const outJson = JSON.stringify(value);
        fs.writeFile(path.join(OUTPUT_FOLDER, `wordnet.${key}.json`), outJson, (writeErr) => {
          if (writeErr) {
            console.error('File write failed', writeErr);
            return;
          }
          console.log('Finished writing file', key);
        });
      });
    } catch (parseErr) {
      console.log('Error parsing JSON:', parseErr);
    }
  });
}

processWordnetJson();
