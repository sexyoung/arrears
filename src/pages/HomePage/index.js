/* eslint-disable no-undef */
import React, { useEffect, useState, createRef } from 'react';
import style from './style.module.scss';

// import oriData from './data.js';
import {
  findKing,
  findByIDs,
  removeByIDs,
  byDateFormat,
  byUserFormat,
} from 'utils';

let openerTabId = null;

const { chrome } = window;

chrome && chrome.tabs && chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  openerTabId = tabs[0].openerTabId;

  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get('from');

  if(from !== 'WATCH') {
    chrome.tabs.update(openerTabId, {highlighted: true});
  }

});

const compareData = ({data, newData, compareField}) => {
  let result = [...data];
  const dataIDList = data.map(({ id }) => id);
  const newDataIDList = newData.map(({ id }) => id);
  newDataIDList.forEach((id, i) => {
    if(!dataIDList.includes(id)) {
      result = [...result, {...newData[i]}];
    }
  });
  result.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return result;
}

export function HomePage() {

  const inputDOM = createRef();
  const strictDOM = createRef();
  
  const [data, setData] = useState([]);
  const [value, setValue] = useState("");
  const [userArr, setUserArr] = useState([]);

  useEffect(() => {

    let localData = localStorage.getItem('arrearsData')?
      JSON.parse(localStorage.getItem('arrearsData')): [];
    
    if(localData.length) {
      localData.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }

    setData(localData);

    if(chrome && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(message => {
        switch (message.type) {
          case 'finish':
            setData(data => {
              const result = compareData({data, newData: message.data, compareField: 'id'});
              localStorage.setItem('arrearsData', JSON.stringify(result));
              return result;
            });
            break;
          default:
            break;
        }
      });
    }

  }, []);

  const handleChange = ({ target: { value }}) => {
    setValue(value);    
    setUserArr(byUserFormat(data, value.trim(), strictDOM.current.checked));
  }

  const handleClickKing = king => {
    setValue(king);
    setUserArr(byUserFormat(data, king.trim(), strictDOM.current.checked));
  }

  const handleStrictChange = () => {
    setUserArr(byUserFormat(data, inputDOM.current.value.trim(), strictDOM.current.checked));
  }

  const payByUser = () => {
    // eslint-disable-next-line no-restricted-globals
    if(!confirm('繳清此便當錢?')) return;
    setValue("");
    const updateData = removeByIDs(data, userArr.map(({ id }) => id));
    const doneData = findByIDs(data, userArr.map(({ id }) => id));

    if(openerTabId && chrome) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(openerTabId, {
          action: 'DONE',
          data: doneData
        }, response => {
          // if(response.ok) {
            setData(updateData);
          // }
        });
      });
    }
  }

  const payByID = id => {
    // eslint-disable-next-line no-restricted-globals
    if(!confirm('繳清此便當錢?')) return;
    const updateData = removeByIDs(data, [id]);
    const doneData = findByIDs(data, [id]);
    
    if(openerTabId && chrome) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(openerTabId, {
          action: 'DONE',
          data: doneData
        }, response => {
          // if(response.ok) {
            setData(updateData);
          // }
        });
      });
    }
  }
  
  const king = findKing(data);

  const dateObj = {...byDateFormat(data)};

  return (
    <div className={style.HomePage}>
      <h2 className={style.title}>
        訂便當欠款記錄
      </h2>
      <div className={style.info}>
        <div>目前總欠債 ${data.reduce((sum, order) => sum + order.money, 0)}</div>
        <div>{king && <>
          欠債王
          <span onClick={handleClickKing.bind(this, king.name)}>{king.name}</span>
          欠了 ${king.money}
        </>}</div>
      </div>
      <div className={style.form}>
        <input
          type="text"
          value={value}
          placeholder="債主名"
          ref={inputDOM}
          onChange={handleChange}
        />
        <label className={style.label}>
          名字完全符合
          <input type="checkbox" onChange={handleStrictChange} ref={strictDOM} />
        </label>
      </div>

      {value ?
        <div className={`${style.note} ${style.center}`}>
        {userArr && userArr.length ?
          <table cellSpacing="0">
            <thead>
              <tr>
                <th colSpan="2">
                  <div className={style.money}>
                    ${userArr.reduce((sum, order) => sum + order.money, 0)}
                  </div>
                </th>
                <th colSpan="2">
                  <button className={style.paied} onClick={payByUser}>繳!</button>
                </th>
              </tr>
            </thead>
            <tbody>
              {userArr.map((order, i) =>
                <tr key={i}>
                  <td>{order.store}</td>
                  <td>{order.date}</td>
                  <td>{order.bento}</td>
                  <td>${order.money}</td>
                </tr>
              )}
            </tbody>
          </table>:
          <div className={style.noUser}>
            <div>沒有符合<span>{value}</span></div>
            或
            <div>多個<span>{value}</span>債主</div>
          </div>
        }
        </div>:
        Object.keys(dateObj).map(date =>
          <div className={style.note} key={date}>
            <table cellSpacing="0">
              <thead>
                <tr>
                  <th colSpan="4">{date} {dateObj[date][0].store}</th>
                </tr>
              </thead>
              <tbody>
                {dateObj[date].map((order, i) =>
                  <tr key={i}>
                    <td>{order.bento}</td>
                    <td>{order.user}</td>
                    <td>${order.money}</td>
                    <td><button className={style.paied} onClick={payByID.bind(this, order.id)}>繳!</button></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}
