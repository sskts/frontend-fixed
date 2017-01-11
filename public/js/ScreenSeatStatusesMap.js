"use strict";
(function () {
    var ScreenSeatStatusesMap = function (target) {
        this.screen = target;
        this.scale = 0;
        this.init();
        this.setEvent();
    }
    
    ScreenSeatStatusesMap.prototype = {
        //初期化
        init: function () {
            this.state = ScreenSeatStatusesMap.STATE_DEFAULT;
            this.scaleDown();
        },
        //イベント登録
        setEvent: function () {
            var _this = this;
            this.screen.on('click', '.zoom-btn a', function(event) {
                event.preventDefault();
                if (_this.screen.hasClass('zoom')) {
                    _this.scaleDown();
                } else {
                    _this.scaleUp();
                }
            });
            this.screen.on('click', '.screen-inner', function(event) {
                event.preventDefault();
                if (!_this.isZoom() && $('.device-type-sp').is(':visible')) {
                    var pos = {
                        x: event.clientX - $(this).offset().left,
                        y: event.clientY - $(this).offset().top
                    };                    
                    var scrollPos = {
                        x: pos.x / _this.scale - _this.screen.width() / 2,
                        y: pos.y/ _this.scale - _this.screen.height() / 2,
                    }
                    _this.scaleUp();
                    _this.screen.find('.screen-scroll').scrollLeft(scrollPos.x);
                    _this.screen.find('.screen-scroll').scrollTop(scrollPos.y);
                    // _this.screen.find('.screen-scroll').animate({
                    //     scrollLeft: scrollPos.x, scrollTop: scrollPos.y
                    // }, 200);
                }
            });
            $(window).on('resize', function() {
                _this.init();
            });
        },
        //拡大
        scaleUp: function () {
            this.state = ScreenSeatStatusesMap.STATE_ZOOM;
            this.screen.addClass('zoom');
            this.scale = 1;
            this.screen.find('.screen-scroll').css({transform:'scale('+ this.scale +')'});
        },
        //縮小
        scaleDown: function () {
            this.state = ScreenSeatStatusesMap.STATE_DEFAULT;
            this.screen.removeClass('zoom');
            this.scale = this.screen.width() / this.screen.find('.screen-inner').width();
            this.screen.find('.screen-scroll').height(this.screen.find('.screen-inner').height() * this.scale);
            this.screen.find('.screen-scroll').css({
                transformOrigin: '0 0',
                transform:'scale('+ this.scale +')'
            });
        },
        //拡大判定
        isZoom: function() {
            var result = false;
            if (this.state === ScreenSeatStatusesMap.STATE_ZOOM) result = true;
            return result;
        }
    };
    
    ScreenSeatStatusesMap.STATE_DEFAULT = 0;
    ScreenSeatStatusesMap.STATE_ZOOM = 1;
    SASAKI = SASAKI || {};
    SASAKI.ScreenSeatStatusesMap = ScreenSeatStatusesMap;
}());
