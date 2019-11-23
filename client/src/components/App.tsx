import Layout from 'antd/lib/layout';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Content from './Content';
import Footer from './UI/Footer';
import Header from './UI/Header';

const App: React.FC = () => (
  <BrowserRouter>
    <Layout>
      <Header />
      <Switch>
        <Route exact path="/:urlWord?">
          <Content />
        </Route>
        <Route exact path="/*/*">
          <Content />
        </Route>
      </Switch>
      <Footer />
    </Layout>
  </BrowserRouter>
);

export default App;
