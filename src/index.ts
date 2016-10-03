import { Timeline } from "./Timeline";

export function createTimeline ( maxSnapshots: number = 10 ): Timeline {

  return new Timeline( maxSnapshots );

}
