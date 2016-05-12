"use strict";

const Proxy = require('harmony-proxy')

const createProxy = function ( state, previousState, multiplier ) {

  return new Proxy( state, createHandler( previousState, multiplier ) )

}

const createHandler = function ( previousState, multiplier ) {

  return {

    get ( state, property ) {

      let currentValue = state[ property ]
      let previousValue = previousState[ property ]

      if ( typeof( currentValue ) === "undefined" ) {
        currentValue = previousValue
      }

      if ( typeof( previousValue ) === "undefined" ) {
        previousValue = currentValue
      }

      if ( typeof( currentValue ) === "number" && typeof( previousValue ) === "number" ) {

        let result = currentValue + ( previousValue - currentValue ) * multiplier

        return Number.isNaN( result ) ? null : result

      } else if ( currentValue === null ) {

        return null

      } else if ( typeof( currentValue ) === "object" ) {

        return createProxy( currentValue, previousValue, multiplier )

      } else {

        return currentValue

      }

    }

  }

}

module.exports.createProxy = createProxy
