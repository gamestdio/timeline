"use strict";

var assert = require('assert')
  , createTimeline = require('../lib/index').createTimeline

describe('Timeline', function() {

  var timeline = createTimeline()
  timeline.takeSnapshot({ entities : { "one": 10 } })

  // fake 100ms later
  timeline.takeSnapshot({ entities : { "one": 5 } }, 100)

  // fake 200ms later
  timeline.takeSnapshot({ entities : { "one": 0 } }, 200)

  describe("dealing with dropped snapshots", function() {

    let t = createTimeline( 5 )
    assert.equal( t.history.length, 0 )

    t.takeSnapshot({ "one": 10 })
    t.takeSnapshot({ "one": 15 }, 20)
    t.takeSnapshot({ "one": 18 }, 30)
    t.takeSnapshot({ "one": 20 }, 40)

    assert.equal( t.history.length, 4 )

    it("#takeSnapshot should drop old snapshots", function() {

      t.takeSnapshot({ "one": 25 }, 50)
      assert.equal( t.history.length, 5 )

      t.takeSnapshot({ "one": 20 }, 60)
      assert.equal( t.history.length, 5 )

      t.takeSnapshot({ "one": 30 }, 70)
      assert.equal( t.history.length, 5 )

      t.takeSnapshot({ "one": 40 }, 80)
      assert.equal( t.history.length, 5 )

    })

    it("should interpolate between removed state", function() {

      let t = createTimeline( 5 )
      t.takeSnapshot({ "one": 10 })
      t.takeSnapshot({ "one": 15 }, 20)
      t.takeSnapshot({ "one": 18 }, 30)
      t.takeSnapshot({ "one": 20 }, 40)
      t.takeSnapshot({ "one": 30 }, 50)
      t.takeSnapshot({ "one": 40 }, 60)
      assert.equal( t.at(0).one, 15 )

    })

  })

  describe("number of snapshots", function() {

    it("should not interpolate having only one snapshot", function() {

      let t = createTimeline()
      t.takeSnapshot({ entities : { "one": 10 } })

      assert.equal( t.at( 0 ).entities.one, 10 )
      assert.equal( t.at( 100 ).entities.one, 10 )

    })

    it("should interpolate having only two snapshots", function() {

      let t = createTimeline()

      t.takeSnapshot({ entities : { "one": 10 } })

      // fake 100ms later
      t.takeSnapshot({ entities : { "one": 5 } }, 100)

      assert.equal( t.at( 0 ).entities.one, 10 )
      assert.equal( t.at( 100 ).entities.one, 5 )
      assert.equal( t.at( 200 ).entities.one, 0 )

    })

  })

  describe("#at (without interpolation/extrapolation)", function() {

    it("should find closest snapshot by time distance", function() {

      assert.equal( timeline.at( 0, false ).entities.one, 10 )
      assert.equal( timeline.at( 25, false ).entities.one, 10 )
      assert.equal( timeline.at( 50, false ).entities.one, 5 )
      assert.equal( timeline.at( 80, false ).entities.one, 5 )

      assert.equal( timeline.at( 100, false ).entities.one, 5 )
      assert.equal( timeline.at( 140, false ).entities.one, 5 )

      assert.equal( timeline.at( 200, false ).entities.one, 0 )
      assert.equal( timeline.at( 210, false ).entities.one, 0 )
      assert.equal( timeline.at( 1000, false ).entities.one, 0 )

    })

  })

  describe("#at (with interpolation)", function() {

    it("no need to interpolate end of frames", function() {

      assert.equal( timeline.at( 0 ).entities.one , 10 )
      assert.equal( timeline.at( 100 ).entities.one , 5 )
      assert.equal( timeline.at( 200 ).entities.one , 0 )

    })

    it("should interpolate values between known snapshots", function() {

      assert.equal( timeline.at( 50 ).entities.one, 7.5 )
      assert.equal( timeline.at( 150 ).entities.one, 2.5 )

    })

    it("should extrapolate future time requests", function() {

      assert.equal( timeline.at( 300 ).entities.one, -5 )
      assert.equal( timeline.at( 400 ).entities.one, -10 )
      assert.equal( timeline.at( 500 ).entities.one, -15 )

    })

  })

});
