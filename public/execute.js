// const rotateEvent = () => {
//   document.body.style.transform = 'rotate(180deg)';
//   document.body.style.backgroundColor = 'red';

//   chrome.runtime.sendMessage({
//     data: "來自訂便當"
//   }, function (response) {
//       console.dir(response);
//   });

// };
// const reset = () => {
//   document.body.style.transform = '';
// }

const onMessage = (message) => {
  switch (message.action) {
    // case 'ROTATE':
    //   rotateEvent();
    //   break;
    // case 'RESET':
    //   reset();
    case 'CRAW_CURR':
      startCrawCurr();
      break;
    case 'CRAW_ALL':
      startCrawTotal();
      break;
    case 'SIZE':
      size();
      break;
    default:
      break;
  }
}

chrome.runtime.onMessage.addListener(onMessage);

function size() {

  if(!(document.querySelector('.tab-row li:nth-of-type(2)').classList[0] === 'selected')) {
    return chrome.runtime.sendMessage({
      type: 'notAtListPage'
    });
  }

  const pageSize = [...document.querySelectorAll('table tbody tr')].length;
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
  document.body.innerHTML = "<iframe id='orderPage' name='orderPage' width='0px' height='0px'></iframe>" + document.body.innerHTML;

  const linkList = [...document.querySelectorAll('table tbody tr')].map(tr => ({
    link: tr.children[0].querySelector('a').href,
    store: tr.children[2].innerText,
    date: tr.children[4].innerText.slice(0, 10),
  }));

  openDetail(linkList);

  function openDetail(linkList) {
    document.getElementById('orderPage').src = linkList[trID].link;
    setTimeout(() => {
      const notDoneList = [...document.getElementById('orderPage').contentWindow.document.querySelectorAll('.cell:not(.done)')].slice(0, -1).map(td => {
        // console.log(td);
        return {
          date: linkList[trID].date,
          store: linkList[trID].store,
          bendo: td.parentNode.children[0].innerText,
          money: +td.parentNode.children[2].innerText,
          user: td.innerText
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
  
  document.body.innerHTML = "<iframe id='listPage' name='listPage' width='0px' height='0px' src='" + location.href + "'></iframe>" + document.body.innerHTML;
  document.body.innerHTML = "<iframe id='orderPage' name='orderPage' width='0px' height='0px'></iframe>" + document.body.innerHTML;
  document.body.innerHTML = "<div id='crawingBG'><div id='crawing'>抓取中</div></div>" + document.body.innerHTML;

  setTimeout(() => {
    document.getElementById('listPage').contentWindow.document.getElementById('centerTabs_panel_orders_topToolbars_1_toolbar_span_navigator_first').click();
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
      link: tr.children[0].querySelector('a').href,
      store: tr.children[2].innerText,
      date: tr.children[4].innerText.slice(0, 10),
    }));
    openDetail(linkList);
  }
  
  function openDetail(linkList) {
    document.getElementById('orderPage').src = linkList[trID].link;
    setTimeout(() => {
      const notDoneList = [...document.getElementById('orderPage').contentWindow.document.querySelectorAll('.cell:not(.done)')].slice(0, -1).map(td => {
        // console.log(td);
        return {
          date: linkList[trID].date,
          store: linkList[trID].store,
          bendo: td.parentNode.children[0].innerText,
          money: +td.parentNode.children[2].innerText,
          user: td.innerText
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
