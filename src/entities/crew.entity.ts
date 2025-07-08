import Crew from "./crew";

export default class CrewEntity implements Crew {
    id: string;
    name: string;
    globalName: string;

    constructor(id: string, name: string, globalName: string) {
        this.id = id;
        this.name = name;
        this.globalName = globalName;
    }
}
