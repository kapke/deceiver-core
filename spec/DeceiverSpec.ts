// tslint:disable:no-empty no-stateless-class
import { Constructor, Deceiver, DeceiverFactory, DeceiverMirror, RealDeceiverFactory } from '../Deceiver';

function expectContainingAll<T>(actual: T[], expected: T[]): void {
    const result = expected.every((item) => actual.includes(item));

    expect(result).toBe(true, `Expected [${actual}] to contain every element of [${expected}]`);
}

describe('DeceiverMirror', () => {
    it('is initializable', () => {
        class TestClass {}

        expect(new DeceiverMirror(TestClass)).toEqual(jasmine.any(DeceiverMirror));
    });

    it('should return passed class name', () => {
        class TestClass {}
        const mirror = new DeceiverMirror(TestClass);

        expect(mirror.getClassName()).toBe('TestClass');
    });

    it('should return original class', () => {
        class TestClass {}
        const mirror = new DeceiverMirror(TestClass);

        expect(mirror.getClass()).toBe(TestClass);
    });

    describe('producing list of properties', () => {
        it('should return list of attached getters', () => {
            class TestClass {
                get foo () {return 'foo'; }
                get bar () {return 'bar'; }
            }

            const mirror = new DeceiverMirror(TestClass);

            expect(mirror.getPropertyNames()).toEqual(['foo', 'bar']);
        });

        it('should return list of parent classes getters', () => {
            class Parent {
                get foo () {return 'foo'; }
                get bar () {return 'bar'; }
            }
            class TestClass extends Parent {}

            const mirror = new DeceiverMirror(TestClass);

            expect(mirror.getPropertyNames()).toEqual(['foo', 'bar']);
        });
    });



    describe('producing list of class methods', () => {
        const objectPrototypeMethods = ['hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];
        Object.freeze(objectPrototypeMethods);

        it('should attach given class methods', () => {
            class TestClass {
                public method1 () {}
                public method2 () {}
            }

            const mirror = new DeceiverMirror(TestClass);

            expectContainingAll(mirror.getMethodNames(), ['method1', 'method2']);
        });

        it('should attach Object.prototype methods', () => {
            class TestClass {
            }

            const mirror = new DeceiverMirror(TestClass);

            expectContainingAll(mirror.getMethodNames(), objectPrototypeMethods);
        });

        it('should attach base class methods', () => {
            class BaseTestClass {
                public method1 () {}
                public method2 () {}
            }

            class TestClass extends BaseTestClass {
                public method3 () {}
                public method4 () {}
            }

            const mirror = new DeceiverMirror(TestClass);

            expectContainingAll(mirror.getMethodNames(), ['method1', 'method2', 'method3', 'method4']);
        });

        it('should attach base class methods of all levels', () => {
            class BaseTestClass1 { public method1 () {}}
            class BaseTestClass2 extends BaseTestClass1 { public method2 () {}}
            class BaseTestClass3 extends BaseTestClass2 { public method3 () {}}
            class BaseTestClass4 extends BaseTestClass3 { public method4 () {}}
            class BaseTestClass5 extends BaseTestClass4 { public method5 () {}}
            class BaseTestClass6 extends BaseTestClass5 { public method6 () {}}
            class BaseTestClass7 extends BaseTestClass6 { public method7 () {}}
            class BaseTestClass8 extends BaseTestClass7 { public method8 () {}}
            class BaseTestClass9 extends BaseTestClass8 { public method9 () {}}
            class BaseTestClass10 extends BaseTestClass9 { public method10 () {}}
            class BaseTestClass11 extends BaseTestClass10 { public method11 () {}}
            class TestClass extends BaseTestClass11 {}

            const mirror = new DeceiverMirror(TestClass);

            expectContainingAll(mirror.getMethodNames(), ['method1', 'method2', 'method3', 'method4', 'method5', 'method6', 'method7', 'method8', 'method9', 'method10', 'method11']); // tslint:disable-line:max-line-length
        });

        it('should return a method using its name', () => {
            class TestClass {
                public bar () {}
            }

            const mirror = new DeceiverMirror(TestClass);

            expect(mirror.getMethod('bar')).toBe(TestClass.prototype.bar);
        });

        it('should filter out getters and setters without accessing them', () => {
            class TestClass {
                public get foo () {throw new Error('Foo'); }
                public set bar (value: string) {throw new Error('bar' + value); }
                public method1 () {}
                public method2 () {}
            }

            const mirror = new DeceiverMirror(TestClass);

            expectContainingAll(mirror.getMethodNames(), ['method1', 'method2']);
        });
    });
});

describe('DeceiverFactory', () => {
    it('should create spies/mocks using given backend', () => {
        class TestClass {}

        let calls: number = 0;
        let passedKlass: any;
        let passedMirror: any;

        function spiedFactory<T> (mirror: DeceiverMirror<T, keyof T>): T {
            const a: any = null;
            calls += 1;
            passedMirror = mirror;
            return a as T;
        }
        const deceiverFactory = new DeceiverFactory(spiedFactory as RealDeceiverFactory);

        const mirror = deceiverFactory.getDeceiver(TestClass);

        expect(calls).toBe(1);
        expect(passedMirror.getClass()).toBe(TestClass);
        expect(passedMirror).toEqual(jasmine.any(DeceiverMirror));
    });
});

describe('Deceiver', () => {
    it('should return an object with the same methods as given class has', () => {
        class A {
            public foo () {}
        }

        const aDeceiver: A = Deceiver(A);

        expect(aDeceiver.foo).toEqual(jasmine.any(Function));
    });

    it('should work even for classes with fields', () => {
        class Foo {}
        class Bar {}

        class B {
            constructor (private bar: Bar) {}

            public abc () {}
        }

        class A extends B {
            constructor (private foo: Foo, bar: Bar) {
                super(bar);
            }

            public cde () {}
        }

        const aDeceiver: A = Deceiver(A);

        expect(aDeceiver.abc).toEqual(jasmine.any(Function));
        expect(aDeceiver.cde).toEqual(jasmine.any(Function));
    });

    it('should preserve function arity', () => {
        class A {
            public nullary () {}
            public unary (_arg1: string) {}
            public binary (_arg1: string, _arg2: string) {}
            public ternary (_arg1: string, _arg2: string, _arg3: string) {}
            public quaternary (_arg1: string, _arg2: string, _arg3: string, _arg4: string) {}
            public quinary (_arg1: string, _arg2: string, _arg3: string, _arg4: string, _arg5: string) {}
            public senary (_arg1: string, _arg2: string, _arg3: string, _arg4: string, _arg5: string, _arg6: string) {}
        }

        const aDeceiver: A = Deceiver(A);

        expect(aDeceiver.nullary.length).toBe(0);
        expect(aDeceiver.unary.length).toBe(1);
        expect(aDeceiver.binary.length).toBe(2);
        expect(aDeceiver.ternary.length).toBe(3);
        expect(aDeceiver.quaternary.length).toBe(4);
        expect(aDeceiver.quinary.length).toBe(5);
        expect(aDeceiver.senary.length).toBe(6);
    });

    it('should allow to pass arbitrary object with data which gets mixed into result', () => {
        class A {
            public foo: string;
            public bar: number;
            public baz: boolean;
            public biz: {};

            public abc (): string { return ""; }
            public cde (): string { return ""; }
        }

        const aDeceiver = Deceiver(A, {
            foo: 'foo',
            abc (): string { return 'abc' },
        });

        expect(aDeceiver.foo).toBe('foo');
        expect(aDeceiver.abc()).toBe('abc');
    });

    it('should add found properties to result object', () => {
        class A {
            public get foo () {return 'foo'; }
        }

        const aDeceiver = Deceiver(A);

        expect(Object.prototype.hasOwnProperty.call(aDeceiver, 'foo')).toBe(true);
    });
});
