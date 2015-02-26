(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(['d3'], function(d3) {
    var Graph;
    Graph = (function() {

      function Graph(nodes, links) {
        this.animateQueue = __bind(this.animateQueue, this);
        this.height = 600;
        this.width = 430;
        this.nodes = nodes;
        this.links = links;
        this.rendered = false;
        this.animateSequentially = true;
      }

      Graph.prototype.setupForce = function() {
        return this.force = d3.layout.force().charge(-200).linkDistance(30).size([this.width, this.height]);
      };

      Graph.prototype.setupSVG = function() {
        return this.svg = d3.select('#chart').append('svg').attr('width', this.width).attr('height', this.height);
      };

      Graph.prototype.setupLegend = function() {
        var controls, items, legend, litems, that;
        legend = this.svg.append('svg:g').attr('class', 'legend').attr('transform', "translate(20,20)");
        items = [
          {
            t: 'object'
          }, {
            t: 'function'
          }, {
            t: 'constructor'
          }, {
            t: 'instantiation'
          }
        ];
        litems = legend.selectAll('.legend-item').data(items).enter().append('svg:g').attr('class', function(d) {
          return d.t + ' legend-item';
        });
        litems.append('circle').attr('r', 5);
        litems.append('text').text(function(d) {
          return d.t;
        }).attr('dy', 5).attr('dx', 10);
        litems.attr('transform', function(d, i) {
          return "translate(0, " + (i * 20) + ")";
        });
        controls = this.svg.append('svg:g').attr('class', 'controls').attr('transform', 'translate(410,20)');
        that = this;
        controls.append('circle').attr('r', 5).style('stroke', '#000000').style('fill', 'black').style('stroke-width', 1);
        controls.append('text').text('Slow animations').style('text-anchor', 'end').attr('x', -10).attr('dy', 4);
        return controls.on('click', function() {
          var circle;
          circle = d3.select(this).select('circle');
          if (that.animateSequentially) {
            that.animateSequentially = false;
            return circle.style('fill', 'white');
          } else {
            that.animateSequentially = true;
            return circle.style('fill', 'black');
          }
        });
      };

      Graph.prototype.setupGraph = function() {
        var entered, enteredLinks;
        this.force.nodes(this.nodes).links(this.links);
        this.link = this.svg.selectAll('line.link').data(this.links, function(d) {
          return "" + d.source.id + "-" + d.target.id;
        });
        enteredLinks = this.link.enter();
        enteredLinks.append('line').attr('class', 'link').style('stroke-width', 2);
        this.node = this.svg.selectAll('.node').data(this.nodes, function(d) {
          return d.id;
        });
        entered = this.node.enter().append('g').attr('class', function(d) {
          var c;
          return c = "node " + d.group;
        }).call(this.force.drag);
        entered.append('circle').attr('class', 'node').attr('cx', 0).attr('cy', 0).attr('r', 5);
        entered.append('text').attr('dx', 0).attr('dy', '1.2em').text(function(d) {
          return d.name;
        });
        return this.force.start();
      };

      Graph.prototype.onTick = function() {
        var _this = this;
        return this.force.on('tick', function(t) {
          _this.link.attr('x1', function(d) {
            return d.source.x;
          }).attr('y1', function(d) {
            return d.source.y;
          }).attr('x2', function(d) {
            return d.target.x;
          }).attr('y2', function(d) {
            return d.target.y;
          });
          return _this.node.attr('transform', function(d) {
            return "translate(" + d.x + ", " + d.y + ")";
          });
        });
      };

      Graph.prototype.render = function() {
        this.setupForce();
        this.setupSVG();
        this.setupLegend();
        this.setupGraph();
        this.onTick();
        this.rendered = true;
        return this;
      };

      Graph.prototype.triggers = [];

      Graph.prototype.queueTrigger = function(node) {
        if (this.triggers.length === 0) {
          this.triggers.push(node);
          return this.animateQueue();
        } else {
          return this.triggers.push(node);
        }
      };

      Graph.prototype.triggerNode = function(node) {
        return this.queueTrigger(node);
      };

      Graph.prototype.animateQueue = function() {
        var node, updated,
          _this = this;
        node = this.triggers[0];
        if (node) {
          updated = this.node.data([node], function(d) {
            return d.id;
          });
          updated.append('circle').attr('class', 'ring').attr('r', 10).attr('cx', 0).attr('cy', 0).attr('opacity', 1).transition().duration(2000).attr('r', 20).attr('opacity', 0);
          if (this.animateSequentially) {
            return updated.selectAll('circle.node').transition().duration(100).attr('r', 25).transition().delay(100).duration(100).attr('r', 5).each('end', function() {
              _this.triggers.shift();
              return _this.animateQueue();
            });
          } else {
            updated.selectAll('circle.node').transition().duration(100).attr('r', 25).transition().delay(100).duration(100).attr('r', 5);
            this.triggers.shift();
            return this.animateQueue();
          }
        }
      };

      Graph.prototype.updateNodes = function(nodes, links) {
        this.nodes = nodes;
        this.links = links;
        return this.setupGraph();
      };

      return Graph;

    })();
    return Graph;
  });

}).call(this);
