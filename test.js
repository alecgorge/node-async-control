var control = require('./async-control'),
	Queue	= control.Queue;

function async(text, cb) {
	setTimeout(function () {
		console.log("Text: '"+text+"' 1 second later");
		cb();
	}, 1000);
}

function async2(text, cb) {
	setTimeout(function () {
		console.log("Text: '"+text+"' 2 seconds later");
		cb();
	}, 2000);
}

function inst(line, cb) {
	console.log(line+"!");
	cb();
}

var queue = new Queue();

queue
	.together([ // all of these are executed at the same time
		async,	// it is assumed that these functions do not return any values.
		inst,
		async2
	], [ // these are the corresponding arguments to the functions
		["ohi", queue.next], // you need to ALLWAYS pass queue.next as the callback to any function
		["line", queue.next],
		["ohi2", queue.next]
	])
	.after([ // "blocking", each are executed in order
		async2,
		inst
	], [
		["ohi3", queue.next],
		["line2", queue.next]
	])
	.together([ // these won't start until the .after line is finished.
		async,
		inst,
		async2
	], [ // these are the corresponding arguments to the functions
		["ohi3", queue.next(function () { // if you want to execute your own callback also, do it like this
			console.log("custom callback!");
		})],
		["line3", queue.next],
		["ohi4", function () { // you can also execute your own callback like this. this exactly the same as above.
			console.log("custom callback!");
			queue.next();
		}]
	])
	.start(function () { // this callback (or array of callbacks) is called once EVERYTHING is done.
		console.log("all done!");
	});