"use strict";

const Proxy = require('harmony-proxy')
const createProxy = require('./proxy.js').createProxy

const MAX_HISTORY_SNAPSHOTS = 10

class History {

  constructor ( maxSnapshots ) {

    if ( !maxSnapshots ) {
      maxSnapshots = MAX_HISTORY_SNAPSHOTS
    }

    this.currentTime = null

    this.elapsedTime = 0

    this.lastSnapshotTime = -1

    this.history = []

    this.maxSnapshots = maxSnapshots

  }

  takeSnapshot ( state, now ) {

    if ( !now ) {
      now = Date.now()
    }

    if ( !this.currentTime ) {
      this.currentTime = Date.now()
    }

    let end = now - this.currentTime

    //
    // history timeframe:
    //
    // { "start": 0, "end": 1000, "data": {} }
    //
    this.history.push( {
      start: this.lastSnapshotTime,
      end: end,
      data: JSON.stringify( state )
    } )

    // drop older history
    if ( this.history.length > this.maxSnapshots ) {
      this.history.unshift()
    }

    this.lastSnapshotTime = end

  }

  /**
   * Get snapshot taken at `elapsedTime` interval.
   */
  at ( elapsedTimeAt, interpolate ) {

    if ( typeof( interpolate ) === "undefined" ) {
      interpolate = true
    }

    let i = this.history.length
    let lesserDistance = Infinity
    let lesserDistanceIndex = 0

    while ( i-- ) {

      let frame = this.history[ i ]
      let duration = ( ( frame.end - frame.start ) / 2 ) - 1 // -1 is to prevent equal comparations

      let startDistance = Math.sqrt( Math.pow( elapsedTimeAt - frame.end - duration, 2 ))
      let endDistance = Math.sqrt( Math.pow( elapsedTimeAt - frame.end + duration, 2 ))

      if ( startDistance < lesserDistance || endDistance < lesserDistance || elapsedTimeAt === frame.end ) {
        lesserDistance = Math.min( startDistance, endDistance )
        lesserDistanceIndex = i
      }

    }

    let frame = this.history[ lesserDistanceIndex ]
    let data = JSON.parse( frame.data )

    //
    // traverse all properties to interpolate / extrapolate numbers
    //
    if ( interpolate && elapsedTimeAt !== frame.end ) {

      let previousState = this.at( frame.start, false )
      let multiplier = 1

      if ( elapsedTimeAt > frame.end ) {

        //
        // extrapolation multiplier
        //
        // TODO: a better extrapolation method is needed.
        // needs to consider all previous states to evaluate a consistent next possible value
        //
        multiplier = - ( elapsedTimeAt - frame.end ) / ( frame.end - frame.start )

      } else {

        multiplier = ( elapsedTimeAt - frame.start ) / ( frame.end - frame.start )

      }

      return createProxy( data, previousState, multiplier )

      //
      // It may be a good idea to traverse everything at once instead of
      // lazy-evaluating through proxies
      //
      // this.traverseInterpolate( data, // previousState, multiplier )
      //

    }

    return data

  }

  // traverseInterpolate ( state, previousState, multiplier ) {
  //
  //   for ( let prop in state  ) {
  //
  //     let propType = typeof( state[ prop ] )
  //
  //     if ( propType === "number" ) {
  //
  //       state[ prop ] = state[prop] + ( previousState[ prop ] - state[ prop ] ) * multiplier
  //
  //     } else if ( propType === "object" || propType === "array" ) {
  //
  //       this.traverseInterpolate( state[ prop ], previousState[ prop ], multiplier )
  //
  //     }
  //
  //   }
  //
  // }

}


module.exports = History
