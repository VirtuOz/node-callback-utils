node-callback-utils
===================

This library provides some handy extensions, functions and features to aid you in your callback needful.


Counted Callbacks
=================

A counted callback is a bit like a countdown latch.  You create it with a known value (N) and a callback function.  When
the callback is called N times it will call the callback function supplied upon creation.  Here's an example:

    var callbacks = require('callback-utils');

    var countedCallback = callbacks.createCountedCallback(10, function(collatedError, paramsArray)
    {
        // collatedError is an Error object with all of underlying error object messages concatenated.  In this example,
        // the message will be
        //
        // Help me
        // I'm falling

        // paramsArray is an array of arrays.  Each array corresponds to the non-error parameters passed to the counted
        // callback function.  In this example, the array is:
        //
        // [
        //     ['hello', 'world'],
        //     ['foo', 'bar', 'baz']
        //  ]
    });

    countedCallback(new Error('Help me'));
    countedCallback(undefined, 'hello', 'world');
    countedCallback(new Error("I'm falling");
    countedCallback(undefined, 'foo', 'bar', 'baz');

It's important to know that if you rely on a counted callback then you rely on callers to ensure that the counted callback
is invoked N times, otherwise the real callback function is never called.

Counted callbacks are handy for event-style programming where there's a workflow.  In other words, before progressing
to stage N+1, all listeners to stage N events have a chance to execute asynchronously.  For example, consider a system
that downloads a file and allows listeners to check the contents before writing it to disk:

    var result = new Future();

    var fileContents = downloadFileFromSomeWhere(fileName);
    self.emit('fileDownloaded', fileContents,
              callbacks.createCountedCallback(self.listeners('fileDownloaded').length, writeFileToDisk));

    return result;

    function writeFileToDisk(collatedError)
    {
        if (collatedError)
        {
            future.fulfill(collatedError);
            return;
        }

        // Write file to disk.
        future.fulfill(undefined, fileLocation);
    }

The listeners might look like this:

    downloadThingy.on('fileDownloaded', function(fileContents, next)
    {
        checkFileContentsAsyncrhonously(fileContents, function(err)
        {
            // You could just stick next as the parameter to the checkFileContentsAsyncrhonously function but this is
            // here for illustrative purposes...
            next(err);
        });
    });

You can chain multiple such listeners together and be sure that the download thingy would never write its file to disk
until *after* all listeners have had their wicked ways with the file contents.
