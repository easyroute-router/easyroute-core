declare type ObservableListener<T> = (value: T) => void;
export default class Observable<T> {
    private value;
    private _subscribersQueue;
    constructor(value: T);
    get getValue(): T;
    subscribe(listener: ObservableListener<T>): () => void;
    setValue(newValue: T): void;
}
export {};
