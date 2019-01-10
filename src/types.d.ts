// TODO add to little-emitter
declare module 'little-emitter' {
    type Listener = (...args: Array<any>) => void;

    interface Emitter {
        addEventListener(event: string | symbol, listener: Listener): this;
        on(event: string | symbol, listener: Listener): this;

        emit(event: string | symbol, ...args: Array<any>): boolean;
        trigger(event: string | symbol, ...args: Array<any>): boolean;

        getListeners(event?: string | symbol): Array<Listener>;
        listeners(event?: string | symbol): Array<Listener>;

        off(event?: string | symbol, listener?: Listener): this;
        removeEventListener(event?: string | symbol, listener?: Listener): this;
        removeEventListeners(event?: string | symbol, listener?: Listener): this;

        once(event: string | symbol, listener: Listener): this;
        one(event: string | symbol, listener: Listener): this;
    }

    interface EmitterStatic {
        <T extends Object>(target: T): T & Emitter;
        new(): Emitter;
    }

    const Emitter: EmitterStatic;

    export = Emitter;
}
