import Empty from 'antd/lib/empty/empty';
import React, { useEffect } from 'react';
import { TypeToHierarchy } from '../../../api/types';
import { isEmpty } from '../../../util/object';
import { clearGraph, draw, mergeGraphData } from './D3Graph';
import './Graph.css';

const Graph = (props: { data: TypeToHierarchy; lemma: string }): JSX.Element => {
  const { data, lemma } = props;
  useEffect(() => {
    clearGraph();
    if (!data || isEmpty(data)) {
      return;
    }
    draw(mergeGraphData(data, lemma));
  }, [data, lemma]);

  return (
    <div className="graph">
      {isEmpty(data) ? <Empty /> : (
        <svg />
      )}
    </div>
  );
};

export default Graph;
