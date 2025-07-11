import Elysia from "elysia";
import { inboundSmtp } from "./inbound";

const app = new Elysia().use(inboundSmtp).use().listen(4001);
