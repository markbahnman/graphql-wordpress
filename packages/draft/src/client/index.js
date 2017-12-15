import React from 'react';
import ReactDOM from 'react-dom';
import { hydrate } from 'emotion';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
import App from 'routes/App';
import client from './apolloClient';

if (window.__emotion) {
  hydrate(window.__emotion);
}

ReactDOM.hydrate(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('main')
);
