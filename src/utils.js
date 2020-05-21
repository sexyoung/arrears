export function byDateFormat(data) {
  let dateObj = {}  
  let resultObj = {}
  data.forEach(order => {
    dateObj[order.date] = !dateObj[order.date] ? [
      order
    ]: [
      ...dateObj[order.date],
      order
    ]
  });

  const dateList = Object.keys(dateObj);

  dateList.sort((a, b) => b - a);

  dateList.forEach(date => {
    resultObj[date] = [...dateObj[date]]
  });
  
  return resultObj;
}

export function byUserFormat(data, name) {
  data = data.slice().filter(order => order.user.toLowerCase().includes(name.toLowerCase()));
  if([...new Set(data.map(({ user }) => user))].length > 1) return [];
  
  data.sort((a, b) => b.date - a.date);
  return data;
}

export function removeByIDs(data, idList) {
  return data.filter(order => !idList.includes(order.id));
}

export function findKing(data) {

  if(!data.length) return null;

  const userObj = data.reduce((obj, order) => {
    if(obj[order.user]) {
      obj[order.user] += order.money;
    } else {
      obj[order.user] = order.money;
    }
    return obj;
  }, {});

  let kingUser = {name: '', money: 0};

  for (const name in userObj) {
    if(userObj[name] > kingUser.money) {
      kingUser = {
        name,
        money: userObj[name]
      }
    }
  }
  return kingUser;
}