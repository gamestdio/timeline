import * as Proxy from "harmony-proxy";

export function createProxy ( state, previousState, multiplier ): any {
  return new Proxy( state, createHandler( previousState, multiplier ) );
}

function createHandler ( previousState, multiplier ) {
  return {
    get ( state, property ) {
      let currentValue = state[ property ]
      let previousValue = previousState[ property ]

      if ( currentValue === undefined ) {
        currentValue = previousValue
      }

      if ( previousValue === undefined ) {
        previousValue = currentValue
      }

      if ( typeof( currentValue ) === "number" && typeof( previousValue ) === "number" ) {
        let result = currentValue + ( previousValue - currentValue ) * multiplier
        return isNaN( result ) ? null : result

      } else if ( currentValue === null ) {
        return null

      } else if ( typeof( currentValue ) === "object" ) {
        return createProxy( currentValue, previousValue, multiplier )

      } else {
        return currentValue
      }
    }
  };
}
