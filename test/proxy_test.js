"use strict";

var assert = require('assert')
  , createProxy = require('../lib/proxy.js').createProxy

describe('Timeline: interpolation/extrapolation proxy', function() {

  it("should access top level properties", function() {

    let state = { one: 10, two: 20, newAttribute: 10 }
    let previousState = { one: 0, two: 30, oldAttribute: 10 }
    let proxy = createProxy( state, previousState, 0.5 )

    assert.equal( proxy.one, 5 )
    assert.equal( proxy.two, 25 )
    assert.equal( proxy.newAttribute, 10 )
    assert.equal( proxy.oldAttribute, 10 )
    assert.equal( proxy.undefinedAttribute, undefined )

  })

  it("should return a valid value when not a number", function() {

    let state = { one: "current state, one", two: null }
    let previousState = { one: "previous state, one", two: "previous state, two" }
    let proxy = createProxy( state, previousState, 0.5 )

    assert.equal( proxy.one, "current state, one" )
    assert.equal( proxy.two, null )

  })

  it("should access deeper properties", function() {

    let state = {
      one: { value: 10 },
      two: { value: 20 },
      newAttribute: { value: 100 }
    }

    let previousState = {
      one: { value: 0 },
      two: { value: 30 },
      oldAttribute: { value: 100 }
    }

    let proxy = createProxy( state, previousState, 0.5 )

    assert.equal( proxy.one.value, 5 )
    assert.equal( proxy.two.value, 25 )

    assert.equal( proxy.newAttribute.value, 100 )
    assert.equal( proxy.oldAttribute.value, 100 )
    assert.equal( proxy.undefinedAttribute, undefined )

  })

});
