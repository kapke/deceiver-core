import * as _ from 'lodash'

import { DeceiverMirror } from './DeceiverMirror'
import { Constructor } from './types'

export type DeceiverMirrorFactory = <T>(klass: Constructor<T>) => DeceiverMirror<T, keyof T>

export const deceiverMirrorFactory: DeceiverMirrorFactory = _.memoize<DeceiverMirrorFactory>(
    <T>(klass: Constructor<T>) => new DeceiverMirror<T, keyof T>(klass),
)
