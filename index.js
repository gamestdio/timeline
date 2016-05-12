
const Timeline = require('./timeline.js')

module.exports.createTimeline = function ( maxSnapshots ) {

  return new Timeline( maxSnapshots )

}
