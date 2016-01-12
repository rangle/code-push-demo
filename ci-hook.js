'use strict';

var os = require('os');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');

var Q = require('q');
var aws = require('aws-sdk');

var projectName = process.argv[2];

var BUCKET = 'codepush-deployments-lists';
var S3_KEY = projectName + '-codepush-deployments.json'

var COMMAND = 'code-push';
var ARGS = ['deployment', 'ls', projectName,
            '--format', 'json'];

var s3 = new aws.S3();

var tmpDir = os.tmpdir();
var outPath = path.join(tmpDir, 'codepush-deployments.json');

var codepushProc = cp.spawn(COMMAND, ARGS);

var spawnOutput = [];
codepushProc.stdout.on('data', function(str) {
  spawnOutput.push(str);
});

var d = Q.defer();

codepushProc.on('close', function(code) {
  console.log('code-push process exited with code', code);

  if(code === 0) {
    var stringOutput = spawnOutput.join('');
    var parsedOutput = JSON.parse(stringOutput);

    d.resolve(parsedOutput);
  } else {
    d.reject();
  }
});

d.promise.then(function(parsedOutput) {
  var outString = JSON.stringify(parsedOutput);
  return Q.nfbind(fs.writeFile)(outPath, outString);
}, Q.reject)

.then(function() {
  console.log('Wrote data to', outPath);

  var readStream = fs.createReadStream(outPath);
  s3.upload({ Body: readStream,
              Bucket: BUCKET,
              Key: S3_KEY })

    .on('httpUploadProgress', function(evt) { console.log(evt); })
    .send(function(err, data) { console.log(err, data) });
});
