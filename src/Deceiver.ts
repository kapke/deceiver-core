import { DeceiverFactory } from './DeceiverFactory';
import { deceiverMirrorFactory } from './DeceiverMirrorFactory';
import { Constructor } from './types';

const factory = new DeceiverFactory(deceiverMirrorFactory);

// tslint:disable-next-line:variable-name
export const Deceiver = <T, K extends keyof T> (klass: Constructor<T>, mixin?: Partial<T>): T => factory.getDeceiver(klass, mixin);

