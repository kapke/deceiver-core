// tslint:disable:no-empty no-unnecessary-class
import { deceiverMirrorFactory } from '../DeceiverMirrorFactory'

describe('DeceiverMirrorFactory', () => {
    it('should cache mirrors for given classes', () => {
        class TestClass {}

        expect(deceiverMirrorFactory(TestClass)).toBe(deceiverMirrorFactory(TestClass))
    })
})
