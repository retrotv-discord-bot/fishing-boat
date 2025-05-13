import { PrismaClient } from "@prisma/client";
import prisma from "../config/datasource";

export default class UserService {
    private readonly client: PrismaClient;

    public constructor() {
        this.client = prisma;
    }

    public async saveUser(username: string) {
        await this.client.user.create({
            data: {
                id: undefined,
                username: username,
            },
        });
    }
}
