
function queue () {
	this._stack = [];
	this._pos = 0;
	this._subpos = 0;
	this._final;
	this._waitingCount = 0;
	
	var that = this;
	
	this.runParallel = function (callbacks, args) {
		if(typeof callbacks == "function") {
			callbacks = [callbacks];
		}
		
		if(typeof args == "undefined") {
			args = [];
			callbacks.forEach(function (v,k) {
				args.push([that.next]);
			});
		}
	
		var indiv = [];
		callbacks.forEach(function (v,k) {
			indiv.push({
				callback: v,
				arguments: args[k]
			});
		});
		
		var previous = that._stack[that._stack.length-1];
		if(typeof previous == "object" && previous.type == "parallel") {
			previous.functions = previous.functions.concat(indiv);
		}
		else {
			that._stack.push({
				type: "parallel",
				functions: indiv
			});
		}
		
		return that;
	};
	this.together = this.runParallel;
	
	this.runSequence = function (callbacks, args) {
		if(typeof callbacks == "function") {
			callbacks = [callbacks];
		}
		
		if(typeof args == "undefined") {
			args = [];
			callbacks.forEach(function (v,k) {
				args.push([that.next]);
			});
		}
		
		var indiv = [];
		callbacks.forEach(function (v,k) {
			indiv.push({
				callback: v,
				arguments: args[k]
			});
		});
		
		var previous = that._stack[that._stack.length-1];
		if(typeof previous == "object" && previous.type == "squence") {
			previous.functions = previous.functions.concat(indiv);
		}
		else {
			that._stack.push({
				type: "sequence",
				functions: indiv
			});
		}
		
		return that;
	}
	this.after = this.runSequence;
	this.waitFor = this.runSequence;
	
	this.next = function (userCB) {
		if(typeof userCB == "function") {
			return function () {
				userCB.apply(null, arguments);
				inner();
			};
		}
		
		function inner () {
			that._subpos++;
			if(that._waitingCount > 0) {
				that._waitingCount--;
				if(that._waitingCount > 0) {
					return;
				}
			}
			
			if(that._subpos >= that._stack[that._pos].functions.length) {
				that._pos++;
				that._subpos = 0;
				
				if(that._pos >= that._stack.length) {
					that._final.forEach(function (v,k) {
						v.apply(null, []);
					});
					return;
				}
			}
			that._call();
		}
		inner();
		
		return that.next;
	};
	
	this._call = function () {
		var pos = that._pos;
		var subpos = that._subpos;
		var stack = that._stack;

		if(typeof stack[pos]== "object") {
			var bunch = stack[pos];
			if(bunch.type == "parallel") {
				that._waitingCount = bunch.functions.length;
				bunch.functions.forEach(function (v,k) {
					v.callback.apply(null, v.arguments);
				});
			}
			else if(bunch.type == "sequence") {
				var indiv = stack[pos].functions[subpos];
				indiv.callback.apply(null, indiv.arguments);
			}
		}
	}
	
	this.start = function (cb) {
		that._final = typeof cb == "object" ? cb : [cb];
		that._call();
	};
}

module.exports = {
	Queue : queue
};