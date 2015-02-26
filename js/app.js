(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'backbone', 'js/instrumentor'], function(_, Backbone, Instrumentor) {
    var App;
    App = {
      Views: {}
    };
    App.Views.ListItem = (function(_super) {

      __extends(ListItem, _super);

      function ListItem() {
        this.render = __bind(this.render, this);
        return ListItem.__super__.constructor.apply(this, arguments);
      }

      ListItem.prototype.events = {
        'hover': 'onHover',
        'click a[rel=delete]': 'onDelete'
      };

      ListItem.prototype.initialize = function() {
        var _this = this;
        return this.model.bind('destroy', function() {
          return $(_this.el).remove();
        });
      };

      ListItem.prototype.tagName = 'li';

      ListItem.prototype.onDelete = function() {
        return this.model.destroy();
      };

      ListItem.prototype.onHover = function() {
        return console.log('hovered');
      };

      ListItem.prototype.template = function(o) {
        return "" + (o.get('text')) + " <a href='#' rel='delete'>x</a>";
      };

      ListItem.prototype.render = function() {
        $(this.el).append(this.template(this.options.model));
        return this;
      };

      return ListItem;

    })(Backbone.View);
    App.Views.ListView = (function(_super) {

      __extends(ListView, _super);

      function ListView() {
        this.render = __bind(this.render, this);

        this.addOne = __bind(this.addOne, this);
        return ListView.__super__.constructor.apply(this, arguments);
      }

      ListView.prototype.initialize = function() {
        this.models = new Backbone.Collection([
          {
            text: 'Item 1'
          }, {
            text: 'Item 2'
          }, {
            text: 'Item 3'
          }, {
            text: 'Item 4'
          }
        ]);
        this.i = 4;
        return this.models.bind('add', this.addOne);
      };

      ListView.prototype.events = {
        'click [rel=add]': 'addModel'
      };

      ListView.prototype.addModel = function() {
        this.i++;
        return this.models.add({
          text: "Item " + this.i
        });
      };

      ListView.prototype.template = "<ul></ul>\n<a rel='add' href='#' class='btn btn-primary btn-small'>+ add item</a>";

      ListView.prototype.addOne = function(model) {
        return this.$('ul').append(new App.Views.ListItem({
          model: model
        }).render().el);
      };

      ListView.prototype.render = function() {
        var _this = this;
        $(this.el).html(this.template);
        this.models.each(function(model) {
          return _this.addOne(model);
        });
        return this;
      };

      return ListView;

    })(Backbone.View);
    App.init = function() {
      var list;
      list = new App.Views.ListView();
      list.render();
      return $('#content').append(list.el);
    };
    window.App = App;
    new Instrumentor(App);
    return App;
  });

}).call(this);
