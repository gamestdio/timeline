import { Timeline } from "./timeline";

export function createTimeline ( maxSnapshots: number = 10 ): Timeline {

  return new Timeline( maxSnapshots );

}
