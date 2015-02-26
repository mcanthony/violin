(function() {
  var __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['js/graph', 'underscore'], function(Graph, _) {
    var EventEmitter, Instrumentor;
    _.isConstructor = function(thing) {
      if (thing.name && thing.name[0].toUpperCase() === thing.name[0]) {
        return true;
      } else {
        return false;
      }
    };
    EventEmitter = (function() {

      function EventEmitter() {}

      EventEmitter.prototype._callbacks = {};

      EventEmitter.prototype.on = function(eventName, callback) {
        var _base;
        (_base = this._callbacks)[eventName] || (_base[eventName] = []);
        return this._callbacks[eventName].push(callback);
      };

      EventEmitter.prototype.emit = function() {
        var args, cb, eventName, _i, _len, _ref, _results;
        eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (this._callbacks[eventName]) {
          _ref = this._callbacks[eventName];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cb = _ref[_i];
            _results.push(cb.apply(null, args));
          }
          return _results;
        }
      };

      return EventEmitter;

    })();
    Instrumentor = (function(_super) {

      __extends(Instrumentor, _super);

      function Instrumentor(namespace) {
        this.instrumentObject = __bind(this.instrumentObject, this);

        this.instrumentFunction = __bind(this.instrumentFunction, this);

        this.instrumentConstructor = __bind(this.instrumentConstructor, this);

        this.trigger = __bind(this.trigger, this);

        this.addNode = __bind(this.addNode, this);
        this.dontInstrument = ['constructor', '_configure', 'make', 'initialize', 'delegateEvents', 'undelegateEvents', 'setElement', '$el', 'children', 'el', 'collection', 'models', '__instrumented'];
        this.nodes = [];
        this.links = [];
        this.loops = 0;
        this.instrument(namespace);
      }

      Instrumentor.prototype.addLink = function(from, to) {
        return this.links.push({
          source: from.id,
          target: to.id,
          value: 1
        });
      };

      Instrumentor.prototype.nextNodeId = function() {
        if (this.nodes.length === 0) {
          return 0;
        } else {
          return _(this.nodes).last().id + 1;
        }
      };

      Instrumentor.prototype.addNode = function(name, type, parent) {
        var node;
        if (parent == null) {
          parent = null;
        }
        node = {
          id: this.nextNodeId(),
          name: name,
          group: type
        };
        this.nodes.push(node);
        if (parent) {
          this.addLink(parent, node);
        }
        if (this.graph && this.graph.rendered) {
          this.graph.updateNodes(this.nodes, this.links);
        }
        return node;
      };

      Instrumentor.prototype.trigger = function(node) {
        return this.graph.triggerNode(node);
      };

      Instrumentor.prototype.instrument = function(namespace) {
        this.instrumentObject(null, 'App', namespace);
        return this.graph = new Graph(this.nodes, this.links).render();
      };

      Instrumentor.prototype.instrumentConstructor = function(parentNode, cons) {
        var addNode, instrumentObject, newCons, node, trigger;
        node = this.addNode(cons.name, 'constructor', parentNode);
        trigger = this.trigger;
        addNode = this.addNode;
        instrumentObject = this.instrumentObject;
        newCons = function() {
          var args, n, o;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          o = cons.apply(this, args);
          trigger(node);
          n = addNode(this.cid, 'instantiation', node);
          return o;
        };
        newCons.prototype = this.instrumentObject(node, cons.name, cons.prototype);
        return newCons;
      };

      Instrumentor.prototype.instrumentFunction = function(parentNode, name, func) {
        var node, trigger;
        node = this.addNode(name, 'function', parentNode);
        trigger = this.trigger;
        return function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          trigger(node);
          return func.apply(this, args);
        };
      };

      Instrumentor.prototype.instrumentObject = function(parentNode, name, object, limit) {
        var key, node, val, _fn,
          _this = this;
        if (limit == null) {
          limit = false;
        }
        node = this.addNode(name || 'Anon', 'object', parentNode);
        this.loops++;
        if (this.loops > 500 || object.__instrumented) {
          return object;
        }
        _fn = function(key, val) {
          if ((object.hasOwnProperty(key)) || (object.__proto__.hasOwnProperty(key))) {
            if (!(_(_this.dontInstrument).include(key) || key[0] === '_')) {
              if (_.isFunction(val)) {
                if (_.isConstructor(val)) {
                  return object[key] = _this.instrumentConstructor(node, val);
                } else {
                  return object[key] = _this.instrumentFunction(node, key, val);
                }
              } else if (_.isObject(val)) {
                return object[key] = _this.instrumentObject(node, key, val);
              }
            }
          }
        };
        for (key in object) {
          val = object[key];
          _fn(key, val);
        }
        if (limit) {
          object.__instrumented = true;
        }
        return object;
      };

      return Instrumentor;

    })(EventEmitter);
    return Instrumentor;
  });

}).call(this);
