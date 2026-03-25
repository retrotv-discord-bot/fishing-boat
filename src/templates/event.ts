export default class Event {
    name: string;
    once: boolean;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: (...args: any) => Promise<void> | void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(object: { name: string; once?: boolean; execute: (...args: any) => Promise<void> | void }) {
        this.name = object.name;
        this.once = object.once ?? false;
        this.execute = object.execute;
    }
}
