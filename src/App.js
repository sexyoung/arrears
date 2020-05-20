import React from 'react';
import style from './App.module.scss';

import data from './data.js';
import { byDateFormat } from './utils';

console.log(byDateFormat(data));

function App() {
  return (
    <div className={style.App}>

      <form className={style.form}>
        <input type="text" placeholder="人名搜尋" />
      </form>

      {[...Array(30).keys()].map(i =>
        <div className={style.note} key={i}>
          <table>
            <thead>
              <tr>
                <th colSpan="4">YYYY/MM/DD 店名</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3).keys()].map(i =>
                <tr key={i}>
                  <td>掛爐燒鴨飯</td>
                  <td>Irene Yang</td>
                  <td>$100</td>
                  <td><button>已繳</button></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
