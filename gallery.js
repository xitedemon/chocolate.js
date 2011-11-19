(function() {
  var Gallery, closeAction, counter, nextAction, prevAction, template;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  template = '<div class="sgl-overlay">' + '<div class="sgl-leftside"></div>' + '<div class="sgl-spinner">' + ' <img src="../themes/default/images/spinner-bg.png" alt="">' + ' <img src="../themes/default/images/spinner-serenity.png" alt="">' + '</div>' + '<div class="sgl-image"></div>' + '<div class="sgl-rightside"></div>' + '<div class="sgl-tumbnails"></div>' + '<div class="sgl-close"></div>' + '</div>';

  counter = 0;

  nextAction = 'next';

  prevAction = 'prev';

  closeAction = 'close';

  Gallery = (function() {

    Gallery.prototype.images = {};

    Gallery.prototype.current = null;

    Gallery.prototype.options = {
      overlay: false,
      leftside: prevAction,
      container: nextAction,
      rightside: closeAction
    };

    Gallery.prototype.actions = [nextAction, prevAction, closeAction];

    /*
       Конструктор
    */

    function Gallery(images, options) {
      var element, _i, _len, _ref;
      var _this = this;
      if (options && typeof options === 'object') {
        this.options = $.extend(this.options, options);
      }
      this.overlay = $(template).appendTo('body');
      this.container = this.overlay.find('.sgl-image');
      this.spinner = this.overlay.find('.sgl-spinner');
      this.leftside = this.overlay.find('.sgl-leftside');
      this.rightside = this.overlay.find('.sgl-rightside');
      this.tumbnails = this.overlay.find('.sgl-tumbnails');
      this.overlay.find('.sgl-close').click(function(event) {
        return _this.close();
      });
      _ref = ['overlay', 'container', 'leftside', 'rightside'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        this.prepareActionFor(element);
      }
      $(document).bind('keyup', function(event) {
        if (_this.overlay.css('display') === 'block') {
          switch (event.keyCode) {
            case 27:
              return _this.close();
            case 37:
              return _this.prev();
            case 39:
              return _this.next();
          }
        }
      });
      if (images) this.add(images);
    }

    Gallery.prototype.prepareActionFor = function(element) {
      var method, verify, _ref;
      var _this = this;
      method = (_ref = this.options[element], __indexOf.call(this.actions, _ref) >= 0) ? this.options[element] : false;
      if (method) {
        verify = this[element].attr('class');
        this[element].click(function(event) {
          if ($(event.target).hasClass(verify)) return _this[method]();
        });
      }
      return this;
    };

    /*
       Добавляем список изображений для работы в галереи
    */

    Gallery.prototype.add = function(images) {
      var _this = this;
      if (!images || images.length === 0) return this;
      $.each(images, function(index, image) {
        var cid, element, source, title;
        image = $(image);
        source = image.attr('data-src') || image.parent().attr('href') || null;
        title = image.attr('data-title') || image.attr('title') || null;
        if (source) {
          cid = ++counter;
          image.addClass('sgl-item').click(function(event) {
            return _this._initialShow(event, cid);
          });
          _this.images[cid] = {
            source: source,
            title: title,
            thumbnail: image.attr('src')
          };
          element = new Image();
          element.src = _this.images[cid].thumbnail;
          return element.onload = function(event) {
            image.before('<span class="sgl-item-hover" data-sglid="' + cid + '"></span>');
            return $('span[data-sglid=' + cid + ']').css({
              width: image.width(),
              height: image.height()
            }).click(function(event) {
              return _this._initialShow(event, cid);
            });
          };
        }
      });
      return this;
    };

    Gallery.prototype._initialShow = function(event, cid) {
      event.stopPropagation();
      event.preventDefault();
      this.current = cid;
      return this.show(cid);
    };

    /*
       Показать изображение на большом экране
    */

    Gallery.prototype.show = function(cid) {
      this.createThumbnails().updateImage(cid);
      this.overlay.css('display', 'block');
      return this;
    };

    Gallery.prototype.close = function() {
      this.overlay.css('display', 'none');
      return this;
    };

    Gallery.prototype.next = function() {
      var next;
      next = this.current + 1;
      if (typeof this.images[next] !== 'undefined') this.updateImage(next);
      return this;
    };

    Gallery.prototype.prev = function() {
      var prev;
      prev = this.current - 1;
      if (typeof this.images[prev] !== 'undefined') this.updateImage(prev);
      return this;
    };

    /*
       Обновление изображения
    */

    Gallery.prototype.updateImage = function(cid) {
      this.current = cid;
      this.tumbnails.find('div.selected').removeClass('selected');
      this.tumbnails.find('div[data-cid=' + cid + ']').addClass('selected');
      this.getImageSize(cid, function(cid) {
        var content, image;
        image = this.images[cid];
        this.updateDimensions(image.width, image.height);
        content = image.title ? '<div class="sgl-header"><h1>' + image.title + '</h1></div>' : '';
        this.container.css('background-image', 'url(' + image.source + ')');
        return this.container.html(content);
      });
      return this;
    };

    /*
       Обновление размеров блока с главным изображением
    */

    Gallery.prototype.getImageSize = function(cid, callback) {
      var element, image;
      var _this = this;
      if (callback == null) callback = function() {};
      image = this.images[cid];
      if (!image.width || !image.height) {
        this.spinner.css('display', 'block');
        element = new Image();
        element.src = image.source;
        element.onload = function(event) {
          return setTimeout((function() {
            _this.spinner.css('display', 'none');
            _this.images[cid].width = element.width;
            _this.images[cid].height = element.height;
            delete element;
            return callback.call(_this, cid);
          }), 500);
        };
      } else {
        callback.call(this, cid);
      }
      return this;
    };

    /*
       Обновление размеров блока с главным изображением
    */

    Gallery.prototype.updateDimensions = function(width, height) {
      var innerHeight, innerWidth, left, style, top, windowHeight, windowWidth;
      innerWidth = window.innerWidth;
      windowWidth = innerWidth - 50;
      innerHeight = window.innerHeight;
      windowHeight = innerHeight - 150;
      if (width > windowWidth) {
        height = (windowWidth * height) / width;
        width = windowWidth;
      }
      if (height > windowHeight) {
        width = (windowHeight * width) / height;
        height = windowHeight;
      }
      left = parseInt(width / 2, 10);
      top = parseInt(height / 2, 10) + parseInt(this.tumbnails.height() / 2, 10);
      style = {
        'width': (innerWidth / 2 - left) + 'px',
        'height': innerHeight + 'px'
      };
      this.leftside.css(style);
      this.rightside.css(style);
      style = {
        'width': width,
        'height': height,
        'margin-left': '-' + left + 'px',
        'margin-top': '-' + top + 'px'
      };
      this.container.css(style);
      this.spinner.css(style);
      return this;
    };

    /*
       Создание панели для тумбнейлов
    */

    Gallery.prototype.createThumbnails = function() {
      var content, current, _this;
      if (this.images.length <= 1 || this.current === null) return this;
      _this = this;
      current = this.images[this.current].source;
      content = '';
      $.each(this.images, function(cid, image) {
        var selected;
        selected = current && current === image.source ? ' selected' : '';
        return content += '<div class="sgl-thumbnail' + selected + '" data-cid="' + cid + '" style="background-image:url(\'' + image.thumbnail + '\')"' + (image.title ? ' title="' + image.title + '"' : '') + '></div>';
      });
      this.tumbnails.html(content);
      this.tumbnails.find('div.sgl-thumbnail').click(function(event) {
        return _this.updateImage(parseInt($(this).attr('data-cid'), 10));
      });
      return this;
    };

    return Gallery;

  })();

  if (jQuery && jQuery.fn) {
    jQuery.fn.gallery = function() {
      return new Gallery(this, arguments[0]);
    };
  }

}).call(this);
