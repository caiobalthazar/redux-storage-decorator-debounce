'use strict';

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var eventMap = {};
global.window = {
    addEventListener: function addEventListener(name, cb) {
        eventMap[name] = cb;
    },
    dispatchEvent: function dispatchEvent(name) {
        if (eventMap.hasOwnProperty(name)) {
            eventMap[name]();
        }
    }
};

describe('debounce', function () {
    it('should proxy load to engine.load', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var load, engine;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        load = sinon.spy();
                        engine = (0, _2['default'])({ load: load }, 0);
                        _context.next = 4;
                        return engine.load();

                    case 4:

                        load.should.have.been.called;

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    })));

    it('should proxy save to engine.save with the right delay', function (done) {
        var save = sinon.stub().resolves();
        var engine = (0, _2['default'])({ save: save }, 10);

        engine.save({});

        setTimeout(function () {
            save.should.not.have.been.called;
        }, 5);
        setTimeout(function () {
            save.should.have.been.called;done();
        }, 15);
    });

    it('should override save with a minimum set', function (done) {
        var save = sinon.stub().resolves();
        var engine = (0, _2['default'])({ save: save }, 30, 160);

        var saveEngine = function saveEngine() {
            var noop = function noop() {};
            engine.save({})['catch'](noop);
        };

        for (var i = 0; i < 300; i += 20) {
            setTimeout(saveEngine, i);
        }

        setTimeout(function () {
            save.should.have.been.calledOnce;
            done();
        }, 170);
    });

    it('should save early on beforeunload', function (done) {
        var save = sinon.stub().resolves();
        var engine = (0, _2['default'])({ save: save }, 500);

        engine.save({});
        window.dispatchEvent('beforeunload');

        setTimeout(function () {
            save.should.have.been.calledOnce;
            done();
        }, 25);
    });

    it('should save early on other events', function (done) {
        var save = sinon.stub().resolves();
        var engine = (0, _2['default'])({ save: save }, 500, null, ['onpause']);

        engine.save({});
        window.dispatchEvent('onpause');

        setTimeout(function () {
            save.should.have.been.calledOnce;
            done();
        }, 25);
    });

    it('should not self-trigger save on beforeunload', function (done) {
        var save = sinon.stub().resolves();
        (0, _2['default'])({ save: save }, 0);

        window.dispatchEvent('beforeunload');

        setTimeout(function () {
            save.should.not.have.been.calledOnce;
            done();
        }, 25);
    });

    it('should not self-trigger save if beforeunload is triggered after timeout is cleared', function (done) {
        var save = sinon.stub().resolves();
        var engine = (0, _2['default'])({ save: save }, 0);

        engine.save({});

        setTimeout(function () {
            window.dispatchEvent('beforeunload');
            save.should.have.been.calledOnce;
            done();
        }, 25);
    });

    it('should fail if ms is above maxMs', function () {
        var save = sinon.stub().resolves();
        var setup = function setup() {
            return (0, _2['default'])({ save: save }, 2, 1);
        };

        setup.should['throw'](Error);
    });

    it('should not fail if window is missing', function () {
        var oldWindow = global.window;
        delete global.window;

        (0, _2['default'])({ save: sinon.spy() }, 0);

        global.window = oldWindow;
    });

    it('should reject waiting save calls if another comes in', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var save, engine, call1, call2;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        save = sinon.stub().resolves();
                        engine = (0, _2['default'])({ save: save }, 10);
                        call1 = engine.save({});
                        call2 = engine.save({});
                        _context2.next = 6;
                        return call1.should.be.rejected;

                    case 6:
                        _context2.next = 8;
                        return call2.should.eventually.be.fulfilled;

                    case 8:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    })));

    it('should resolve with the response from engine.save', function () {
        var save = sinon.stub().resolves(42);
        var engine = (0, _2['default'])({ save: save }, 0);

        return engine.save({}).should.become(42);
    });

    it('should reject with the error from engine.save', function () {
        var save = sinon.stub().rejects(24);
        var engine = (0, _2['default'])({ save: save }, 0);

        return engine.save({}).should.be.rejectedWith(24);
    });
});