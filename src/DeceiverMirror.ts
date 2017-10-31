import * as _ from 'lodash'

import { Constructor } from './types'

interface Filterer<T> {
    (arg: T): boolean
}

export class DeceiverMirror<T, K extends keyof T> {
    constructor(private klass: Constructor<T>) {}

    public getClassName(): string {
        return this.klass.prototype.constructor.name
    }

    public getClass(): Constructor<T> {
        return this.klass
    }

    public getMethod(name: K): T[K] {
        return this.klass.prototype[name]
    }

    public getMethodNames = _.memoize((): K[] =>
        this.getAllMembers(
            descriptor => typeof descriptor.value == 'function',
            name => name != 'constructor',
        ),
    )

    public getPropertyNames = _.memoize((): K[] =>
        this.getAllMembers(descriptor => !!descriptor.get, name => name != '__proto__'),
    )

    private getAllMembers(
        descriptorFilterer: Filterer<PropertyDescriptor>,
        nameFilterer: Filterer<K>,
    ): K[] {
        return _.chain(this.getAllPrototypes())
            .map(prototype => ({ prototype, names: Object.getOwnPropertyNames(prototype) }))
            .map(({ prototype, names }) => ({
                prototype,
                names: names.filter(name =>
                    descriptorFilterer(Object.getOwnPropertyDescriptor(prototype, name)),
                ),
            }))
            .flatMap(({ names }) => names)
            .filter(nameFilterer)
            .reduce(this.toUniqueArray, [])
            .value()
    }

    private getAllPrototypes(prototype = this.klass.prototype): Object[] {
        if (prototype == null) {
            return []
        }

        return [prototype, ...this.getAllPrototypes(this.getParentPrototype(prototype))]
    }

    // tslint:disable-next-line:no-any
    private getParentPrototype(prototype: any): Object {
        return prototype.__proto__
    }

    private toUniqueArray(output: K[], item: K): K[] {
        return output.some(comparedItem => item == comparedItem) ? output : output.concat([item])
    }
}
