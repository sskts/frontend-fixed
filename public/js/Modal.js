"use strict";
(function () {
    var Modal = function () {
        this.init();
    }
    Modal.prototype.init = function () {
        this.cover = $('.modal-cover');
        if (this.cover.length > 0) {
            this.setEvent();
        }
    };
    Modal.prototype.setEvent = function () {
        var _this = this;
        $(document).on('click', 'a[data-modal]', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var modalName = $(event.target).attr('data-modal');
            _this.modal = $('.modal[data-modal=' + modalName + ']');
            _this.triggerIndex = $('a[data-modal=' + modalName + ']').index(this);
            _this.open();
        });
        $(document).on('click', this.cover, function (event) {
            _this.close();
        });
    };
    Modal.prototype.open = function () {
        this.cover.addClass('active');
        this.modal.addClass('active');
        this.modal.css('top', $(window).scrollTop() + 100);
        this.modal.attr('data-modal-trigger-index', this.triggerIndex);
    };
    Modal.prototype.close = function () {
        if (this.modal && this.cover) {
            this.modal.removeClass('active');
            this.cover.removeClass('active');
        }
    };
    SASAKI = SASAKI || {};
    SASAKI.Modal = Modal;
}());
