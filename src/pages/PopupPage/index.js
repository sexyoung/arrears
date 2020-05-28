import React, { useEffect } from 'react';

import style from './style.module.scss';

const { chrome } = window;
let tabId = null

const getSelectedTab = (tab) => {
  tabId = tab.id;
  chrome.tabs.sendMessage(tabId, { action: 'SIZE' });
}

const handleOpenHome = ({ target }) => {
  window.open(`chrome-extension://${chrome.runtime.id}/index.html?from=${target.id}`, 'arrears');
  chrome.tabs.sendMessage(tabId, { action: target.id })
}

export function PopupPage() {
  useEffect(() => {
    chrome &&
    chrome.tabs &&
    chrome.tabs.getSelected(null, getSelectedTab);

    chrome &&
    chrome.runtime &&
    chrome.runtime.onMessage &&
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      switch (message.type) {
        case 'feedbackSize':
          document.getElementById('menu').style.display = "block";
          document.getElementById('notAtList').style.display = "none";
          document.getElementById('CRAW_TOTAL').innerText = `抓取 ${message.data.total} 頁欠款`;
          break;
        case 'notAtListPage':
          document.getElementById('menu').style.display = "none";
          document.getElementById('notAtList').style.display = "block";
          break;
        default:
          break;
      }
      
      // sendResponse({
      //     data: "I am fine, thank you. How is life in the background?"
      // });
    });

  }, []);

  return (
    <div className={style.PopupPage}>
      <div id="notAtList" className={style.notAtList}>
        到
        <a href="https://dinbendon.net/do" target="_blank">
          訂便當
        </a>
        網站並點擊:
        <ol>
          <li>右上角的管理中心</li>
          <li>左上角的管理訂單</li>
        </ol>
      </div>
      <div style={{ display: 'none' }} id="menu" className={style.menu}>
        <button onClick={handleOpenHome} id="CRAW_CURR">抓本頁欠款</button>
        <button onClick={handleOpenHome} id="CRAW_TOTAL">抓取欠款</button>
        <button onClick={handleOpenHome} id="WATCH">看總覽</button>
      </div>
    </div>
  )
}
