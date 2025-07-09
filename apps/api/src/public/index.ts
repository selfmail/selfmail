import bearer from "@elysiajs/bearer";
import Elysia from "elysia";

export const publicElysia = new Elysia().use(bearer());
