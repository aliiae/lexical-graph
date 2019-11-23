import { Request, Response } from 'express';
import { Aggregate } from 'mongoose';
import Lemma from '../models/lemma.model';
import Synset from '../models/synset.model';
import { getPromisePerLemma, replaceUnderscores } from '../util/string.util';
import {
  Edge,
  HierarchyNode,
  InputGraph,
  LemmaPosRelations,
  LemmaPosToHierarchy,
  OutputHierarchy,
  QueryRelations,
  RelationEdge,
  RelationNode,
  RelationType,
  SynsetToWords,
  TypeToHierarchy,
} from './synset.types';

const relationsMap: Map<string, RelationType> = new Map([
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

export default class SynsetService {
  private static formatRelations(queryRelations: QueryRelations): OutputHierarchy {
    function addWordsFromNodes(nodes: RelationNode[], synsetToWords: SynsetToWords): void {
      nodes.forEach(({ _id: synsetId, words, relations }: RelationNode) => {
        synsetToWords.set(synsetId, words);
        if (relations) {
          relations.forEach(({ _id: childSynsetId, words: childSynsetWords }: RelationNode) => {
            synsetToWords.set(childSynsetId, childSynsetWords);
          });
        }
      });
    }

    const lemmaPosToEdges: LemmaPosToHierarchy = Object.create(null);
    if (queryRelations.length === 0) {
      return lemmaPosToEdges;
    }
    queryRelations.forEach((lemmaPosRelation: LemmaPosRelations) => {
      lemmaPosRelation.forEach(({ lemmaPos, edges, nodes }: InputGraph) => {
        const synsetIdToWords: SynsetToWords = new Map();
        addWordsFromNodes(nodes, synsetIdToWords);
        const typeToEdges: TypeToHierarchy = Object.create(null);
        edges.forEach(({ type, synsets }: RelationEdge) => {
          const typeAsWord = relationsMap.get(type);
          if (typeAsWord !== undefined) {
            typeToEdges[typeAsWord] = SynsetService.getHierarchyData(
              synsets, lemmaPos, (typeAsWord as RelationType), synsetIdToWords,
            );
          }
        });
        lemmaPosToEdges[lemmaPos] = typeToEdges;
      });
    });
    return lemmaPosToEdges;
  }

  private static getHierarchyData(
    data: Edge[], lemma: string, type: RelationType, words: SynsetToWords,
  ): HierarchyNode {
    const lemmaAsWord = lemma.substring(2);
    // Create a root node with the lemma
    const root: HierarchyNode = { label: lemmaAsWord };
    const children: HierarchyNode[] = [];
    // Create nodes for individual entities (synsets and words)
    data.forEach(({ source, targets }) => {
      // Create nodes for the lemma synset's words
      const lemmaSynsetChildren: HierarchyNode[] = [];
      const sourceWords = words.get(source);
      if (sourceWords && (sourceWords.length > 1 || sourceWords[0] !== lemmaAsWord)) {
        sourceWords.forEach((word: string) => {
          if (word !== lemmaAsWord) {
            const wordLeaf: HierarchyNode = { label: replaceUnderscores(word), type: 'synonym' };
            lemmaSynsetChildren.push(wordLeaf);
          }
        });
      }
      // Create a node for the lemma's synset
      const lemmaSynsetRoot = { label: '_SYNSET', children: lemmaSynsetChildren, type: 'synonym' };
      // Process related synsets and words
      targets.forEach((target: string) => {
        const targetWords = words.get(target);
        if (targetWords && targetWords.length > 0) {
          // Create nodes for the individual words
          const targetSynsetChildren: HierarchyNode[] = [];
          targetWords.forEach((targetWord: string) => {
            const wordLeaf: HierarchyNode = { label: replaceUnderscores(targetWord), type };
            targetSynsetChildren.push(wordLeaf);
          });
          // Create a node for the synset
          const targetSynsetRoot: HierarchyNode = {
            label: '_SYNSET',
            children: targetSynsetChildren,
            type,
          };
          lemmaSynsetRoot.children.push(targetSynsetRoot);
        }
      });
      if (lemmaSynsetRoot.children && lemmaSynsetRoot.children.length > 0) {
        children.push(lemmaSynsetRoot);
      }
    });
    root.children = children;
    return root;
  }

  private static getAggregatedRelations(word: string, max?: number): Aggregate<any> {
    return Lemma.aggregate([
      { $match: { lemma: word } },
      {
        $project: {
          _id: 1,
          synsets: max !== undefined ? { $slice: ['$synsets', max] } : '$synsets',
        },
      },
      { $unwind: '$synsets' },
      (SynsetService.getSynsetObject('synsetObject')),
      { $unwind: '$synsetObject' },
      { $unwind: '$synsetObject.edges' },
      {
        $facet: {
          nodes: SynsetService.getNodes(),
          edges: SynsetService.getEdges(),
        },
      },
      { $project: { graph: { $setUnion: ['$nodes', '$edges'] } } },
      { $unwind: '$graph' },
      { $replaceRoot: { newRoot: '$graph' } },
      { $unwind: { path: '$edges', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$nodes', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$lemmaPos',
          edges: { $push: '$edges' },
          nodes: { $push: '$nodes' },
        },
      },
      {
        $project: {
          _id: 0,
          lemmaPos: '$_id',
          edges: 1,
          nodes: 1,
        },
      },
    ]);
  }

  private static getEdges(): Record<string, any>[] {
    return [
      {
        $project: {
          _id: 1,
          lemmaPos: '$_id',
          synsetId: '$synsets',
          type: '$synsetObject.edges.rel',
          target: '$synsetObject.edges.tgt',
        },
      },
      {
        $group: {
          _id: { type: '$type', synsetId: '$synsetId', lemmaPos: '$lemmaPos' },
          targets: { $push: '$target' },
        },
      },
      {
        $group: {
          _id: { type: '$_id.type', lemmaPos: '$_id.lemmaPos' },
          edges: {
            $push:
              {
                source: '$_id.synsetId',
                targets: '$targets',
              },
          },
        },
      },
      {
        $project: {
          _id: 0,
          lemmaPos: '$_id.lemmaPos',
          type: '$_id.type',
          edges: 1,
        },
      },
      {
        $group: {
          _id: '$lemmaPos',
          edges: {
            $push: {
              type: '$type',
              synsets: '$edges',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          lemmaPos: '$_id',
          edges: 1,
        },
      },
    ];
  }

  private static getNodes(): Record<string, any>[] {
    return [
      {
        $lookup: {
          from: 'synsets',
          let: { edges: '$synsetObject.edges' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$edges.tgt'] } } },
            {
              $project: {
                _id: 1,
                word: 1,
              },
            },
          ],
          as: 'synsetRelations',
        },
      },
      { $unwind: '$synsetRelations' },
      {
        $group: {
          _id: '$synsets',
          words: { $first: '$synsetObject.word' },
          lemmaPos: { $first: '$_id' },
          relations: {
            $addToSet: {
              _id: '$synsetRelations._id',
              words: '$synsetRelations.word',
            },
          },
        },
      },
      {
        $group: {
          _id: '$lemmaPos',
          nodes: {
            $push: {
              _id: '$_id',
              words: '$words',
              relations: '$relations',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          lemmaPos: '$_id',
          nodes: 1,
        },
      },
    ];
  }

  private static getSynsetObject(fieldName: string): Record<string, any> {
    return {
      $lookup: {
        from: 'synsets',
        let: { synsets: '$synsets' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$synsets'] } } },
        ],
        as: fieldName,
      },
    };
  }

  private static sendPromiseResults(promises: Promise<any>[], res: Response): void {
    Promise.all(promises).then((results) => {
      const filteredResults = results.filter((result) => result.length > 0);
      res.json(SynsetService.formatRelations(filteredResults));
    }).catch((error) => {
      res.send(error);
    });
  }

  public getAllRelations(req: Request, res: Response): void {
    const { word } = req.params;
    const promises = getPromisePerLemma(
      word, [SynsetService.getAggregatedRelations],
    );
    SynsetService.sendPromiseResults(promises, res);
  }

  public getSomeRelations(req: Request, res: Response): void {
    const { word, max } = req.params;
    const promises = getPromisePerLemma(
      word, [SynsetService.getAggregatedRelations],
      [parseInt(max, 10)],
    );
    SynsetService.sendPromiseResults(promises, res);
  }

  public getAllSynsets(req: Request, res: Response): void {
    Synset.find({})
      .then((result) => res.json(result))
      .catch((error) => res.send(error));
  }
}
