import Elysia from "elysia";

export const members = new Elysia({
    name: "members",
    prefix: "/members",
    detail: {
        description: "Endpoints related to member management."
    }
}).get("/invitation", async () => {
    return "You are invited to join!"
})