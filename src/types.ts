export interface Constructor<T> {
    new (...args: any[]): T; // tslint:disable-line:no-any
}
