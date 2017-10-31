// tslint:disable:no-empty no-stateless-class
import { DeceiverMirror } from '../DeceiverMirror'

function expectContainingAll<T>(actual: T[], expected: T[]): void {
    const result = expected.every(item => actual.includes(item))

    expect(result).toBe(true)
}

describe('DeceiverMirror', () => {
    it('is initializable', () => {
        class TestClass {}

        expect(new DeceiverMirror(TestClass)).toEqual(jasmine.any(DeceiverMirror))
    })

    it('should return passed class name', () => {
        class TestClass {}
        const mirror = new DeceiverMirror(TestClass)

        expect(mirror.getClassName()).toBe('TestClass')
    })

    it('should return original class', () => {
        class TestClass {}
        const mirror = new DeceiverMirror(TestClass)

        expect(mirror.getClass()).toBe(TestClass)
    })

    describe('producing list of properties', () => {
        it('should return list of attached getters', () => {
            class TestClass {
                get foo() {
                    return 'foo'
                }
                get bar() {
                    return 'bar'
                }
            }

            const mirror = new DeceiverMirror(TestClass)

            expect(mirror.getPropertyNames()).toEqual(['foo', 'bar'])
        })

        it('should return list of parent classes getters', () => {
            class Parent {
                get foo() {
                    return 'foo'
                }
                get bar() {
                    return 'bar'
                }
            }
            class TestClass extends Parent {}

            const mirror = new DeceiverMirror(TestClass)

            expect(mirror.getPropertyNames()).toEqual(['foo', 'bar'])
        })
    })

    describe('producing list of class methods', () => {
        const objectPrototypeMethods = [
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toLocaleString',
            'toString',
            'valueOf',
        ]
        Object.freeze(objectPrototypeMethods)

        it('should attach given class methods', () => {
            class TestClass {
                public method1() {}
                public method2() {}
            }

            const mirror = new DeceiverMirror(TestClass)

            expectContainingAll(mirror.getMethodNames(), ['method1', 'method2'])
        })

        it('should attach Object.prototype methods', () => {
            class TestClass {}

            const mirror = new DeceiverMirror(TestClass)

            expectContainingAll(mirror.getMethodNames(), objectPrototypeMethods)
        })

        it('should attach base class methods', () => {
            class BaseTestClass {
                public method1() {}
                public method2() {}
            }

            class TestClass extends BaseTestClass {
                public method3() {}
                public method4() {}
            }

            const mirror = new DeceiverMirror(TestClass)

            expectContainingAll(mirror.getMethodNames(), [
                'method1',
                'method2',
                'method3',
                'method4',
            ])
        })

        it('should attach base class methods of all levels', () => {
            class BaseTestClass1 {
                public method1() {}
            }
            class BaseTestClass2 extends BaseTestClass1 {
                public method2() {}
            }
            class BaseTestClass3 extends BaseTestClass2 {
                public method3() {}
            }
            class BaseTestClass4 extends BaseTestClass3 {
                public method4() {}
            }
            class BaseTestClass5 extends BaseTestClass4 {
                public method5() {}
            }
            class BaseTestClass6 extends BaseTestClass5 {
                public method6() {}
            }
            class BaseTestClass7 extends BaseTestClass6 {
                public method7() {}
            }
            class BaseTestClass8 extends BaseTestClass7 {
                public method8() {}
            }
            class BaseTestClass9 extends BaseTestClass8 {
                public method9() {}
            }
            class BaseTestClass10 extends BaseTestClass9 {
                public method10() {}
            }
            class BaseTestClass11 extends BaseTestClass10 {
                public method11() {}
            }
            class TestClass extends BaseTestClass11 {}

            const mirror = new DeceiverMirror(TestClass)

            expectContainingAll(mirror.getMethodNames(), [
                'method1',
                'method2',
                'method3',
                'method4',
                'method5',
                'method6',
                'method7',
                'method8',
                'method9',
                'method10',
                'method11',
            ]) // tslint:disable-line:max-line-length
        })

        it('should return a method using its name', () => {
            class TestClass {
                public bar() {}
            }

            const mirror = new DeceiverMirror(TestClass)

            expect(mirror.getMethod('bar')).toBe(TestClass.prototype.bar)
        })

        it('should filter out getters and setters without accessing them', () => {
            class TestClass {
                public get foo() {
                    throw new Error('Foo')
                }
                public set bar(value: string) {
                    throw new Error('bar' + value)
                }
                public method1() {}
                public method2() {}
            }

            const mirror = new DeceiverMirror(TestClass)

            expectContainingAll(mirror.getMethodNames(), ['method1', 'method2'])
        })
    })

    describe('caching', () => {
        class TestClass {
            public get foo() {
                throw new Error('Foo')
            }
            public set bar(value: string) {
                throw new Error('bar' + value)
            }
            public method1() {}
            public method2() {}
        }

        let mirror: DeceiverMirror<TestClass, keyof TestClass>

        beforeEach(() => {
            mirror = new DeceiverMirror(TestClass)
        })

        it('should cache list of properties', () => {
            expect(mirror.getPropertyNames()).toBe(mirror.getPropertyNames())
        })

        it('should cache list of methods', () => {
            expect(mirror.getMethodNames()).toBe(mirror.getMethodNames())
        })
    })
})
