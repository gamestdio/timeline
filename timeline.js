"use strict";

const Proxy = require('harmony-proxy')
const createProxy = require('./proxy.js').createProxy

const MAX_SNAPSHOTS = 10

class Timeline {

  constructor ( maxSnapshots ) {

    if ( !maxSnapshots ) {
      maxSnapshots = MAX_SNAPSHOTS
    }

    this.startTime = null

    this.lastSnapshotTime = -1

    this.history = []

    this.maxSnapshots = maxSnapshots

  }

  takeSnapshot ( state, elapsedTime ) {

    if ( !this.startTime ) {
      this.startTime = Date.now()
    }

    let now = ( !elapsedTime ) ? Date.now() : this.startTime + elapsedTime

    let end = now - this.startTime

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
      this.history.shift()
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


module.exports = Timeline
