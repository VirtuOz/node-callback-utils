/*
 * Copyright 2012 VirtuOz Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Tests the operation of the callback_utils functions.
 *
 * @author Kevan Dunsmore
 * @created 2012/09/28
 */
var assert = require('chai').assert;

var callbacks = require('../index');

describe('CallbackUtilsTest', function ()
{
    beforeEach(function (done)
               {
                   done();
               });

    describe('createCountedCallback', function ()
    {
        it('should call back immediately when count is 1', function (done)
        {
            var countedCallback = callbacks.createCountedCallback(1, function (collatedError, paramsArray)
            {
                assert.isUndefined(collatedError);
                assert.isTrue(paramsArray.length === 1, 'params array length');
                assert.isTrue(paramsArray[0].length === 2, 'first call param array length');
                assert.equal('hello', paramsArray[0][0], 'first call first param');
                assert.equal('world!', paramsArray[0][1], 'first call second param');

                done();
            });
            countedCallback('hello', 'world!');
        });

        it('should call back after the correct number of calls', function (done)
        {
            var countedCallback = callbacks.createCountedCallback(3, function (collatedError, paramsArray)
            {
                assert.isUndefined(collatedError);

                assert.isTrue(paramsArray.length === 3, 'params array length');

                for (var k = 0; k < paramsArray.length; k++)
                {
                    assert.isTrue(paramsArray[k].length === 2, k + ' call param array length');
                    assert.equal('hello' + k, paramsArray[k][0], k + ' call first param');
                    assert.equal('world!' + k, paramsArray[k][1], k + ' call first param');
                }

                done();
            });

            for (var j = 0; j < 3; j++)
            {
                countedCallback('hello' + j, 'world!' + j);
            }
        });

        it('should work with no params', function (done)
        {
            var countedCallback = callbacks.createCountedCallback(1, function (collatedError, paramsArray)
            {
                assert.isUndefined(collatedError);
                assert.isTrue(paramsArray.length === 1, 'params array length');
                assert.isTrue(paramsArray[0].length === 0, 'first call param array length');

                done();
            });
            countedCallback();
        });

        it('should collate single error when count is 1', function (done)
        {
            var countedCallback = callbacks.createCountedCallback(1, function (collatedError, paramsArray)
            {
                assert.equal(collatedError.message, 'error 1');
                assert.isTrue(paramsArray.length === 1, 'params array length');
                assert.isTrue(paramsArray[0].length === 1, 'first call param array length');

                done();
            });
            countedCallback(new Error('error 1'));
        });

        it('should collate single error when count is 3', function (done)
        {
            var countedCallback = callbacks.createCountedCallback(3, function (collatedError, paramsArray)
            {
                assert.equal(collatedError.message, 'error 1');
                assert.isTrue(paramsArray.length === 3, 'params array length');
                assert.isTrue(paramsArray[0].length === 1, 'first call param array length');
                assert.isTrue(paramsArray[0][0] instanceof Error, 'paramsArray[0][0]');
                assert.isTrue(paramsArray[1].length === 0, 'second call param array length');
                assert.isTrue(paramsArray[2].length === 2, 'third call param array length');
                assert.isUndefined(paramsArray[2][0], 'paramsArray[2][0]');
                assert.equal(paramsArray[2][1], 'hello', 'paramsArray[2][1]');

                done();
            });
            countedCallback(new Error('error 1'));
            countedCallback();
            countedCallback(undefined, 'hello');
        });

        it('should collate multiple errors when count is 3', function (done)
        {
            var countedCallback = callbacks.createCountedCallback(3, function (collatedError, paramsArray)
            {
                assert.equal(collatedError.message, 'error 1\nerror 2');
                assert.isTrue(paramsArray.length === 3, 'params array length');
                assert.isTrue(paramsArray[0].length === 1, 'first call param array length');
                assert.isTrue(paramsArray[0][0] instanceof Error, 'paramsArray[0][0]');
                assert.isTrue(paramsArray[1].length === 0, 'second call param array length');
                assert.isTrue(paramsArray[2].length === 2, 'third call param array length');
                assert.isTrue(paramsArray[2][0] instanceof Error, 'paramsArray[0][0]');
                assert.equal(paramsArray[2][1], 'hello', 'paramsArray[2][1]');

                done();
            });
            countedCallback(new Error('error 1'));
            countedCallback();
            countedCallback(new Error('error 2'), 'hello');
        });

        it('should throw an error when the call count specified is less than or equal to 0', function (done)
        {
            runTest(0);
            runTest(-1);
            runTest(-10);
            done();

            function runTest(callCount)
            {
                var caughtError = undefined;
                try
                {
                    callbacks.createCountedCallback(callCount, function ()
                    {
                    });
                }
                catch (e)
                {
                    caughtError = e;
                }
                assert.isDefined(caughtError, "expected error to be thrown");
                assert.equal(caughtError.message, "Callback count must be >= 1");
            }
        });

        it('should throw an error when the callback is undefined or null', function (done)
        {
            runTest(undefined);
            runTest(null);
            done();

            function runTest(targetFunction)
            {
                var caughtError = undefined;
                try
                {
                    callbacks.createCountedCallback(1, targetFunction);
                }
                catch (e)
                {
                    caughtError = e;
                }
                assert.isDefined(caughtError, "expected error to be thrown");
                assert.equal(caughtError.message, "Callback must not be undefined or null.  Value specified was " + targetFunction + ".");
            }
        });
    });
});