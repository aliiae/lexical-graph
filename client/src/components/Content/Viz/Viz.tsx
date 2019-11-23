import React, { useEffect, useState } from 'react';
import { RelationType, TypeToHierarchy } from '../../../api/types';
import WordnetAPI from '../../../api/WordnetAPI';
import { deleteKey, hasOwnProperty } from '../../../util/object';
import Graph from './Graph';
import SwitchGroup from './SwitchGroup';

function Viz(props: { fullData: TypeToHierarchy; lemma: string }): JSX.Element {
  const { fullData, lemma } = props;
  const [displayData, setDisplayData] = useState<TypeToHierarchy | null>(null);
  useEffect(() => {
    setDisplayData(fullData);
  }, [fullData]);
  const onChange = (switched: boolean, event: MouseEvent): void => {
    if (!event.target) {
      return;
    }
    // @ts-ignore
    const type: RelationType = event.target.id;
    if (switched) {
      if (displayData && hasOwnProperty(displayData, type)) {
        return;
      }
      if (!fullData || !hasOwnProperty(fullData, type)) {
        return;
      }
      if (displayData) {
        setDisplayData({
          ...displayData,
          [type]: fullData[type],
        });
      } else {
        setDisplayData({ [type]: fullData[type] });
      }
    } else {
      if (!displayData || !hasOwnProperty(displayData, type)) {
        return;
      }
      setDisplayData(deleteKey(displayData, type));
    }
  };
  return (
    <>
      <div className="container__switches">
        <ul className="switches">
          {WordnetAPI.RELATION_TYPES.map((type) => (
            <li key={type}>
              <SwitchGroup
                type={type}
                onChange={onChange}
                defaultChecked={hasOwnProperty(fullData, type)}
                disabled={!hasOwnProperty(fullData, type)}
              />
            </li>
          ))}
        </ul>
      </div>
      {displayData && <Graph data={displayData} lemma={lemma} />}
    </>
  );
}

export default Viz;
