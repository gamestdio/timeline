const createTimeline = require('../index.js').createTimeline

var timeline = createTimeline()

// first game state snapshot
timeline.takeSnapshot({
  player: { x: 100 },
  enemy: { x: 0 }
})

setTimeout(() => {
  // take second game state snapshot after 1000ms

  timeline.takeSnapshot({
    player: { x: 0 },
    enemy: { x: 100 }
  })

  //
  // Retrieving a previous state
  //
  console.log( timeline.at( 0 ).player.x )
  // => 100
  console.log( timeline.at( 0 ).enemy.x )
  // => 0

  //
  // Interpolating data from known states
  //
  console.log( timeline.at( 500 ).player.x )
  // => 49.75124378109453
  console.log( timeline.at( 500 ).enemy.x )
  // => 50.24875621890547

  //
  // Extrapolating data between an unknown state
  //
  console.log( timeline.at( 1500 ).player.x )
  // => -49.25373134328358
  console.log( timeline.at( 1500 ).enemy.x )
  // => 149.2537313432836

}, 1000)
