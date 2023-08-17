import { serve } from "std/http/server.ts";
import { isType, verifySignature } from "./util.ts";
import type { RepositoryCreatedEvent } from "@octokit/webhooks-types";
import { App } from "octokit";
import { config } from "./config.ts";

serve(async (req: Request): Promise<Response> => {
    if (!req.body) {
        return new Response(null, { status: 404 });
    }

    // console.log("headers:", req.headers);

    const bodyString = new TextDecoder().decode(
        (await req.body?.getReader().read()).value
    );

    if (!(await verifySignature(req, bodyString))) {
        throw new Error("signature is invalid!");
    }

    const body = JSON.parse(bodyString);

    // isTypeがチェックをしてるふうに見せかけてなにもチェックしてない
    if (!isType<RepositoryCreatedEvent>(body)) {
        throw new Error("bodyJson is not RepositoryCreatedEvent");
    }

    // repositoryイベントかの判別をここでするべき

    // 本来isTypeで判別できてるべきだが動いてないので簡易的な判別
    // リポジトリの作成でなければ何もしない
    if (body.action !== "created") {
        console.log("action is not created. skip.");
        return new Response(null, { status: 200 });
    }

    const app = new App({
        appId: config.APP_ID,
        // base64 decode
        privateKey: atob(config.PRIVATE_KEY),
    });
    // appをconsole.logをするとerrorになるので見てはいけない
    // console.log(app);

    if (body.installation?.id === undefined) {
        throw new Error("installation.id is undefined");
    }
    const octokit = await app.getInstallationOctokit(body.installation.id);
    // octokitも同様に見てはいけない
    // console.log(octokit);

    if (body.organization?.login === undefined) {
        throw new Error("organization.login is undefined");
    }

    const result = await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
        org: body.organization.login,
        team_slug: "sample-team",
        owner: body.repository.owner.login,
        repo: body.repository.name,
        // write のことです
        permission: "push",
    });

    if (result.status !== 204) {
        throw new Error("addOrUpdateRepoPermissionsInOrg failed!");
    }

    console.log("successfully added team permission!");
    return new Response(null, { status: 204 });
});
