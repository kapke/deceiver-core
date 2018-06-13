// tslint:disable:no-empty no-unnecessary-class
import { DeceiverFactory } from '../DeceiverFactory'
import { DeceiverMirror } from '../DeceiverMirror'
import { deceiverMirrorFactory, DeceiverMirrorFactory } from '../DeceiverMirrorFactory'

describe('DeceiverFactory', () => {
    let mirrorFactory: DeceiverMirrorFactory
    let deceiverFactory: DeceiverFactory

    beforeEach(() => {
        mirrorFactory = jasmine.createSpy('mirror factory', deceiverMirrorFactory).and.callThrough()
        deceiverFactory = new DeceiverFactory(mirrorFactory)
    })

    it('should use given factory to obtain mirrors', () => {
        class A {
            public foo() {}
            public bar() {}
            public baz() {}
        }
        const spiedMirror = new DeceiverMirror(A)
        ;(mirrorFactory as jasmine.Spy).and.returnValue(spiedMirror)
        spyOn(spiedMirror, 'getMethodNames').and.returnValue(['foo', 'bar'])

        const deceiver = deceiverFactory.getDeceiver(A)

        expect(spiedMirror.getMethodNames).toHaveBeenCalled()
        expect(deceiver.foo).toEqual(jasmine.any(Function))
        expect(deceiver.bar).toEqual(jasmine.any(Function))
        expect(deceiver.baz).not.toBeDefined()
    })

    it('should return an object with the same methods as given class has', () => {
        class A {
            public foo() {}
        }

        const aDeceiver: A = deceiverFactory.getDeceiver(A)

        expect(aDeceiver.foo).toEqual(jasmine.any(Function))
    })

    it('should work even for classes with fields', () => {
        class Foo {}
        class Bar {}

        class B {
            constructor(private bar: Bar) {}

            public abc() {}
        }

        class A extends B {
            constructor(private foo: Foo, bar: Bar) {
                super(bar)
            }

            public cde() {}
        }

        const aDeceiver: A = deceiverFactory.getDeceiver(A)

        expect(aDeceiver.abc).toEqual(jasmine.any(Function))
        expect(aDeceiver.cde).toEqual(jasmine.any(Function))
    })

    it('should preserve function arity', () => {
        class A {
            public nullary() {}
            public unary(_arg1: string) {}
            public binary(_arg1: string, _arg2: string) {}
            public ternary(_arg1: string, _arg2: string, _arg3: string) {}
            public quaternary(_arg1: string, _arg2: string, _arg3: string, _arg4: string) {}
            public quinary(
                _arg1: string,
                _arg2: string,
                _arg3: string,
                _arg4: string,
                _arg5: string,
            ) {}
            public senary(
                _arg1: string,
                _arg2: string,
                _arg3: string,
                _arg4: string,
                _arg5: string,
                _arg6: string,
            ) {}
        }

        const aDeceiver: A = deceiverFactory.getDeceiver(A)

        expect(aDeceiver.nullary.length).toBe(0)
        expect(aDeceiver.unary.length).toBe(1)
        expect(aDeceiver.binary.length).toBe(2)
        expect(aDeceiver.ternary.length).toBe(3)
        expect(aDeceiver.quaternary.length).toBe(4)
        expect(aDeceiver.quinary.length).toBe(5)
        expect(aDeceiver.senary.length).toBe(6)
    })

    it('should allow to pass arbitrary object with data which gets mixed into result', () => {
        class A {
            public foo!: string
            public bar!: number
            public baz!: boolean
            public biz!: {}

            public abc(): string {
                return ''
            }
            public cde(): string {
                return ''
            }
        }

        const aDeceiver = deceiverFactory.getDeceiver(A, {
            foo: 'foo',
            abc(): string {
                return 'abc'
            },
        })

        expect(aDeceiver.foo).toBe('foo')
        expect(aDeceiver.abc()).toBe('abc')
    })

    it('should add found properties to result object', () => {
        class A {
            public get foo() {
                return 'foo'
            }
        }

        const aDeceiver = deceiverFactory.getDeceiver(A)

        expect(Object.prototype.hasOwnProperty.call(aDeceiver, 'foo')).toBe(true)
    })
})
