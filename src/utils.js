export function byDateFormat(data) {
  let result = {}  
  data.forEach(order => {
    result[order.date] = !result[order.date] ? [
      order
    ]: [
      ...result[order.date],
      order
    ]
  })
  console.log(Object.keys(result));
  
  return result;
}