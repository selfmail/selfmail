import bearer from "@elysiajs/bearer";
import Elysia from "elysia";

export const smtp = new Elysia().use(bearer());
