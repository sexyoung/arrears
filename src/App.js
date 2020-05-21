import React, { useEffect, useState } from 'react';
import style from './App.module.scss';

// import oriData from './data.js';
import { byDateFormat, byUserFormat, removeByIDs, findKing } from './utils';

function App() {

  const [data, setData] = useState([]);
  const [value, setValue] = useState("");
  const [userArr, setUserArr] = useState([]);

  useEffect(() => {
    fetch('http://localhost:1111/get').then(res => res.json()).then(setData);
  }, []);

  const handleChange = ({ target: { value }}) => {
    setValue(value);
    setUserArr(byUserFormat(data, value.trim()));
  }

  const payByUser = () => {
    // eslint-disable-next-line no-restricted-globals
    if(!confirm('繳清此便當錢?')) return;
    setValue("");
    const updateData = removeByIDs(data, userArr.map(({ id }) => id));
    writeData(updateData);
    setData(updateData);
  }

  const payByID = id => {
    // eslint-disable-next-line no-restricted-globals
    if(!confirm('繳清此便當錢?')) return;
    const updateData = removeByIDs(data, [id]);
    writeData(updateData);
    setData(updateData);
  }

  const writeData = data => {
    fetch('http://localhost:1111/set', {
      body: JSON.stringify(data), // must match 'Content-Type' header
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, same-origin, *omit
      headers: {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': 'application/json'
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // *client, no-referrer
    })
    .then(response => response.json()).then(console.log);
  }

  const handleCopy = () => {

    // const items = await navigator.clipboard.read();
    // const textBlob = await items[0].getType("text/plain");
    // const text = await (new Response(textBlob)).text();

    // navigator.clipboard.read().then(items => {
    //   console.log(items[0].getType("text/plain"));
      
    //   items[0].getType("text/plain").then(textBlob => {
    //     new Response(textBlob).text().then(console.log)
    //   });
    // });

    navigator.clipboard.readText()
    .then(text => {
      console.log('Pasted content: ', text);
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
    
  }
  
  const king = findKing(data);

  // console.log(JSON.stringify(oriData));
  

  const dateObj = {...byDateFormat(data)};

  return (
    <div className={style.App}>
      <h2 className={style.title}>
        欠便當錢系統
      </h2>
      <div className={style.info}>
        <div>目前總欠債 ${data.reduce((sum, order) => sum + order.money, 0)}</div>
        <div>{king && `欠債王 ${king.name}, 欠了 $${king.money}`}</div>
      </div>
      <div className={style.form}>
        <input value={value} type="text" placeholder="債主名" onChange={handleChange} />
        <button onClick={handleCopy}>read from clipboard</button>
      </div>

      {value ?
        <div className={`${style.note} ${style.center}`}>
        {userArr.length ?
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

export default App;
