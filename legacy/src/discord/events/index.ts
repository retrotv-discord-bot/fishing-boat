import type Event from "../../types/event";

import clientReady from "./client/ready";
import guildCreate from "./guild/create";
import interactionCreate from "./interaction/create";

export const events: Event[] = [clientReady, guildCreate, interactionCreate];
