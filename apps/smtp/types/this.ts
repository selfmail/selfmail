import type { Hook } from "./hooks.js"


export type This = {
    /**Log a message into the console. */
    loginfo: (m: string) => void,
    logerror: (m: string) => void,
    /**
     * Register a new hook with a function which is called, when
     * the hook runs.
     * @param hook - Hook which is called 
     * @param fn - Function which should be run, when the hook is triggered
     */
    register_hook: (hook: Hook, fn: string) => void
}