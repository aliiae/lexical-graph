import Card from 'antd/lib/card';
import Col from 'antd/lib/grid/col';
import Row from 'antd/lib/row';
import React, { useEffect, useState } from 'react';
import { LemmaPosToHierarchy, LemmaToDefinition, POS } from '../../api/types';
import WordnetAPI from '../../api/WordnetAPI';
import { isEmpty } from '../../util/object';
import { getLemmaId } from '../../util/wordnet';
import Definition from './Definition';
import EmptyResult from './EmptyResult';
import LoadingSpin from './LoadingSpin';
import RelationsTitle from './Viz/RelationsTitle';
import Viz from './Viz/Viz';

function Content({ query }: { query: string }): JSX.Element {
  const [definitionsData, setDefinitionsData] = useState<LemmaToDefinition | null>(null);
  const [graphData, setGraphData] = useState<LemmaPosToHierarchy | null>(null);
  const [graphIsLoading, setGraphIsLoading] = useState<boolean>(false);
  const [currentLemma, setCurrentLemma] = useState<string | null>(null);

  useEffect(() => {
    setGraphIsLoading(true);
    WordnetAPI.getRelations(query).then((graph) => {
      setGraphData(graph);
      setGraphIsLoading(false);
    });
    WordnetAPI.getDefinitions(query).then((definitions) => {
      setDefinitionsData(definitions);
      const firstLemma = Object.keys(definitions)[0];
      if (!firstLemma) {
        return;
      }
      const firstPos = Object.keys(definitions[firstLemma])[0];
      setCurrentLemma(getLemmaId(firstLemma, (firstPos as POS)));
    });
  }, [query]);

  if (definitionsData === null) {
    return <LoadingSpin />;
  }
  if (isEmpty(definitionsData)) {
    return <EmptyResult word={query} />;
  }

  const onClickLemma = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const { lemma } = (event.target as HTMLButtonElement).dataset;
    if (lemma) {
      setCurrentLemma(lemma);
    }
  };

  return (
    <Row type="flex" justify="center" align="top" className="container__content">
      <Col md={8} className="description">
        {currentLemma && (
          <Definition def={definitionsData} onClick={onClickLemma} currentLemma={currentLemma} />
        )}
      </Col>
      <Col md={15} className="viz">
        <Card>
          <RelationsTitle />
          {graphIsLoading && <LoadingSpin />}
          {!graphIsLoading && currentLemma && graphData && (
            <Viz fullData={graphData[currentLemma]} lemma={currentLemma} />
          )}
        </Card>
      </Col>
    </Row>
  );
}

export default Content;
