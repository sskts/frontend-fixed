"use strict";
(function () {
    /**
     * Modal
     * @class Modal
     */
    var Modal = function () {
        this.cover = null;
        this.modal = null;
        this._trigger = null;
        this.init();
    }
    Modal.prototype = {
        /**
         * 初期化
         * @memberof Modal
         * @method init
         * @returns {void}
         */
        init: function () {
            this.cover = $('.modal-cover');
            this.setEvent();
        },
        /**
         * イベント登録
         * @memberof Modal
         * @method setEvent
         * @returns {void}
         */
        setEvent: function () {
            var _this = this;
            //トリガー
            $(document).on('click', 'a[data-modal]', function (event) {
                event.preventDefault();
                event.stopPropagation();
                var modalName = $(this).attr('data-modal');
                _this._trigger = $(this);
                _this.open(modalName);
            });
            //閉じる
            $(document).on('click', '.modal .modal-close', function (event) {
                event.preventDefault();
                _this.close();
            });
            //カバー閉じる
            $(document).on('click', '.modal-cover', function (event) {
                if (_this.modal.hasClass('not-event')) {
                    return;
                }
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
        /**
         * モーダル開く
         * @memberof open
         * @method init
         * @param {string} modalName
         * @returns {void}
         */
        open: function (modalName) {
            var target = $('.modal[data-modal=' + modalName + ']');
            if (target.length !== 1) return;
            this.modal = target;
            this.cover
                .addClass('active')
                .removeClass('disabled');
            this.modal
                .addClass('active')
                .removeClass('disabled');
            $('.wrapper').addClass('blur');
            this.resize();
        },
        /**
         * モーダル閉じる
         * @memberof Modal
         * @method close
         * @returns {void}
         */
        close: function (modalName) {
            if (modalName !== undefined && this.modal.attr('data-modal') !== modalName) {
                return;
            }
            if (this.modal && this.cover) {
                this.modal
                    .removeClass('active')
                    .addClass('disabled');
                this.cover
                    .removeClass('active')
                    .addClass('disabled');
                $('.wrapper').removeClass('blur');
            }
        },
        /**
         * トリガー取得
         * @memberof Modal
         * @method getTrigger
         * @returns {JQuery}
         */
        getTrigger: function () {
            return this._trigger;
        },
        /**
         * モーダル表示判定
         * @memberof Modal
         * @method isOpen
         * @returns {boolean}
         */
        isOpen: function () {
            var result = false;
            if (this.modal && this.modal.is(':visible')) {
                result = true;
            }
            return result;
        },
        /**
         * リサイズ処理
         * @memberof Modal
         * @method resize
         * @returns {void}
         */
        resize: function () {
            this.modal.removeClass('scroll');
            this.modal.find('.inner').height('auto');
            var height = this.modal.find('.inner').height();
            var top = height / 2;
            var fixHeight = 80;
            if (isFixed()) {
                fixHeight = 160;
            }
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
}());
