import { Timeline } from "./timeline.js";

export function createTimeline ( maxSnapshots: number = 10 ): Timeline {

  return new Timeline( maxSnapshots );

}
