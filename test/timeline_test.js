"use strict";

var assert = require('assert')
  , createTimeline = require('../index.js').createTimeline

describe('Timeline', function() {

  var now = Date.now()

  var timeline = createTimeline()
  timeline.takeSnapshot({ entities : { "one": 10 } })

  // fake 100ms later
  timeline.takeSnapshot({ entities : { "one": 5 } }, now + 100)

  // fake 200ms later
  timeline.takeSnapshot({ entities : { "one": 0 } }, now + 200)

  describe("number of snapshots", function() {

    it("should not interpolate having only one snapshot", function() {

      let t = createTimeline()
      t.takeSnapshot({ entities : { "one": 10 } })

      assert.equal( t.at( 0 ).entities.one, 10 )
      assert.equal( t.at( 100 ).entities.one, 10 )

    })

    it("should interpolate having only two snapshots", function() {

      let time = Date.now()
      let t = createTimeline()

      t.takeSnapshot({ entities : { "one": 10 } })

      // fake 100ms later
      t.takeSnapshot({ entities : { "one": 5 } }, time + 100)

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
