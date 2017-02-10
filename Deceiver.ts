import * as _ from 'lodash';


export interface Constructor<T> {
    new (...args: any[]): T; // tslint:disable-line:no-any
}

export interface RealDeceiverFactory {
    <T>(mirror: DeceiverMirror<T>): T;
}

export class DeceiverMirror<T> {
    constructor (private klass: Constructor<T>) {
    }

    public getClassName (): string {
        return this.klass.prototype.constructor.name;
    }

    public getClass (): Constructor<T> {
        return this.klass;
    }

    public getMethodNames (): string[] {
        return _(this.getAllPrototypes())
            .flatMap(Object.getOwnPropertyNames)
            .filter(name => typeof this.klass.prototype[name] == 'function')
            .filter(name => name != 'constructor')
            .reduce(
                (output: string[], item: string) => {
                    return output.some((comparedItem) => item == comparedItem)
                        ? output
                        : output.concat([item]);
                },
                [],
            );
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
}

export class DeceiverFactory {
    constructor (private realDeceiverFactory: RealDeceiverFactory) {}

    public getDeceiver<T>(klass: Constructor<T>): T {
        return this.realDeceiverFactory<T>(new DeceiverMirror(klass));
    }
}
