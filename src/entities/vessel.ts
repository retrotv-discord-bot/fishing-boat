export default interface Vessel {
    id: string;
    name: string;
    channelId: string;
    capacity: number;
    description: string;
    createdAt?: Date;
    canMidParticipation: string;
}
