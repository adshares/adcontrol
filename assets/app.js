import './styles/app.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './utils/theme';
import { BrowserRouter } from 'react-router-dom';
import AppController from './AppController/AppController';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppController />
        </ThemeProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>,
);
