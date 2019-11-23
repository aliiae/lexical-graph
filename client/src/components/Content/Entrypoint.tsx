import Col from 'antd/lib/grid/col';
import Row from 'antd/lib/grid/row';
import Search from 'antd/lib/input/Search';
import Layout from 'antd/lib/layout';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams, withRouter } from 'react-router-dom';
import Content from './Content';

function Entrypoint(): JSX.Element {
  const [query, setQuery] = useState<string | null>(null);
  const { urlWord } = useParams();
  const history = useHistory();
  const ref = useRef(undefined);

  useEffect(() => {
    setQuery(urlWord || null);
    if (urlWord) {
      document.title = `${urlWord} | Lexical Graph | Wordnet Visualisation`;
    }
  }, [urlWord]);

  const onSearch = (word: string): void => {
    if (word !== query) {
      history.push(`/${word}`);
    }
    // @ts-ignore
    ref.current.input.state.value = '';
  };

  return (
    <Layout.Content>
      <div className="main__content">
        <Row type="flex" justify="center" align="middle">
          <Col md={16}>
            <Search
              placeholder="Search for a word, e.g. cat"
              enterButton="Search"
              size="large"
              // @ts-ignore
              ref={ref}
              onSearch={onSearch}
              className="word-search"
            />
          </Col>
        </Row>
        {query && <Content query={query} />}
      </div>
    </Layout.Content>
  );
}

export default withRouter(Entrypoint);
