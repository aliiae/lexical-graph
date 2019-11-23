import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import React from 'react';

const LoadingSpin = (): JSX.Element => <Spin indicator={<Icon type="loading" spin />} />;

export default React.memo(LoadingSpin);
