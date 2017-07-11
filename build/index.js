'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = function (engine, ms) {
    var maxWait = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var eventsToPersistOn = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ['beforeunload'];

    if (maxWait !== null && ms > maxWait) {
        throw new Error('maxWait must be > ms');
    }

    var lastTimeout = void 0;
    var maxTimeout = void 0;
    var lastReject = void 0;
    var lastState = void 0;

    var hasWindow = false;
    try {
        hasWindow = !!window;
    } catch (err) {
        // ignore error
    }
    if (hasWindow && window.addEventListener) {
        var saveUponEvent = function saveUponEvent() {
            if (!lastTimeout) {
                return;
            }

            lastTimeout = clearTimeout(lastTimeout);
            maxTimeout = clearTimeout(maxTimeout);
            lastReject = null;
            engine.save(lastState);
        };
        eventsToPersistOn.forEach(function (eventName) {
            return window.addEventListener(eventName, saveUponEvent);
        });
    }

    return _extends({}, engine, {
        save: function save(state) {
            lastState = state;
            lastTimeout = clearTimeout(lastTimeout);

            if (lastReject) {
                lastReject(Error('Debounced, newer action pending'));
                lastReject = null;
            }

            return new Promise(function (resolve, reject) {
                var doSave = function doSave() {
                    lastTimeout = clearTimeout(lastTimeout);
                    maxTimeout = clearTimeout(maxTimeout);
                    lastReject = null;
                    lastState = null;
                    engine.save(state).then(resolve)['catch'](reject);
                };

                lastReject = reject;
                lastTimeout = setTimeout(doSave, ms);

                if (maxWait !== null && !maxTimeout) {
                    maxTimeout = setTimeout(doSave, maxWait);
                }
            });
        }
    });
};