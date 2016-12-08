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
    };
    Modal.prototype.open = function () {
        this.cover.addClass('active');
        this.modal.addClass('active');
        this.modal.css('top', $(window).scrollTop() + 100);
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
    SASAKI = SASAKI || {};
    SASAKI.Modal = Modal;
}());
