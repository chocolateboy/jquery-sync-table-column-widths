/// <reference types="node" />

declare module 'little-emitter' {
    class Emitter extends NodeJS.EventEmitter { }
    export = Emitter;
}
