// tslint:disable:no-empty no-stateless-class
import { Deceiver } from '../Deceiver';
import { DeceiverFactory } from '../DeceiverFactory';

describe('Deceiver', () => {
    class A {
        public foo: string;
    }

    beforeEach(() => {
        spyOn(DeceiverFactory.prototype, 'getDeceiver').and.callThrough();
    });

    it('should be a proxy to default DeceiverFactory instance', () => {
        const result = Deceiver(A);

        expect(DeceiverFactory.prototype.getDeceiver).toHaveBeenCalledWith(A, undefined);
        expect(result).toBe((DeceiverFactory.prototype.getDeceiver as jasmine.Spy).calls.mostRecent().returnValue);
    });

    it('should pass mixin to factory', () => {
        const mixin = {foo: 'bar'};
        const result = Deceiver(A, mixin);

        expect(DeceiverFactory.prototype.getDeceiver).toHaveBeenCalledWith(A, mixin);
        expect(result).toBe((DeceiverFactory.prototype.getDeceiver as jasmine.Spy).calls.mostRecent().returnValue);
    });
});
