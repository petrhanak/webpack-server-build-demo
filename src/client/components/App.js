import React, { Component } from 'react';
import style from './app.css';
import logo from './strv-logo.svg';

export default class App extends Component {

  render() {
    return (
      <div>
        <h2 className={style.helloWorld}>Hello world</h2>
        <img src={logo} />
      </div>
    )
  }
}