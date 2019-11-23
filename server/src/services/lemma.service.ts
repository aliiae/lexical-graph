import { Request, Response } from 'express';
import { Aggregate, MongooseDocument } from 'mongoose';
import Lemma from '../models/lemma.model';
import { getPromisePerLemma, replaceUnderscores, splitGlossToExamples } from '../util/string.util';
import { Definition, LemmaDefinition, LemmaToDefinition, QueryDefinition } from './lemma.types';

export default class LemmaService {
  public getAllLemmata(req: Request, res: Response): void {
    Lemma.find({}, (error: Error, wordnet: MongooseDocument) => {
      if (error) {
        res.send(error);
      }
      res.json(wordnet);
    });
  }

  /**
   * Replaces underscores with spaces in synset terms,
   * splits glosses into definitions and examples.
   */
  static formatGlosses(glosses: QueryDefinition): LemmaToDefinition {
    const lemmaToSynset = Object.create(null);
    glosses.forEach((lemmaInfo: LemmaDefinition) => {
      if (lemmaInfo.length > 0) {
        const posToGlosses = Object.create(null);
        const currentLemma = lemmaInfo[0].lemma;
        lemmaInfo.forEach(({ pos, synsets }: Definition) => {
          posToGlosses[pos] = synsets.map(({ gloss, terms }) => (
            {
              ...splitGlossToExamples(gloss),
              terms: terms
                .filter((term) => term !== currentLemma)
                .map((term) => replaceUnderscores(term)),
            }
          ));
        });
        lemmaToSynset[currentLemma] = posToGlosses;
      }
    });
    return lemmaToSynset;
  }

  static getAggregatedGlosses(lemma: string): Aggregate<QueryDefinition> {
    return Lemma.aggregate([
      { $match: { lemma } },
      { $unwind: '$synsets' },
      {
        $lookup: {
          from: 'synsets',
          let: { synsets: '$synsets' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$synsets'] } } },
            {
              $project: {
                _id: 0,
                gloss: 1,
                terms: '$word',
              },
            },
          ],
          as: 'synsetObjects',
        },
      },
      { $unwind: '$synsetObjects' },
      {
        $group: {
          _id: '$pos',
          lemma: { $first: '$lemma' },
          synsets: {
            $push: {
              gloss: '$synsetObjects.gloss',
              terms: '$synsetObjects.terms',
            },
          },
        },
      },
      {
        $project: {
          _id: 0, lemma: 1, pos: '$_id', synsets: 1,
        },
      },
      {
        $sort: {
          lemma: 1, pos: 1,
        },
      },
    ]);
  }

  public getGlosses(req: Request, res: Response): void {
    const { word } = req.params;
    const promises = getPromisePerLemma(word, [LemmaService.getAggregatedGlosses]);
    Promise.all(promises).then((results) => {
      const filteredResults = results.filter((result) => result.length > 0);
      res.json(LemmaService.formatGlosses(filteredResults));
    }).catch((error) => {
      res.send(error);
    });
  }
}
