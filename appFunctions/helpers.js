export function _getCallerFile() {
  var originalFunc = Error.prepareStackTrace;

  var callerfile;
  try {
      var err = new Error();
      var currentfile;

      Error.prepareStackTrace = function (err, stack) { return stack; };

      currentfile = err.stack.shift().getFileName();

      while (err.stack.length) {
          callerfile = err.stack.shift().getFileName();

          if(currentfile !== callerfile) break;
      }
  } catch (e) {}

  Error.prepareStackTrace = originalFunc; 

  return callerfile;
}

export function _getDebugLine(message) {
  let e = new Error();
  let frame = e.stack.split("\n")[2]; // change to 3 for grandparent func
  let lineNumber = frame.split(":").reverse()[1];
  let functionName = frame.split(" ")[5];
  return functionName + ":" + lineNumber + " " + message;
}