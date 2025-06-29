// globals.d.ts
import { parse } from "path";
import type { This } from "../../types/this.js";
import type { Next } from "./types/parameter.ts";

declare global {
    var OK: undefined;
    var DENY: undefined;

    // function, variables & objects which can be exported
    interface Exports {
        // Hooks

        // RCPT_TO hooks
        hook_rcpt: (this: This, next: Next, connection: any) => void;

        // DATA hooks
        hook_data: (this: This, next: Next, connection: any) => void;
        hook_data_post: (this: This, next: Next, connection: any) => void;

        // QUEUE hooks
        hook_queue: (this: This, next: Next, connection: any) => void

        // plugin configuration
        plugin: {
            /**Name of this plugin. */
            name: string;
        };
    }

    var exports: Exports;
}

