// tslint:disable:no-empty no-stateless-class
import { Constructor, DeceiverMirror, DeceiverFactory, RealDeceiverFactory } from '../Deceiver';

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
    });
});

describe('DeceiverFactory', () => {
    it('should create spies/mocks using given backend', () => {
        class TestClass {}

        let calls: number = 0;
        let passedKlass: any;
        let passedMirror: any;

        function spiedFactory<T> (mirror: DeceiverMirror<T>): T {
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
