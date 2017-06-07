"use strict";
(function () {
    /**
     * スクリーンクラス
     * @class ScreenSeatStatusesMap
     */
    var ScreenSeatStatusesMap = function (target) {
        this.screen = target;
        this.scale = 0;
        this._permission = true;
        this.scaleDownCallback = function () { };
        this.scaleUpCallback = function () { };
        this.init();
        this.setEvent();
        this.winWidth = $(window).width(); 
    }

    ScreenSeatStatusesMap.prototype = {
        /**
         * 初期化
         * @memberof ScreenSeatStatusesMap
         * @method init
         * @returns {void}
         */
        init: function () {
            this.state = ScreenSeatStatusesMap.STATE_DEFAULT;
            this.scaleDown();
        },
        /**
         * イベント登録
         * @memberof ScreenSeatStatusesMap
         * @method 
         * @returns {void}
         */
        setEvent: function () {
            var _this = this;
            this.screen.on('click', '.screen-inner', function (event) {
                event.preventDefault();
                if (!_this._permission) return;
                if (!_this.isZoom() && $('.screen .device-type-sp').is(':visible')) {
                    var scroll = _this.screen.find('.screen-scroll');

                    var pos = {
                        x: event.pageX - scroll.offset().left,
                        y: event.pageY - scroll.offset().top
                    };

                    var scrollPos = {
                        x: pos.x / _this.scale - _this.screen.width() / 2,
                        y: pos.y / _this.scale - _this.screen.height() / 2,
                    }

                    _this.scaleUp();
                    scroll.scrollLeft(scrollPos.x);
                    scroll.scrollTop(scrollPos.y);

                }
            });
            $(window).on('resize', function () {
                if (this.winWidth !== $(window).width()) {
                    _this.init();
                    this.winWidth = $(window).width();
                }
            });
        },
        /**
         * 拡大
         * @memberof ScreenSeatStatusesMap
         * @method scaleUp
         * @returns {void}
         */
        scaleUp: function () {
            var scroll = this.screen.find('.screen-scroll');
            var inner = this.screen.find('.screen-inner');
            this.state = ScreenSeatStatusesMap.STATE_ZOOM;
            this.screen.addClass('zoom');
            this.scale = 1;
            scroll.css({
                transformOrigin: '50% 50%',
                transform: 'scale(' + this.scale + ')'
            });
            this.scaleUpCallback();
        },
        /**
         * 縮小
         * @memberof ScreenSeatStatusesMap
         * @method scaleDown
         * @returns {void}
         */
        scaleDown: function () {
            var scroll = this.screen.find('.screen-scroll');
            var inner = this.screen.find('.screen-inner');
            this.state = ScreenSeatStatusesMap.STATE_DEFAULT;
            this.screen.removeClass('zoom');
            this.scale = this.screen.width() / inner.width();
            scroll.height(inner.height() * this.scale);
            scroll.css({
                transformOrigin: '0 0',
                transform: 'scale(' + this.scale + ')'
            });
            this.scaleDownCallback();
        },
        /**
         * 拡大判定
         * @memberof ScreenSeatStatusesMap
         * @method isZoom
         * @returns {boolean}
         */
        isZoom: function () {
            var result = false;
            if (this.state === ScreenSeatStatusesMap.STATE_ZOOM) result = true;
            return result;
        },
        /**
         * 拡大許可
         * @memberof ScreenSeatStatusesMap
         * @method setPermission
         * @returns {void}
         */
        setPermission: function (value) {
            this._permission = value;
        },
        /**
         * 拡大コールバック設定
         * @memberof ScreenSeatStatusesMap
         * @method setScaleUpCallback
         * @param {function} cb
         * @returns {void}
         */
        setScaleUpCallback: function (cb) {
            this.scaleUpCallback = cb;
        },
        /**
         * 縮小コールバック設定
         * @memberof ScreenSeatStatusesMap
         * @method setScaleDownCallback
         * @param {function} cb
         * @returns {void}
         */
        setScaleDownCallback: function (cb) {
            this.scaleDownCallback = cb;
        }
    };

    ScreenSeatStatusesMap.STATE_DEFAULT = 0;
    ScreenSeatStatusesMap.STATE_ZOOM = 1;
    SASAKI = SASAKI || {};
    SASAKI.ScreenSeatStatusesMap = ScreenSeatStatusesMap;
} ());
