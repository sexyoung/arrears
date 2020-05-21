const fs = require('fs');

module.exports = function (req, res) {
  const json = JSON.parse(fs.readFileSync('src/data.json'), true);
  res.send(json);
}