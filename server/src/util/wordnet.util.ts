import fs from 'fs';
import { Model } from 'mongoose';
import path from 'path';
import { WORDNET_PATH } from '../constants/app.constants';
import Lemma, { LemmaType } from '../models/lemma.model';
import Synset, { SynsetType } from '../models/synset.model';
import logger from './logger';

const CHUNK_SIZE = 25000;

async function insertChunks(model: Model<any>, array: (LemmaType | SynsetType)[]): Promise<any[]> {
  const promises = [];
  for (let i = 0; i < array.length; i += CHUNK_SIZE) {
    promises.push(model.insertMany(array.slice(i, i + CHUNK_SIZE), { ordered: false }));
  }
  logger.debug(`Chunks to import: ${promises.length}`);
  return Promise.all(promises);
}

export default function importWordnet(): void {
  try {
    const models = [
      {
        model: Synset,
        name: 'synsets',
      },
      {
        model: Lemma,
        name: 'lemmata',
      },
    ];
    models.forEach(({ model, name }) => {
      logger.debug(`Processing ${name}`);
      const filepath = path.join(WORDNET_PATH, `wordnet.${name}.json`);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      model.deleteMany({}).then(() => {
        logger.debug(`Removed ${name}`);
        insertChunks(model, data)
          .then(() => logger.debug(`Finished importing ${name}`))
          .catch((err) => logger.error(`Error while importing ${name}: ${err}`));
      });
    });
  } catch (e) {
    logger.error('Error while importing data', e);
  }
}
