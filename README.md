# Deceiver

It's a simple library to create fake objects of exactly the same shape as passed class. It's designed to work with ES2015+ classes and their transpiled counterparts. It works well with TypeScript (since itself is written in TypeScript) and it's usability is proven in real-world projects.

## Usage

```js
import { Deceiver } from 'deceiver-core';

class Foo {
    get foo () {return 'foo'; }

    aMethod () {}
}

const fooDeceiver = Deceiver(Foo);

Object.prototype.hasOwnProperty.call(fooDeceiver, 'foo') //true
fooDeceiver.aMethod() //undefined

const fooDeceiverWithMixin = Deceiver(Foo, {
    foo: 'bar',
    aMethod () {
        return 'Hello!';
    },
});
fooDeceiverWithMixin.foo //'bar'
fooDeceiverWithMixin.aMethod //'Hello!'
```