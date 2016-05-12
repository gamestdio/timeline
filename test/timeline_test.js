"use strict";

var assert = require('assert')
  , createHistory = require('../index.js').createHistory

describe('History', function() {

  var now = Date.now()

  var history = createHistory()
  history.takeSnapshot({ entities : { "one": 10 } })

  // fake 100ms later
  history.takeSnapshot({ entities : { "one": 5 } }, now + 100)

  // fake 200ms later
  history.takeSnapshot({ entities : { "one": 0 } }, now + 200)

  describe("number of snapshots", function() {

    it("should not interpolate having only one snapshot", function() {

      let h = createHistory()
      h.takeSnapshot({ entities : { "one": 10 } })

      assert.equal( h.at( 0 ).entities.one, 10 )
      assert.equal( h.at( 100 ).entities.one, 10 )

    })

    it("should interpolate having only two snapshots", function() {

      let time = Date.now()
      let h = createHistory()

      h.takeSnapshot({ entities : { "one": 10 } })

      // fake 100ms later
      h.takeSnapshot({ entities : { "one": 5 } }, time + 100)

      assert.equal( h.at( 0 ).entities.one, 10 )
      assert.equal( h.at( 100 ).entities.one, 5 )
      assert.equal( h.at( 200 ).entities.one, 0 )

    })

  })

  describe("#at (without interpolation/extrapolation)", function() {

    it("should find closest snapshot by time distance", function() {

      assert.equal( history.at( 0, false ).entities.one, 10 )
      assert.equal( history.at( 25, false ).entities.one, 10 )
      assert.equal( history.at( 50, false ).entities.one, 5 )
      assert.equal( history.at( 80, false ).entities.one, 5 )

      assert.equal( history.at( 100, false ).entities.one, 5 )
      assert.equal( history.at( 140, false ).entities.one, 5 )

      assert.equal( history.at( 200, false ).entities.one, 0 )
      assert.equal( history.at( 210, false ).entities.one, 0 )
      assert.equal( history.at( 1000, false ).entities.one, 0 )

    })

  })

  describe("#at (with interpolation)", function() {

    it("no need to interpolate end of frames", function() {

      assert.equal( history.at( 0 ).entities.one , 10 )
      assert.equal( history.at( 100 ).entities.one , 5 )
      assert.equal( history.at( 200 ).entities.one , 0 )

    })

    it("should interpolate values between known snapshots", function() {

      assert.equal( history.at( 50 ).entities.one, 7.5 )
      assert.equal( history.at( 150 ).entities.one, 2.5 )

    })

    it("should extrapolate future time requests", function() {

      assert.equal( history.at( 300 ).entities.one, -5 )
      assert.equal( history.at( 400 ).entities.one, -10 )
      assert.equal( history.at( 500 ).entities.one, -15 )

    })

  })

});
