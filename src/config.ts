import "https://deno.land/std@0.198.0/dotenv/load.ts";

const configKeys = {
    WEBHOOK_SECRET: Deno.env.get("WEBHOOK_SECRET"),
    APP_ID: Deno.env.get("APP_ID"),
    PRIVATE_KEY: Deno.env.get("PRIVATE_KEY"),
};

(Object.keys(configKeys) as (keyof typeof configKeys)[]).forEach((key) => {
    if (configKeys[key] === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
});

export const config = Object.freeze(configKeys) as {
    readonly [K in keyof typeof configKeys]: NonNullable<
        (typeof configKeys)[K]
    >;
};
