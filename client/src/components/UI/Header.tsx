import Layout from 'antd/lib/layout';
import React from 'react';
import { Link } from 'react-router-dom';
import './UI.css';

const Header = (): JSX.Element => (
  <Layout.Header>
    <Link to="/">
      <span className="logo">Lexical Graph</span>
    </Link>
  </Layout.Header>
);

export default React.memo(Header);
