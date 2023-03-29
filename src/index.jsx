import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom'

import { initializeApp } from 'firebase/app'

import firebaseConfig from './firebaseConfig.json'

import './css/global.css';
import App from './App';

initializeApp(firebaseConfig)

ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <StrictMode>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </StrictMode>
  )