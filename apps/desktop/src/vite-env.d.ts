/// <reference types="vite/client" />

interface ElectronAPI {
    send: (channel: string, data: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
}

interface Window {
    electron: ElectronAPI;
}
