import { config } from "./config.ts";

// verify webhook signature is valid
// using x-hub-signature-256 header
// https://docs.github.com/ja/webhooks-and-events/webhooks/securing-your-webhooks
export async function verifySignature(req: Request, body: string) {
    const signature = req.headers.get("x-hub-signature-256");
    if (!signature) {
        throw new Error("signature is not found");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(body);
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(config.WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        true,
        ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const expectedSignature = `sha256=${signatureHex}`;

    return signature === expectedSignature;
}

export function isType<T>(value: unknown): value is T {
    if (typeof value !== "object" || value === null) {
        throw new Error("value is not object");
    }

    try {
        // do something to check type.
        // currently, I don't know how to do it.
    } catch (error) {
        console.error(error);
        return false;
    }

    return true;
}
