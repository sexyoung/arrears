import React, { useEffect } from 'react';

const { chrome } = window;
let tabId = null

const getSelectedTab = (tab) => {

  tabId = tab.id;
  
  // var sendMessage = (messageObj) => chrome.tabs.sendMessage(tabId, messageObj);
  
  // document.getElementById('crawCurr').addEventListener('click', () => {
  //   window.open(`chrome-extension://${chrome.runtime.id}/index.html`, 'arrears');
  //   sendMessage({ action: 'CRAW_CURR' });
  // });
  // document.getElementById('crawTotal').addEventListener('click', () => {
  //   window.open(`chrome-extension://${chrome.runtime.id}/index.html`, 'arrears');
  //   sendMessage({ action: 'CRAW_ALL' });
  // });

  // document.getElementById('watch').addEventListener('click', () => {
  //   window.open(`chrome-extension://${chrome.runtime.id}/index.html`, 'arrears');
  // });

  chrome.tabs.sendMessage(tabId, { action: 'SIZE' });
}

const handleOpenHome = ({ target }) => {
  window.open(`chrome-extension://${chrome.runtime.id}/index.html`, 'arrears');
  chrome.tabs.sendMessage(tabId, { action: target.id })
}

export function PopupPage() {
  useEffect(() => {
    chrome && chrome.tabs && chrome.tabs.getSelected(null, getSelectedTab);
  }, []);

  return (
    <div>
      <div id="notAtList">
        <a href="https://dinbendon.net/do" target="_blank">請到 [所有訂單頁]</a>
      </div>
      <div id="menu" style={{ display: 'none' }}>
        <button onClick={handleOpenHome} id="CRAW_CURR">抓本頁欠款</button>
        <button onClick={handleOpenHome} id="CRAW_TOTAL">抓取欠款</button>
        <button onClick={handleOpenHome} id="WATCH">看總覽</button>
      </div>
    </div>
  )
}
