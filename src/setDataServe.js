const fs = require('fs');

module.exports = function (req, res) {
  fs.writeFileSync('src/data.json', JSON.stringify(req.body));
  res.send(req.body);
}