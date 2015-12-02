import './style.css';
import React from "react";
import ReactDOM from 'react-dom';
import Main from './main.jsx';

ReactDOM.render(
  <div>
    <div id="app" className="container">
      <div className="page-header">
        <h1>Room climate</h1>
      </div>
      <Main />
    </div>
    <footer className="footer">
      <div className="container">
        <p className="text-muted">IOT Projekt © Michael Suter, Bruno Zimmermann, Micha Schwendener</p>
      </div>
    </footer>
  </div>,
  document.getElementById('app')
);
