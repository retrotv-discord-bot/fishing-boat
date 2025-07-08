import crypto from "crypto";

export function digestSha3512(data: string): string {
    const hash = crypto.createHash("sha3-512");
    hash.update(data);
    return hash.digest("hex");
}
