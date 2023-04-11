import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom'

import { initializeApp } from 'firebase/app'

import firebaseConfig from './firebaseConfig.json'

import './css/global.css';
import App from './App';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore/lite';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const { DEV: DEV_MODE } = import.meta.env

initializeApp(firebaseConfig)
if (DEV_MODE) {
  connectFirestoreEmulator(getFirestore(), 'localhost', 8080)
  connectStorageEmulator(getStorage(), 'localhost', 9199)
}

ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <StrictMode>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </StrictMode>
  )