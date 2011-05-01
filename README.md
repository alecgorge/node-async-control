#Gain control of asyncronous operation in Node.js

Node.js is great, but sometimes nested callbacks suck. Async-control fixes that problem.

It allows you to easily run several async function in parallel, then once they are all done run other functions. The API is entirely chainable so you can go on and on.

If you open `test.js`, you will see a complete example of how to use async-control.