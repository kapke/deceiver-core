import { DeceiverMirror } from './DeceiverMirror'
import { deceiverMirrorFactory, DeceiverMirrorFactory } from './DeceiverMirrorFactory'
import { Constructor } from './types'

export class DeceiverFactory {
    constructor(private mirrorFactory: DeceiverMirrorFactory) {}

    public getDeceiver<T, K extends keyof T>(klass: Constructor<T>, mixin: Partial<T> = {}): T {
        const mirror = this.mirrorFactory(klass)

        const methodsPart = mirror
            .getMethodNames()
            .map((name: K) => [name, mirror.getMethod(name)])
            .reduce(
                (acc: T, [name, method]: [K, T[K]]) => {
                    acc[name] = this.getFakeFunc(method)

                    return acc
                },
                {} as T,
            )

        const propertiesPart = mirror
            .getPropertyNames()
            .reduce((result, name) => ({ ...result, [name]: undefined }), {})

        return Object.assign(methodsPart, propertiesPart, mixin)
    }

    // A little hack to make types happy
    // tslint:disable-next-line:no-any
    private getFakeFunc<T, K extends keyof T>(method: T[K]): any {
        if (method instanceof Function) {
            const args = Array(method.length)
                .fill(0)
                .map(i => `arg${i}`)
            return new Function(...args, 'return void 0;') // tslint:disable-line:no-function-constructor-with-string-args
        } else {
            return method
        }
    }
}
