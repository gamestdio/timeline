
const History = require('./history.js')

module.exports.createHistory = function ( maxSnapshots ) {

  return new History( maxSnapshots )

}
