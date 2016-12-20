"use strict";
(function () {
    var Modal = function () {
        this.cover = null;
        this.modal = null;
        this.trigger = null;
        this.init();
    }
    Modal.prototype.init = function () {
        this.cover = $('.modal-cover');
        this.setEvent();
    };
    Modal.prototype.setEvent = function () {
        var _this = this;
        $(document).on('click', 'a[data-modal]', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var modalName = $(event.target).attr('data-modal');
            _this.modal = $('.modal[data-modal=' + modalName + ']');
            _this.trigger = $(this);
            _this.open();
        });
        $(window).on('resize', function (event) {
            if (_this.isOpen()) {
                _this.resize();
            } 
        });
    };
    Modal.prototype.open = function () {
        this.cover.addClass('active');
        this.modal.addClass('active');
        this.resize();
    };
    Modal.prototype.close = function () {
        if (this.modal && this.cover) {
            this.modal.removeClass('active');
            this.cover.removeClass('active');
        }
    };
    Modal.prototype.getTrigger = function () {
        return this.trigger;
    };
    Modal.prototype.isOpen = function () {
        var result = false;
        if (this.modal && this.modal.is(':visible')) {
            result = true;
        }
        return result;
    };
    Modal.prototype.resize = function () {
        this.modal.removeClass('scroll');
        this.modal.height('auto');
        var height = this.modal.height();
        var top = height / 2;
        var fixHeight = 40;
        if (height > $(window).height() - fixHeight) {
            this.modal.addClass('scroll');
            this.modal.height($(window).height() - fixHeight);
            height = this.modal.height();
            top = height / 2;
        }
        this.modal.css('marginTop', top * -1);
    };
    SASAKI = SASAKI || {};
    SASAKI.Modal = Modal;
}());
