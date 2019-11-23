import Typography from 'antd/lib/typography';
import React from 'react';

const DefinitionTitle = (): JSX.Element => (
  <Typography.Title className="content__title">Synsets</Typography.Title>
);

export default React.memo(DefinitionTitle);
