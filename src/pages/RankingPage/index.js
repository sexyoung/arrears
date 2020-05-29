import React, { useEffect, useState, createRef } from 'react';
import { Link } from "react-router-dom";
import style from './style.module.scss';

export function RankingPage() {

  const [maxMoeny, setMaxMoeny] = useState(0);
  const [debtList, setDebtList] = useState([]);

  useEffect(() => {
    let localData = localStorage.getItem('arrearsData')?
      JSON.parse(localStorage.getItem('arrearsData')): [];
    
    let result = [];
    const userDebt = localData.reduce((obj, data) => {
      if(!obj[data.user]) {
        obj[data.user] = data.money;
      } else {
        obj[data.user] += data.money;
      }
      return obj;
    }, {});

    for (const name in userDebt) {
      result = [...result, {
        name,
        money: userDebt[name],
      }];
    }

    result.sort((a, b) => b.money - a.money);
    setDebtList(result);
    if(result.length) {
      setMaxMoeny(result[0].money);
    }
  }, []);

  return (
    <div className={style.RankingPage}>
      <h3 className={style.title}>欠款排行榜</h3>
      <div className={style.center}>
        <Link className={style.back} to="/">回首頁</Link>
      </div>
      <div className={style.list}>
        {debtList.map(debt =>
          <div className={style.debt} key={debt.name}>
            <div className={style.name}>
              <Link to={`/?user=${debt.name}`}>{debt.name}</Link>
            </div>
            <div className={style.barWrapper}>
              <div
                className={style.bar}
                style={{ width: `${debt.money / maxMoeny * 100}%` }}
              >
                <div className={style.animation} data-money={`$${debt.money}`} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
