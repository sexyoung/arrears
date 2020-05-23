var getSelectedTab = (tab) => {
  var tabId = tab.id;
  var sendMessage = (messageObj) => chrome.tabs.sendMessage(tabId, messageObj);
  // document.getElementById('rotate').addEventListener('click', () => sendMessage({ action: 'ROTATE' }));
  // document.getElementById('reset').addEventListener('click', () => sendMessage({ action: 'RESET' }));
  document.getElementById('crawCurr').addEventListener('click', () => {
    window.open('chrome-extension://eodclgjopfpdljigjglkklajhkiifhjo/index.html', 'arrears');
    sendMessage({ action: 'CRAW_CURR' });
  });
  document.getElementById('crawTotal').addEventListener('click', () => {
    window.open('chrome-extension://eodclgjopfpdljigjglkklajhkiifhjo/index.html', 'arrears');
    sendMessage({ action: 'CRAW_ALL' });
  });

  sendMessage({ action: 'SIZE' });
}

// 但console不會出現
console.log('點擊選單才會出現');

chrome.tabs.getSelected(null, getSelectedTab);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case 'feedbackSize':
      document.getElementById('menu').style.display = "block";
      document.getElementById('notAtList').style.display = "none";
      document.getElementById('crawTotal').innerText = `抓取 ${message.data.total} 頁欠款`;
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
