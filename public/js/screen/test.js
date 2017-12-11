var screenSeatStatusesMap;
$(function () {
    var params = getParameter();
    $('.page-ttl').text('劇場: ' + params.theater + ' スクリーン: ' + params.screen);
    $('.seat-limit-text').text($('.screen-cover').attr('data-limit'));
    loadingStart();
    screenStateUpdate(function () {
        loadingEnd();
    });

    // 座席クリックイベント
    $(document).on('click', '.zoom-btn a', function (event) {
        event.preventDefault();
        if (screenSeatStatusesMap.isZoom()) {
            screenSeatStatusesMap.scaleDown();
        }
    });

});



/**
 * スクリーン状態取得
 * @function getScreenStateReserve
 * @param {number} count
 * @param {function} cb
 * @returns {void}
 */
function getScreenStateReserve(count, cb) {
    var params = getParameter();
    if (params.theater === undefined || params.screen === undefined) {
        alert('パラメータが不適切です');
    }
    var target = $('.screen-cover');
    $.ajax({
        dataType: 'json',
        url: '/screen',
        type: 'POST',
        timeout: 10000,
        data: {
            theaterCode: params.theater, // 施設コード
            screenCode: params.screen, // スクリーンコード
        },
        beforeSend: function () { }
    }).done(function (res) {
        if (!res.result) return retry(count, cb);
        cb(res.result);
        loadingEnd();
    }).fail(function (jqxhr, textStatus, error) {
        retry(count, cb)
    }).always(function () {
        
    });
}

/**
 * リトライ
 * @function retry
 * @param {number} count
 * @param {function} cb
 * @returns {void}
 */
function retry(count, cb) {
    count++;
    var limit = 10;
    if (count > limit) return location.replace = '/error';
    var timer = 3000;
    setTimeout(function () {
        getScreenStateReserve(count, cb);
    }, timer);
}

/**
 * スクリーン状態更新
 * @function screenStateChange
 * @param {Object} state
 * @returns {void}
 */
function screenStateChange(state) {
    var screen = $('.screen');
    //席状態変更
    $('.seat a').addClass('disabled');

    var purchaseSeats = ($('input[name=seats]').val()) ? JSON.parse($('input[name=seats]').val()) : '';
    if (purchaseSeats) {
        //予約している席設定
        for (var i = 0, len = purchaseSeats.listTmpReserve.length; i < len; i++) {
            var purchaseSeat = purchaseSeats.listTmpReserve[i];
            var seatNum = purchaseSeat.seatNum;
            var seat = $('.seat a[data-seat-code=' + seatNum + ']');
            seat.removeClass('disabled');
            seat.addClass('active');
        }
    }
    if (state && state.cntReserveFree > 0) {
        //空いている座席設定
        var freeSeats = state.listSeat[0].listFreeSeat;
        for (var i = 0, len = freeSeats.length; i < len; i++) {
            var freeSeat = freeSeats[i];
            // var seatNum = replaceHalfSize(freeseat.seatNum);
            var seat = $('.seat a[data-seat-code=' + freeSeat.seatNum + ']');
            if (seat && !seat.hasClass('active')) {
                seat.removeClass('disabled');
                seat.addClass('default');
            }
        }
    }
}

/**
 * スクリーン状態更新
 * @function screenStateUpdate
 * @param {function} cb
 * @returns {void}
 */
function screenStateUpdate(cb) {
    getScreenStateReserve(0, function (result) {
        createScreen(result.setting, result.screen);
        screenStateChange(result.state);
        var screen = $('.screen');
        screen.css('visibility', 'visible');
        screenSeatStatusesMap = new SASAKI.ScreenSeatStatusesMap(screen);
        screenSeatStatusesMap.setScaleUpCallback(function () {
            $('.zoom-btn').show();
            zoomButtonScroll();
        });
        screenSeatStatusesMap.setScaleDownCallback(function () {
            $('.zoom-btn').hide();
        });
        cb();
    });
}

