import Result from 'antd/lib/result';
import Typography from 'antd/lib/typography';
import React from 'react';

function EmptyResult({ word }: { word: string }): JSX.Element {
  const message = (
    <Typography.Text>
      The word &quot;
      {word}
      &quot; was not found in WordNet.
    </Typography.Text>
  );
  return (
    <Result
      status="warning"
      title={`"${word}"`}
      extra={message}
    />
  );
}

export default EmptyResult;
