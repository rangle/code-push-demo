'use strict';

const cp = require('child_process');
const Q = require('q');

const projectName = process.argv[2];
const appStoreVersion = process.argv[3];
const prNumber = process.argv[4];
const deployments = [
  prNumber ? `pr-${prNumber}-ios` : 'ios',
  prNumber ? `pr-${prNumber}-android` : 'android',
];

deployments.forEach(deploy);

function deploy(deploymentName) {
  createDeployment(deploymentName)
    .then(() => codePushRelease(deploymentName))
    .catch(Q.reject);
}

/**
 * Publish a release to the specified deployment
 */
function codePushRelease(deploymentName) {
  const buildPath = /ios/g.test(deploymentName) ? './platforms/ios/www/' :
                                            './platforms/android/assets/www';
  const ARGS = ['release', projectName, buildPath, appStoreVersion,
    '--deploymentName', deploymentName];

  return execCommand(ARGS, (d, stringOutput, code) => {
    if(code === 0) {
      d.resolve();
    } else {
      d.reject();
    }
  });
}

/**
 * Add a new deployment
 * Ignore if it already exists
 */
function createDeployment(deploymentName) {
  const ARGS = ['deployment', 'add', projectName, deploymentName];
  const exp = /\[Error\]  A deployment named .+ already exists./;

  return execCommand(ARGS, (d, stringOutput, code) => {
    if (code === 0 || (code === 1 && exp.test(stringOutput))) {
      d.resolve(stringOutput);
    } else {
      d.reject(stringOutput);
    }
  });
}

/**
 * Execute a code-push CLI command
 */
function execCommand(ARGS, cb) {
  const COMMAND = 'code-push';
  const codepushProc = cp.spawn(COMMAND, ARGS);

  let spawnOutput = [];
  codepushProc.stdout.on('data', function(str) {
    spawnOutput.push(str);
  });

  codepushProc.stderr.on('data', function(str) {
    spawnOutput.push(str);
  });

  const d = Q.defer();

  codepushProc.on('close', function(code) {
    console.log(' » code-push add deployment process exited with code', code);
    const stringOutput = spawnOutput.join('');
    console.log(stringOutput);
    cb(d, stringOutput, code);
  });

  return d.promise;
}
