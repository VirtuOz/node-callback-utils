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
 * callback_utils.js
 *
 * @author Kevan Dunsmore
 * @created 2012/09/28
 */
/**
 * Creates a wrapper around the supplied callback function that will only call the callback when the wrapper itself is
 * called 'count' times.  Each time it is called the arguments are stored in an array.  When the callback is called,
 * this array of arrays is passed.
 *
 * @param count The number of times to be called.
 * @param callback  The callback to call.
 * @return {Function} The wrapped callback.
 */
function createCountedCallback(count, callback)
{
    if (count <= 0)
    {
        throw new Error("Callback count must be >= 1");
    }

    if (!callback)
    {
        throw new Error("Callback must not be undefined or null.  Value specified was " + callback + ".");
    }

    var wrapper = function()
    {
        // store our arguments.
        var args = [];
        for (var i = 0; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
        wrapper.callbackArguments.push(args);

        // Check to see if we've been called for the last time.
        if (wrapper.callbackArguments.length === count)
        {
            var collatedError = collateErrors(wrapper.callbackArguments);
            callback(collatedError, wrapper.callbackArguments);
        }
    };
    wrapper.callbackArguments = [];

    return wrapper;
}


function collateErrors(paramsArray)
{
    var errorMessage = "";
    paramsArray.forEach(function (params)
                        {
                            if (params.length >= 1 && params[0] instanceof Error)
                            {
                                errorMessage += params[0].message + '\n';
                            }
                        });

    return errorMessage === "" ? undefined : new Error(errorMessage.trim());
}

module.exports.createCountedCallback = createCountedCallback;