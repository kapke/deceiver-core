import * as _ from 'lodash';

import { Constructor } from './types';

export class DeceiverMirror<T, K extends keyof T> {
    public getMethodNames = _.memoize((): K[] => {
        return _(this.getAllPrototypes())
            .map(prototype => ({prototype, names: Object.getOwnPropertyNames(prototype)}))
            .map(({prototype, names}) => ({
                prototype,
                names: names.filter(name => typeof Object.getOwnPropertyDescriptor(prototype, name).value == 'function'),
            }))
            .flatMap(({names}) => names)
            .filter(name => name != 'constructor')
            .reduce(this.toUniqueArray, []);
    });

    public getPropertyNames = _.memoize((): K[] => {
        return _(this.getAllPrototypes())
            .map(prototype => ({prototype, names: Object.getOwnPropertyNames(prototype)}))
            .map(({prototype, names}) => ({
                prototype,
                names: names.filter(name => Object.getOwnPropertyDescriptor(prototype, name).get),
            }))
            .flatMap(({names}) => names)
            .filter(name => name !== '__proto__')
            .reduce(this.toUniqueArray, []);
    });

    constructor (private klass: Constructor<T>) {
    }

    public getClassName (): string {
        return this.klass.prototype.constructor.name;
    }

    public getClass (): Constructor<T> {
        return this.klass;
    }

    public getMethod (name: K): T[K] {
        return this.klass.prototype[name];
    }

    private getAllPrototypes (prototype = this.klass.prototype): Object[] {
        if (prototype == null) {
            return [];
        }

        return [prototype, ...this.getAllPrototypes(this.getParentPrototype(prototype))];
    }

    private getParentPrototype (prototype: any): Object { // tslint:disable-line:no-any
        return prototype.__proto__;
    }

    private toUniqueArray (output: K[], item: K): K[] {
        return output.some((comparedItem) => item == comparedItem)
            ? output
            : output.concat([item]);
    }
}
