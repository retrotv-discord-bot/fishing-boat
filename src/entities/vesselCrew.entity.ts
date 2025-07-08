import VesselCrew from "./vesselCrew";

export default class VesselCrewEntity implements VesselCrew {
    vesselId: string;
    crewId: string;
    position: string;

    constructor(vesselId: string, crewId: string, position: string) {
        this.vesselId = vesselId;
        this.crewId = crewId;
        this.position = position;
    }
}
