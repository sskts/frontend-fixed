"use strict";
(function () {
    var Modal = function () {
        this.cover = null;
        this.modal = null;
        this.trigger = null;
        this.init();
    }
    Modal.prototype = {
        init: function () {
            this.cover = $('.modal-cover');
            this.setEvent();
        },
        setEvent: function () {
            var _this = this;
            //トリガー
            $(document).on('click', 'a[data-modal]', function (event) {
                event.preventDefault();
                event.stopPropagation();
                var modalName = $(event.target).attr('data-modal');
                _this.modal = $('.modal[data-modal=' + modalName + ']');
                _this.trigger = $(this);
                _this.open();
            });
            //閉じる
            $(document).on('click', '.modal .modal-close', function (event) {
                event.preventDefault();
                _this.close();
            });
            //カバー閉じる
            $(document).on('click', '.modal-cover', function (event) {
                event.preventDefault();
                _this.close();
            });
            //リサイズ
            $(window).on('resize', function (event) {
                if (_this.isOpen()) {
                    _this.resize();
                }
            });
        },
        open: function () {
            this.cover.addClass('active');
            this.modal.addClass('active');
            $('.wrapper').addClass('blur');
            this.resize();
        },
        close: function () {
            if (this.modal && this.cover) {
                this.modal.removeClass('active');
                this.cover.removeClass('active');
                $('.wrapper').removeClass('blur');
            }
        },
        getTrigger: function () {
            return this.trigger;
        },
        isOpen: function () {
            var result = false;
            if (this.modal && this.modal.is(':visible')) {
                result = true;
            }
            return result;
        },
        resize: function () {
            this.modal.removeClass('scroll');
            this.modal.find('.inner').height('auto');
            var height = this.modal.find('.inner').height();
            var top = height / 2;
            var fixHeight = 80;
            if (height > $(window).height() - fixHeight) {
                this.modal.addClass('scroll');
                this.modal.find('.inner').height($(window).height() - fixHeight);
                height = this.modal.find('.inner').height();
                top = height / 2;
            }
            this.modal.css('marginTop', top * -1);
        }
    }
    SASAKI = SASAKI || {};
    SASAKI.Modal = Modal;
} ());
