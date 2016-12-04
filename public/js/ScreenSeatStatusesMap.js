"use strict";
var ScreenSeatStatusesMap = (function () {
    function ScreenSeatStatusesMap(target) {
        this.resizeTimer = null;
        this.target = target;
        this.init();
        this.setEvent();
    }
    //初期化
    ScreenSeatStatusesMap.prototype.init = function () {
        this.state = ScreenSeatStatusesMap.STATE_DEFAULT;
        this.pos = {
            x: 0,
            y: 0
        };
    };
    //スクリーン背景画像取得
    ScreenSeatStatusesMap.prototype.getBgImage = function (target) {
        var image = new Image();
        image.src = target.css('backgroundImage').replace(/url\(['"]*(.*?)['"]*\)/g, '$1');
        return $(image);
    };
    //イベント
    ScreenSeatStatusesMap.prototype.setEvent = function () {
        var _this = this;
        this.getBgImage(this.target.find('.screen-inner')).on('load', function () {
            _this.loadHandler();
        });
        $(window).on('resize', function () {
            if (_this.resizeTimer) {
                clearTimeout(_this.resizeTimer);
            }
            _this.resizeTimer = setTimeout(function () {
                _this.resizeHandler();
            }, 300);
        });
        this.target.on('click', function (e) {
            if (_this.isDeviceType('sp')) {
                _this.screenClickHandler(e);
            }
        });
        this.target.find('.zoom-btn a').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this.resize();
        });
        this.target.on('touchstart', function (e) {
            if (_this.isDeviceType('sp')) {
                if (_this.isZoomState()) {
                    _this.screenTouchStartHandler(e);
                }
            }
        });
        this.target.on('touchmove', function (e) {
            if (_this.isDeviceType('sp')) {
                if (_this.isZoomState()) {
                    e.preventDefault();
                    _this.screenTouchMoveHandler(e);
                }
            }
        });
        this.target.on('touchend', function (e) {
            if (_this.isDeviceType('sp')) {
                if (_this.isZoomState()) {
                    _this.screenTouchEndHandler(e);
                }
            }
        });
        this.target.find('.seat').each(function (i, elm) {
            $(elm).find('a').on('mouseover', function () {
                if (_this.isDeviceType('pc')) {
                    _this.seatMouseoverHandler($(elm));
                }
            });
        });
        this.target.find('.seat').each(function (i, elm) {
            $(elm).find('a').on('mouseout', function () {
                if (_this.isDeviceType('pc')) {
                    _this.seatMouseoutHandler($(elm));
                }
            });
        });
    };
    //座席マウスアウト処理
    ScreenSeatStatusesMap.prototype.seatMouseoutHandler = function (target) {
        var balloon = $('.balloon');
        balloon.removeClass('active');
    };
    //座席マウスオーバー処理
    ScreenSeatStatusesMap.prototype.seatMouseoverHandler = function (target) {
        var balloon = $('.balloon');
        var content = target.find('a').attr('data-seat-code'); //表示テキスト
        balloon.addClass('active');
        balloon.html(content);
        var top = target.position().top + target.height() + 10;
        var left = target.position().left + target.width() / 2 - balloon.outerWidth() / 2;
        balloon.css({
            top: top,
            left: left
        });
    };
    //ポジションセット
    ScreenSeatStatusesMap.prototype.setPosition = function (x, y) {
        this.pos = {
            x: x,
            y: y
        };
    };
    //ズーム判定
    ScreenSeatStatusesMap.prototype.isZoomState = function () {
        return (this.state === ScreenSeatStatusesMap.STATE_ZOOM);
    };
    //ロード時処理
    ScreenSeatStatusesMap.prototype.loadHandler = function () {
        this.resize();
    };
    //リサイズ処理
    ScreenSeatStatusesMap.prototype.resizeHandler = function () {
        this.resize();
    };
    //スクリーンクリック処理
    ScreenSeatStatusesMap.prototype.screenClickHandler = function (event) {
        var inner = this.target.find('.screen-inner');
        var x = event.pageX - this.target.offset().left;
        var y = event.pageY - this.target.offset().top;
        if (!this.isZoomState()) {
            this.zoom(x, y);
        }
    };
    //スクリーンタッチスタート処理
    ScreenSeatStatusesMap.prototype.screenTouchStartHandler = function (event) {
        var inner = this.target.find('.screen-inner');
        var pageX = event.originalEvent.touches[0].pageX;
        var pageY = event.originalEvent.touches[0].pageY;
        var x = pageX - this.target.offset().left;
        var y = pageY - this.target.offset().top;
        this.setPosition(x, y);
        inner.removeClass('transition');
    };
    //スクリーンタッチムーブ処理
    ScreenSeatStatusesMap.prototype.screenTouchMoveHandler = function (event) {
        var inner = this.target.find('.screen-inner');
        var pageX = event.originalEvent.touches[0].pageX;
        var pageY = event.originalEvent.touches[0].pageY;
        var x = pageX - this.target.offset().left;
        var y = pageY - this.target.offset().top;
        var left = inner.position().left - (this.pos.x - x);
        var top = inner.position().top - (this.pos.y - y);
        inner.css({
            top: top,
            left: left
        });
        this.setPosition(x, y);
    };
    //スクリーンタッチエンド処理
    ScreenSeatStatusesMap.prototype.screenTouchEndHandler = function (event) {
    };
    //スクリーンズーム処理
    ScreenSeatStatusesMap.prototype.zoom = function (x, y) {
        var parent = this.target.parent();
        var inner = this.target.find('.screen-inner');
        var ratio = parent.width() / inner.width();
        var zoom = 2;
        var top = (this.target.height() / 2) - (y * zoom);
        var left = (parent.width() / 2) - (x * zoom);
        inner.addClass('transition');
        inner.css({
            top: top,
            left: left,
            transform: 'scale(' + zoom * ratio + ')'
        });
        this.state = ScreenSeatStatusesMap.STATE_ZOOM;
        this.target.find('.zoom-btn').addClass('active');
    };
    //スクリーンリサイズ処理
    ScreenSeatStatusesMap.prototype.resize = function () {
        var parent = this.target.parent();
        var inner = this.target.find('.screen-inner');
        if (this.isDeviceType('sp')) {
            var balloon = $('.balloon');
            balloon.removeClass('active');
            var ratio = parent.width() / inner.width();
            inner.css({
                top: 0,
                left: 0,
                transformOrigin: '0 0',
                transform: 'scale(' + ratio + ')'
            });
            this.target.height(inner.height() * ratio);
            this.target.find('.zoom-btn').removeClass('active');
        }
        else {
            inner.css({
                top: 0,
                left: 0,
                transform: 'none'
            });
            this.target.height(inner.height());
            this.target.find('.zoom-btn').removeClass('active');
        }
        this.state = ScreenSeatStatusesMap.STATE_DEFAULT;
    };
    //デバイス判定
    ScreenSeatStatusesMap.prototype.isDeviceType = function (type) {
        var target;
        if (type.toLowerCase() === 'pc') {
            target = $('.device-type-pc');
        }
        else if (type.toLowerCase() === 'sp') {
            target = $('.device-type-sp');
        }
        if (target.is(':visible')) {
            return true;
        }
        return false;
    };
    ScreenSeatStatusesMap.STATE_DEFAULT = 0;
    ScreenSeatStatusesMap.STATE_ZOOM = 1;
    return ScreenSeatStatusesMap;
}());
