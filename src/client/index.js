import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import RedBox from 'redbox-react';

const rootElement = document.getElementById('app');

function renderApp() {
  try {
    render(
      <App />,
      rootElement
    );
  } catch (e) {
      render(<RedBox error={e} />, rootElement);
  }
}

renderApp();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    renderApp();
  });
}