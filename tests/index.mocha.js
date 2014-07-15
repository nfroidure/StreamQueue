var assert = require('assert')
  , es = require('event-stream')
  , StreamQueue = require('../src')
  , PlatformStream = require('stream')
  , Stream = require('readable-stream')
;

// Test each type of stream
[PlatformStream, Stream].slice(PlatformStream.Readable ? 0 : 1)
  .forEach(function(Stream) {

// Tests
describe('StreamQueue', function() {

  describe('in binary mode', function() {

    describe('and with async streams', function() {

      it('should work with functionnal API', function(done) {
        getStreamText(StreamQueue(
          writeToStream(new Stream.PassThrough(), ['wa','dup']),
          writeToStream(new Stream.PassThrough(), ['pl','op']),
          writeToStream(new Stream.PassThrough(), ['ki','koo','lol'])
        ), function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
      });

      it('should work with functionnal API and options', function(done) {
        getStreamText(StreamQueue({pause: true},
          writeToStream(new Stream.PassThrough(), ['wa','dup']),
          writeToStream(new Stream.PassThrough(), ['pl','op']),
          writeToStream(new Stream.PassThrough(), ['ki','koo','lol'])
        ), function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
      });

      it('should work with POO API', function(done) {
        var queue = new StreamQueue();
        queue.queue(writeToStream(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should pause streams in flowing mode', function(done) {
        var queue = new StreamQueue({
          pauseFlowingStream: true,
          resumeFlowingStream: true
        });
        queue.queue(readableStream(['wa','dup']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should work with POO API and options', function(done) {
        var queue = new StreamQueue({
          pauseFlowingStream: true,
          resumeFlowingStream: true
        });
        queue.queue(writeToStream(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should work with POO API and a late done call', function(done) {
        var queue = new StreamQueue();
        queue.queue(writeToStream(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        setTimeout(function() {
          queue.done();
        }, 100);
      });

      it('should work with POO API and no stream plus sync done', function(done) {
        var queue = new StreamQueue();
        assert.equal(queue.length, 0);
        queue.queue();
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        queue.done();
      });

      it('should work with POO API and no stream plus async done', function(done) {
        var queue = new StreamQueue();
        assert.equal(queue.length, 0);
        queue.queue();
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        setTimeout(function() {
          queue.done();
        }, 100);
      });

      it('should work with POO API and a streamqueue stream plus async done', function(done) {
        var queue = new StreamQueue();
        var child = new StreamQueue();
        queue.queue(child);
        assert.equal(queue.length, 1);
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        child.done();
        setTimeout(function() {
          queue.done();
        }, 100);
      });

      it('should work with POO API and a streamqueue stream plus async done', function(done) {
        var queue = new StreamQueue();
        var child = new StreamQueue();
        queue.queue(child);
        assert.equal(queue.length, 1);
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        child.done();
        queue.done();
      });

      it('should work with POO API and a streamqueue ended stream plus async done', function(done) {
        var queue = new StreamQueue();
        var child = new StreamQueue();
        queue.queue(child);
        child.done();
        assert.equal(queue.length, 1);
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        setTimeout(function() {
          queue.done();
        }, 100);
      });

      it('should fire end asynchronously with streams', function(done) {
        var queue = new StreamQueue();
        var ended = false;
        queue.queue(writeToStream(new Stream.PassThrough(), ['wa','dup'])
          .on('end', function() {
            assert.equal(ended, false);
          }));
        queue.queue(writeToStream(new Stream.PassThrough(), ['pl','op'])
          .on('end', function() {
            assert.equal(ended, false);
          }));
        queue.queue(writeToStream(new Stream.PassThrough(), ['ki','koo','lol'])
          .on('end', function() {
            assert.equal(ended, false);
          }));
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.on('end', function() {
          ended = true;
        });
        queue.done();
        assert.equal(ended, false);
      });

      it('should fire end asynchronously when empty', function(done) {
        var queue = new StreamQueue();
        var ended = false;
        assert.equal(queue.length, 0);
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        queue.on('end', function() {
          ended = true;
        });
        queue.done();
        assert.equal(ended, false);
      });

      it('should work with POO API and a streamqueue ended stream plus sync done', function(done) {
        var queue = new StreamQueue();
        var child = new StreamQueue();
        queue.queue(child);
        child.done();
        assert.equal(queue.length, 1);
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        queue.done();
      });

      it('should work with POO API and a streamqueue ended stream plus async done', function(done) {
        var queue = new StreamQueue();
        var child = new StreamQueue();
        child.done();
        queue.queue(child);
        assert.equal(queue.length, 1);
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        setTimeout(function() {
          queue.done();
        }, 100);
      });

      it('should work with POO API and a streamqueue ended stream plus sync done', function(done) {
        var queue = new StreamQueue();
        var child = new StreamQueue();
        child.done();
        queue.queue(child);
        assert.equal(queue.length, 1);
        getStreamText(queue, function(data) {
          assert.equal(data, '');
          done();
        });
        queue.done();
      });

      it('should reemit errors', function(done) {
        var gotError = false;
        var queue = new StreamQueue();
        queue.queue(erroredStream('Aouch!'));
        queue.queue(writeToStream(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 4);
        queue.on('error', function(err) {
          gotError = true;
        });
        getStreamText(queue, function(data) {
          assert(gotError);
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should reemit errors elsewhere', function(done) {
        var gotError = false;
        var queue = new StreamQueue();
        queue.queue(writeToStream(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStream(new Stream.PassThrough(), ['pl','op']));
        queue.queue(erroredStream('Aouch!'));
        queue.queue(writeToStream(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 4);
        queue.on('error', function(err) {
          gotError = true;
        });
        getStreamText(queue, function(data) {
          assert(gotError);
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

    });

    describe('and with sync streams', function() {

      it('should work with functionnal API', function(done) {
        getStreamText(StreamQueue(
          writeToStreamSync(new Stream.PassThrough(), ['wa','dup']),
          writeToStreamSync(new Stream.PassThrough(), ['pl','op']),
          writeToStreamSync(new Stream.PassThrough(), ['ki','koo','lol'])
        ), function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
      });

      it('should work with POO API', function(done) {
        var queue = new StreamQueue();
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should emit an error when calling done twice', function(done) {
        var queue = new StreamQueue();
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
        assert.throws(function() {
          queue.done();
        });
      });

      it('should emit an error when queueing after done was called', function(done) {
        var queue = new StreamQueue();
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
        assert.throws(function() {
          queue.queue(new Stream.PassThrough());
        });
      });

      it('should reemit errors', function(done) {
        var gotError = false;
        var queue = new StreamQueue();
        queue.queue(erroredStream('Aouch!'));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['wa','dup']));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['pl','op']));
        queue.queue(writeToStreamSync(new Stream.PassThrough(), ['ki','koo','lol']));
        assert.equal(queue.length, 4);
        queue.on('error', function(err) {
          gotError = true;
          assert.equal(err.message, 'Aouch!');
        });
        getStreamText(queue, function(data) {
          assert(gotError);
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

    });

    describe('and with functions returning streams', function() {

      it('should work with functionnal API', function(done) {
        getStreamText(StreamQueue(function() {
          return writeToStream(new Stream.PassThrough(), ['wa','dup']);
        }, function() {
          return writeToStream(new Stream.PassThrough(), ['pl','op']);
        }, function() {
          return writeToStream(new Stream.PassThrough(), ['ki','koo','lol']);
        }), function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
      });

      it('should work with functionnal API and options', function(done) {
        var stream1 = new Stream.PassThrough()
          , stream2 = new Stream.PassThrough()
          , stream3 = new Stream.PassThrough()
        ;
        getStreamText(StreamQueue({pause: true},
          function() {
            return writeToStream(new Stream.PassThrough(), ['wa','dup']);
          }, function() {
            return writeToStream(new Stream.PassThrough(), ['pl','op']);
          }, function() {
            return writeToStream(new Stream.PassThrough(), ['ki','koo','lol']);
          }), function(data) {
            assert.equal(data, 'wadupplopkikoolol');
            done();
        });
      });

      it('should work with POO API', function(done) {
        var queue = new StreamQueue();
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['wa','dup']);
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['pl','op']);
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['ki','koo','lol']);
        });
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should pause streams in flowing mode', function(done) {
        var queue = new StreamQueue({
          pauseFlowingStream: true,
          resumeFlowingStream: true
        });
        queue.queue(function() {
          return readableStream(['wa','dup']);
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['pl','op']);
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['ki','koo','lol']);
        });
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should work with POO API and options', function(done) {
        var queue = new StreamQueue({
          pauseFlowingStream: true,
          resumeFlowingStream: true
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['wa','dup']);
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['pl','op'])
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['ki','koo','lol'])
        });
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should work with POO API and a late done call', function(done) {
        var queue = new StreamQueue();
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['wa','dup']);
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['pl','op'])
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['ki','koo','lol'])
        });
        assert.equal(queue.length, 3);
        getStreamText(queue, function(data) {
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        setTimeout(function() {
          queue.done();
        }, 100);
      });

      it('should reemit errors', function(done) {
        var gotError = false;
        var queue = new StreamQueue();
        queue.queue(erroredStream('Aouch!'));
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['wa','dup']);
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['pl','op'])
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['ki','koo','lol'])
        });
        assert.equal(queue.length, 4);
        queue.on('error', function(err) {
          gotError = true;
          assert.equal(err.message, 'Aouch!');
        });
        getStreamText(queue, function(data) {
          assert(gotError);
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

      it('should reemit errors elsewhere', function(done) {
        var gotError = false;
        var queue = new StreamQueue();
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['wa','dup']);
        });
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['pl','op'])
        });
        queue.queue(erroredStream('Aouch!'));
        queue.queue(function() {
          return writeToStream(new Stream.PassThrough(), ['ki','koo','lol'])
        });
        assert.equal(queue.length, 4);
        queue.on('error', function(err) {
          gotError = true;
          assert.equal(err.message, 'Aouch!');
        });
        getStreamText(queue, function(data) {
          assert(gotError);
          assert.equal(data, 'wadupplopkikoolol');
          done();
        });
        queue.done();
      });

    });

  });

  describe('in object mode', function() {

    it('should work', function(done) {
      var queue = new StreamQueue({objectMode: true});
      queue.queue(writeToStream(new Stream.PassThrough({objectMode: true}), [{s:'wa'},{s:'dup'}]));
      queue.queue(writeToStream(new Stream.PassThrough({objectMode: true}), [{s:'pl'},{s:'op'}]));
      queue.queue(writeToStream(new Stream.PassThrough({objectMode: true}), [{s:'ki'},{s:'koo'},{s:'lol'}]));
      getStreamObjs(queue, function(data) {
        assert.deepEqual(data, [{s:'wa'},{s:'dup'},{s:'pl'},{s:'op'},{s:'ki'},{s:'koo'},{s:'lol'}]);
        done();
      });
      queue.done();
    });

  });

});

});

describe('streamqueue with old 0.8 streams', function() {

    it('should work', function(done) {
      var queue = new StreamQueue();
      queue.queue(writeToStreamOld(new PlatformStream(), ['wa','dup'], 50));
      queue.queue(writeToStreamOld(new PlatformStream(), ['pl','op']));
      queue.queue(writeToStreamOld(new PlatformStream(), ['ki','koo','lol']));
      getStreamText(queue, function(data) {
        assert.deepEqual(data, 'wadupplopkikoolol');
        done();
      });
      queue.done();
    });
  
});

// Helpers
function writeToStreamSync(stream, chunks) {
  if(!chunks.length) {
    stream.end();
  } else {
    stream.write(chunks.shift());
    writeToStreamSync(stream, chunks);
  }
  return stream;
}
function writeToStream(stream, chunks) {
  if(!chunks.length) {
    stream.end();
  } else {
    setTimeout(function() {
      stream.write(chunks.shift());
      writeToStream(stream, chunks);
    });
  }
  return stream;
}
function writeToStreamOld(stream, chunks, timeout) {
  stream.readable = true;
  if(!chunks.length) {
    stream.emit('end');
  } else {
    setTimeout(function() {
      stream.emit('data', chunks.shift());
      writeToStreamOld(stream, chunks, timeout);
    }, timeout || 0);
  }
  return stream;
}
function readableStream(chunks) {
  var stream = new Stream.Readable();
  stream._read = function() {
    var chunk = null;
    if(chunks.length) {
      chunk = chunks.shift();
    }
    setTimeout(function() {
      stream.push(chunk);
    });
  }
  stream.resume();
  return stream;
}
function erroredStream(msg) {
  var erroredStream = new Stream.PassThrough();
  setTimeout(function() {
    erroredStream.emit('error', new Error(msg));
    erroredStream.end();
  });
  return erroredStream;
}

function getStreamText(stream, cb) {
  var text = '';
  stream.on('readable', function () {
    var chunk;
    do {
      chunk = stream.read();
      if(chunk !== null) {
        text += chunk.toString();
      }
    } while(chunk !== null);
  });
  stream.on('end', function () {
    cb(text);
  });
}

function getStreamObjs(stream, cb) {
  var objs = [];
  stream.on('readable', function () {
    var obj;
    do {
      obj = stream.read();
      if(obj !== null) {
        objs.push(obj);
      }
    } while(obj !== null);
  });
  stream.on('end', function () {
    cb(objs);
  });
}

