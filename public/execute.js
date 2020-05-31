/* eslint-disable no-unused-expressions */
const onMessage = (message, sender ,sendResponse) => {
  
  switch (message.action) {
    case 'CRAW_CURR':
      startCrawCurr();
      break;
    case 'CRAW_TOTAL':
      startCrawTotal();
      break;
    case 'SIZE':
      size();
      break;
    case 'DONE':
      setDone(message.data, sendResponse);
      break;
    default:
      break;
  }
  return true;
}

chrome.runtime.onMessage.addListener(onMessage);
/**
 * date
 * user
 * store
 * bento
 */
function getID(data) {
  let result = '';
  const maxLen = Math.min(data.date.length,data.user.length,data.store.length,data.bento.length,)
  for (let i = 0; i < maxLen; i++) {
    result += (
      (data.date[i] === undefined ? '': data.date[i]) +
      (data.user[i] === undefined ? '': data.user[i]) +
      (data.store[i] === undefined ? '': data.store[i]) +
      (data.bento[i] === undefined ? '': data.bento[i])
    );
  }
  
  return result;
}

function getPageTotal() {
  const pageSize = 15; // [...document.querySelectorAll('table tbody tr')].length;
  const pageInfo = document.querySelector('.navigation span').innerText.split(' ').slice(-3);

  return Math.ceil(pageInfo[2] / pageSize);
}

function size() {

  if(!(document.querySelector('.tab-row li:nth-of-type(2)').classList[0] === 'selected')) {
    return chrome.runtime.sendMessage({
      type: 'notAtListPage'
    });
  }

  const pageSize = 15; //[...document.querySelectorAll('table tbody tr')].length;
  const pageInfo = document.querySelector('.navigation span').innerText.split(' ').slice(-3);

  chrome.runtime.sendMessage({
    type: 'feedbackSize',
    data: {
      curr: pageInfo[0] / pageSize,
      total: Math.ceil(pageInfo[2] / pageSize)
    }
  });
  
}

function startCrawCurr() {
  console.log('抓本頁');
  let data = [];
  let trID = 0;

  document.body.style.overflow = 'hidden';
  document.body.innerHTML = "<div id='crawingBG'><div id='crawing'>抓取中</div></div>" + document.body.innerHTML;
  document.body.innerHTML = "<iframe id='orderPage' name='orderPage'></iframe>" + document.body.innerHTML;

  const linkList = [...document.querySelectorAll('table tbody tr')].map(tr => ({
    orderID: tr.children[0].innerText.trim(),
    link: tr.children[0].querySelector('a').href,
    store: tr.children[2].innerText.trim(),
    date: tr.children[3].innerText.trim().slice(0, 10),
  }));

  openDetail(linkList);

  function openDetail(linkList) {
    document.getElementById('orderPage').src = linkList[trID].link;
    setTimeout(() => {
      const notDoneList = [...document.getElementById('orderPage').contentWindow.document.querySelectorAll('.cell:not(.done)')].slice(0, -1).map(td => {
        const page = +(document.querySelector('tr.navigation span em span').innerText.trim());
        // console.log(td);
        return {
          id: getID({
            ...linkList[trID],
            bento: td.parentNode.children[0].innerText.trim(),
            user: td.innerText.trim(),
          }),
          page,
          date: linkList[trID].date,
          orderID: linkList[trID].orderID,
          store: linkList[trID].store,
          bento: td.parentNode.children[0].innerText.trim(),
          money: +td.parentNode.children[2].innerText.trim(),
          user: td.innerText.trim()
        }
      });
      data = [...data, ...notDoneList];
      if(++trID < linkList.length)
        openDetail(linkList);
      else {
        chrome.runtime.sendMessage({
          type: 'finish',
          data,
        });
        document.getElementById('orderPage').remove();
        document.getElementById('crawingBG').remove();
        document.body.style.overflow = '';
      }
        
    }, 200);
  }
}

function updateProgress(progress) {
  document.getElementById('crawing').innerHTML = `${progress.curr} / ${progress.total}`;
}

function startCrawTotal() {
  let data = [];
  let trID = 0;
  let pageInfo = '';
  
  document.body.innerHTML = "<iframe id='listPage' name='listPage' src='" + location.href + "'></iframe>" + document.body.innerHTML;
  document.body.innerHTML = "<iframe id='orderPage' name='orderPage'></iframe>" + document.body.innerHTML;
  document.body.innerHTML = "<div id='crawingBG'><div id='crawing'>抓取中</div></div>" + document.body.innerHTML;

  setTimeout(() => {
    // document.getElementById('listPage').contentWindow.document.getElementById('centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator_first').click();
    setTimeout(() => {
      const linkList = [...document.getElementById('listPage').contentWindow.document.querySelectorAll('table tbody tr')];
      const pageCT = document.getElementById('listPage').contentWindow.document.querySelector('.navigation span').innerText.split(' ').slice(-3);
      
      updateProgress({
        curr: 1,
        total: Math.ceil(pageCT[2] / linkList.length)
      });

      parseList();
    }, 200);
  }, 200);
  
  function parseList() {
    const linkList = [...document.getElementById('listPage').contentWindow.document.querySelectorAll('table tbody tr')].map(tr => ({
      orderID: tr.children[0].innerText.trim(),
      link: tr.children[0].querySelector('a').href,
      store: tr.children[2].innerText.trim(),
      date: tr.children[3].innerText.trim().slice(0, 10),
    }));
    openDetail(linkList);
  }
  
  function openDetail(linkList) {
    document.getElementById('orderPage').src = linkList[trID].link;
    setTimeout(() => {
      const notDoneList = [...document.getElementById('orderPage').contentWindow.document.querySelectorAll('.cell:not(.done)')].slice(0, -1).map(td => {
        // console.log(td);
        const page = +(document.getElementById('listPage').contentWindow.document.querySelector('tr.navigation span em span').innerText);
        return {
          id: getID({
            ...linkList[trID],
            bento: td.parentNode.children[0].innerText.trim(),
            user: td.innerText.trim(),
          }),
          page,
          date: linkList[trID].date,
          orderID: linkList[trID].orderID,
          store: linkList[trID].store,
          bento: td.parentNode.children[0].innerText.trim(),
          money: +td.parentNode.children[2].innerText.trim(),
          user: td.innerText.trim()
        }
      });
      data = [...data, ...notDoneList];
      if(++trID < linkList.length)
        openDetail(linkList);
      else {
        console.log(data);
        // 換頁
        const nextDOM = document.getElementById('listPage').contentWindow.document.getElementById('centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator_next');

        if(nextDOM.tagName === 'SPAN') {
          // 截完了
          document.getElementById('listPage').remove();
          document.getElementById('orderPage').remove();
          document.getElementById('crawingBG').remove();
          chrome.runtime.sendMessage({
            type: 'finishTotal',
            data,
          });
          return;
        }
        pageInfo = document.getElementById('listPage').contentWindow.document.querySelector('.navigation span').innerText;

        const pageCT = document.getElementById('listPage').contentWindow.document.querySelector('.navigation span').innerText.split(' ').slice(-3);
        
        updateProgress({
          curr: (pageCT[0] / linkList.length) + 1,
          total: Math.ceil(pageCT[2] / linkList.length)
        });
        
        
        nextDOM.click();
        checkLoadListSuccess();
      }
        
    }, 200);
  }
  
  function checkLoadListSuccess() {
    setTimeout(() => {
      // 檢查listPage是否換頁成功
      if(pageInfo === document.getElementById('listPage').contentWindow.document.querySelector('.navigation span').innerText) {
        checkLoadListSuccess();
      } else {
        trID = 0;
        parseList();
      }
    }, 200);
  }
}

function setDone(data, sendResponse) {
  // console.log('SET DONE', data);
  // console.log(getPageTotal());


  const DOM = {
    FIRST: 'centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator_first',
    LAST: 'centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator_last',
  }

  function setDataDone() {
    const minPage = Math.min(...data.map(({ page }) => page));
    const maxPage = Math.max(...data.map(({ page }) => page));


    const from = getPageTotal() - maxPage < minPage - 1 ?
    DOM.LAST:
    DOM.FIRST
  
    const getFrom = from === DOM.LAST ? 'pop': 'shift';

    /** listpage 先加進來 */
    document.body.innerHTML = "<iframe id='listPage' name='listPage' src='" + location.href + "'></iframe>" + document.body.innerHTML;

    /** 等listpage讀完後去點擊第1/last頁 */
    setTimeout(() => {
      document.getElementById('listPage').contentWindow.document.getElementById(from).click();
      // 開始處理每一個data
      const dateOrder = data[getFrom]();

      function checkPageInPagination() {
        // 點擊第1/last頁後，再處理
        setTimeout(() => {
    
          // console.log(dateOrder.page);
          // console.log([...document.getElementById('listPage').contentWindow.document.getElementById('centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator').children].map(dom => dom.innerText));
        
    
          const pageIndex = [...document.getElementById('listPage').contentWindow.document.getElementById('centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator').children].map(dom => dom.innerText.trim()).findIndex(v => v.trim() === `${dateOrder.page}`);
      
          // console.log(pageIndex);
          
          // console.log(document.getElementById('listPage').contentWindow.document.getElementById('centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator').children[pageIndex]);
          
          /** 如果資料所屬的頁面不在現在的可視範圍的導頁器中時，應繼續往後/前找 */
          if(pageIndex === -1) {
            const GODOM = from === DOM.LAST ? DOM.FIRST: DOM.LAST;
            document.getElementById('listPage').contentWindow.document.getElementById(GODOM).click();
            return checkPageInPagination();
          }
      
          // 點擊那個正確的
          document.getElementById('listPage').contentWindow.document.getElementById('centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator').children[pageIndex].children[0].click();

          // 點完正確的頁面後，找正確的訂單
          setTimeout(() => {
            const trIndex = [...document.getElementById('listPage').contentWindow.document.querySelectorAll('table tbody tr')].map(dom => dom.children[0].innerText.trim()).findIndex(v => v === dateOrder.orderID.trim());
            document.getElementById('listPage').contentWindow.document.querySelectorAll(`table tbody tr:nth-of-type(${trIndex + 1}) a`)[1].click();

            /** 輸入管理密碼 */
            setTimeout(() => {           
              document.getElementById('listPage').contentWindow.document.querySelector(`table tbody form`).children[3].value = '1234';
              document.getElementById('listPage').contentWindow.document.querySelector(`table tbody form`).children[5].click();
              /** 進去order頁 */
              setTimeout(() => {
                // 繳!!!!!!!
                
                // 如果找不到(-1)，代表 app 那邊沒有刪除已登記的資料
                const notPaidIndex = [...document.getElementById('listPage').contentWindow.document.querySelectorAll('#payTabs table tbody .notPaid a')]
                  .map(dom => dom.innerText)
                  .findIndex(name => name.trim() === dateOrder.user.trim());
                
                if(notPaidIndex === -1) {
                  chrome.runtime.sendMessage({
                    type: 'removeHadDone',
                    id: dateOrder.id,
                  });
                } else {
                  document.getElementById('listPage').contentWindow.document.querySelectorAll('#payTabs table tbody .notPaid a')[notPaidIndex].click();
                }

                setTimeout(() => {
                  document.getElementById('listPage').remove();
                  if(data.length) {
                    setDataDone();
                  } else {
                    // console.log('處理完成!');
                    sendResponse({ ok: true });
                  }
                }, 200);
              }, 200);

            }, 300);
            
          }, 500);
    
        }, 300);
      }

      checkPageInPagination();

    }, 200);

  }

  setDataDone();
}