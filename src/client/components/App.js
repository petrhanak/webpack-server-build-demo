import React, { Component } from 'react';
import style from './app.css';

export default class App extends Component {

  render() {
    return (
      <div>
        <h2 className={style.helloWorld}>Hello world</h2>
      </div>
    )
  }
}