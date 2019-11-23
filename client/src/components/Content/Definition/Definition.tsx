import { Button } from 'antd';
import Card from 'antd/lib/card';
import Divider from 'antd/lib/divider';
import Typography from 'antd/lib/typography';
import React from 'react';
import { Link } from 'react-router-dom';
import { LemmaToDefinition, POS, PosToGlosses, SynsetDefinition } from '../../../api/types';
import WordnetAPI from '../../../api/WordnetAPI';
import { getLemmaId, replaceUnderscores } from '../../../util/wordnet';
import { OnClick } from '../../types';
import './Definition.css';
import DefinitionTitle from './DefinitionTitle';

type GlossesProps = { data: LemmaToDefinition; onClick: OnClick; currentLemma: string };
const Glosses = (props: GlossesProps): JSX.Element => {
  const { data, onClick, currentLemma } = props;
  const lemmata = Object.keys(data);
  return (
    <div>
      {lemmata.map((lemma, lemmaIndex) => {
        const posToGlosses: PosToGlosses = data[lemma];
        return (
          <div key={lemma}>
            {Object.keys(posToGlosses).map((pos: string) => {
              // @ts-ignore
              const glosses: SynsetDefinition[] = posToGlosses[pos];
              return (
                <div key={`${lemma}_${pos}_container`}>
                  <Typography.Title level={2} key={`title_${pos}`}>
                    <span>{replaceUnderscores(lemma)}</span>
                    {' '}
                    <span>
                      <Link to={`/${pos}`}>
                        {WordnetAPI.posMap[(pos as POS)]}
                      </Link>
                    </span>
                    {currentLemma !== getLemmaId(lemma, (pos as POS)) && (
                      <Button
                        size="small"
                        type="primary"
                        className="show-button"
                        onClick={onClick}
                        data-lemma={`${pos}.${lemma}`}
                      >
                        Show relations
                      </Button>
                    )}
                    {currentLemma === getLemmaId(lemma, (pos as POS)) && (
                      <Button
                        size="small"
                        type="ghost"
                        className="show-button"
                        onClick={onClick}
                        disabled
                      >
                        Relations are shown
                      </Button>
                    )}
                  </Typography.Title>
                  <ol key={pos} className="gloss">
                    {glosses.map(({ gloss, terms, examples }) => {
                      const key = `${pos}_def_${gloss}}`;
                      return (
                        <li key={`${key}_gloss`}>
                          <p>
                            {gloss}
                          </p>
                          {examples && (
                            <ul key={`${key}_examples`} className="gloss__examples">
                              {examples.map((example) => (
                                <li key={`${key}_${example.substring(0, 15)}`}>
                                  <q>{example}</q>
                                </li>
                              ))}
                            </ul>
                          )}
                          {terms && terms.length > 0 && (
                            <ul key={`${key}_links`} className="gloss__links">
                              {terms.map((term: string) => (
                                <li key={`${key}_links_${term}`}>
                                  <Link to={`/${term}`}>
                                    {term}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
            {lemmata.length > 1 && lemmaIndex < lemmata.length - 1 && <Divider />}
          </div>
        );
      })}
    </div>
  );
};

type DefinitionProps = { def: LemmaToDefinition; onClick: OnClick; currentLemma: string };
const Definition = (props: DefinitionProps): JSX.Element => {
  const { def, onClick, currentLemma } = props;
  return (
    <Card>
      <DefinitionTitle />
      <Glosses data={def} onClick={onClick} currentLemma={currentLemma} />
    </Card>
  );
};

export default Definition;
