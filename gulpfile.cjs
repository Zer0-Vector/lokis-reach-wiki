const { exec, execSync } = require('child_process');

function watch() {
  const maxRetries = 3;
  const retryDelay = 2500;
  let shouldContinue = true;
  let retry = 1;
  let delay = retryDelay;
  const nextRetry = () => {
    // increase delay (after first retry), and increment retry counter
    delay *= (retry++);
    shouldContinue = retry > maxRetries;
  };
  const resetRetry = () => {
    retry = 1;
    delay = retryDelay;
    shouldContinue = true;
  };
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let emitter;
  do {
    try {
      if (retry > 1) {
        sleep(delay);
      }
      emitter = execSync("git pull");
      resetRetry();
    } catch (e) {
      console.log("'git pull' failed: ", e);
      nextRetry();
    }
  } while (shouldContinue);

  return emitter;
}

function update(cb) {
  exec("git pull", cb);
}

function status() {
  exec("git status", cb);
}

exports.watch = watch;
exports.update = update;
exports.status = status;
exports.default = status;
