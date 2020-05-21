const data = [];

const todayTZ = +new Date();

for (let i = 0; i < 20; i++) {
  for (let j = 0; j < ~~(Math.random() * 7) + 3; j++) {
    data.push({
      id: Math.random(),
      date: new Date(todayTZ - i * 86400000).toISOString().split('T')[0],
      store: "香港喜園燒臘",
      user: [`Ben Xie ${j}`,`Kelly Chou ${j}`][~~(Math.random() * 2)],
      bento: "掛爐燒鴨飯",
      money: ~~(Math.random() * 5) * 10 + 50
    });
  }
}
export default data;