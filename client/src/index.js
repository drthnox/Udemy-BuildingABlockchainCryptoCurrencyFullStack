import React from 'react';
import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App';
import Blocks from './components/Blocks';
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";
import ConductTransaction from './components/ConductTransaction';
import TransactionPool from './components/TransactionPool';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Routes>
      <Route exact={true} path="/" element={<App />} />
      <Route path="/blocks" element={<Blocks />} />
      <Route path="/conduct-transaction" element={<ConductTransaction />} />
      <Route path="/transaction-pool" element={<TransactionPool />} />
    </Routes>
  </BrowserRouter>
);