import Icon from 'antd/lib/icon';
import Layout from 'antd/lib/layout';
import React from 'react';

const Footer = () => (
  <Layout.Footer>
    <p>
      Made by
      {' '}
      <Icon type="github" />
      {' '}
      <a href="https://github.com/aliiae" target="_blank" rel="noopener noreferrer">
        <strong>aliiae</strong>
      </a>
      {' '}
      &copy; 2019.
      Lexicographic data is from WordNet &copy;
      {' '}
      <em>
        Princeton University &quot;About WordNet.&quot;
        {' '}
        <a href="https://wordnet.princeton.edu/">
          WordNet
        </a>
        . Princeton University. 2010.
      </em>
    </p>
  </Layout.Footer>
);

export default React.memo(Footer);
