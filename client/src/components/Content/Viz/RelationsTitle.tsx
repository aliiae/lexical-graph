import Typography from 'antd/lib/typography';
import React from 'react';

const RelationsTitle = (): JSX.Element => (
  <Typography.Title level={2} className="content__title">
    Lexical relations
    <sup>
      <a
        href="https://wordnet.princeton.edu/"
        title="See the definitions on WordNet website"
      >
        [?]
      </a>
    </sup>
  </Typography.Title>
);

export default React.memo(RelationsTitle);
