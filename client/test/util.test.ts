import { deleteKey, hasOwnProperty } from '../src/util/object';
import { getLemmaId, replaceUnderscores } from '../src/util/wordnet';

it('replaces underscores with space correctly', () => {
  const query = 'true_big_cat';
  expect(replaceUnderscores(query)).toBe('true big cat');
});

it('replaces multiple underscores with one space correctly', () => {
  const query = '_true__big_cat__';
  expect(replaceUnderscores(query)).toBe('true big cat');
});

it('gets lemma ID correctly as pos[0].lemma', () => {
  const lemma = 'true_big_cat';
  const pos = 'n';
  expect(getLemmaId(lemma, pos)).toBe('n.true_big_cat');
});

it('checks that an object has a property correctly', () => {
  const object = { hypernym: [], synonym: [] };
  expect(hasOwnProperty(object, 'hypernym')).toBe(true);
  expect(hasOwnProperty(object, 'synonym')).toBe(true);
});

it('checks that an object does not have a property correctly', () => {
  const object = { hypernym: [] };
  expect(hasOwnProperty(object, 'synonym')).toBe(false);
});

it('deletes a key from an object correctly', () => {
  const object = { hypernym: [], cat: [], dog: [] };
  expect(deleteKey(object, 'cat')).toMatchObject({ hypernym: [], dog: [] });
});
