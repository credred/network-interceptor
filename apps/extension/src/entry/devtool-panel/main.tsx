import { setRules } from 'common/network-rule';
import React from 'react'
import ReactDOM from 'react-dom/client'
import "../../index.css";
import { rules$ } from '../../lib/storage';
import App from './App'

rules$.subscribe((rules) => {
  setRules(Array.from(Object.values(rules)))
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
