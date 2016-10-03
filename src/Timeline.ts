"use strict";

import { createProxy } from "./Proxy";
import { clone } from "./clone";

export class Timeline {

    startTime: number = null;
    lastSnapshotTime: number = -1;
    history: any[] = [];
    maxSnapshots: number;

    constructor ( maxSnapshots: number = 10 ) {
        this.maxSnapshots = maxSnapshots
    }

    takeSnapshot ( state: any, elapsedTime: number ): void {
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
            data: clone( state )
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
    at ( elapsedTimeAt: number, interpolate: boolean = true ): any {
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
        let data = frame.data

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

    offset ( offset: number, interpolate: boolean = true ): any {

        return this.at( this.lastSnapshotTime + offset, interpolate );

    }

    // traverseInterpolate ( state, previousState, multiplier ) {
    //   for ( let prop in state  ) {
    //     let propType = typeof( state[ prop ] )
    //
    //     if ( propType === "number" ) {
    //       state[ prop ] = state[prop] + ( previousState[ prop ] - state[ prop ] ) * multiplier
    //
    //     } else if ( propType === "object" || propType === "array" ) {
    //       this.traverseInterpolate( state[ prop ], previousState[ prop ], multiplier )
    //
    //     }
    //
    //   }
    // }

}
