import React from 'react';
import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App';
// import Blocks from './components/Blocks';
// import { Router, Route, Link, browserHistory, IndexRoute } from 'react-router'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>
);