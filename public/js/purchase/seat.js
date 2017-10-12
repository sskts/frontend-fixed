var screenSeatStatusesMap;

$(function () {
    var reserveError = $('input[name=reserveError]').val();
    pageInit(function () {
        if (reserveError) {
            modal.open('reserveError');
            return;
        }
        if (isFixed()) {
            showSeatSelectAnnounce();
        }
    });

    // 拡大クリックイベント
    $(document).on('click', '.zoom-btn a', zoomButtonClick);

    // 座席クリックイベント
    $('.screen').on('click', '.seat a', seatClick);

    // 次へクリックイベント
    $(document).on('click', '.next-button button', nextButtonClick);

    // パフォーマンス切り替え
    $(document).on('click', '.arrow a', performanceChangeClick);

    // スクロール
    $(window).on('scroll', function (event) {
        zoomButtonScroll();
    });
});

/**
 * 拡大クリックイベント
 * @function zoomButtonClick
 * @param {Event} event 
 */
function zoomButtonClick(event) {
    event.preventDefault();
    if (screenSeatStatusesMap.isZoom()) {
        screenSeatStatusesMap.scaleDown();
    }
}

/**
 * 座席クリックイベント
 * @function seatClick
 * @param {Event} event 
 */
function seatClick(event) {
    event.preventDefault();
    //スマホで拡大操作
    if ($('.screen .device-type-sp').is(':visible') && !screenSeatStatusesMap.isZoom()) {
        return;
    }
    var limit = Number($('.screen-cover').attr('data-limit'));
    if ($(this).hasClass('disabled')) {
        return;
    }
    // 座席数上限チェック
    if (!$(this).hasClass('active')) {
        if ($('.screen .seat a.active').length > limit - 1) {
            modal.open('seatUpperLimit');
            return;
        }
    }

    $(this).toggleClass('active');
}

/**
 * 次へクリックイベント
 * @function nextButtonClick
 * @param {*} event 
 */
function nextButtonClick(event) {
    event.preventDefault();
    // 座席コードリストを取得
    var seats = {
        listTmpReserve: []
    };
    $('.screen .seat a.active').each(function (index, elem) {
        seats.listTmpReserve.push({
            seatNum: $(this).attr('data-seat-code'),
            seatSection: '0'
        });
    });

    if (seats.listTmpReserve.length < 1) {
        modal.open('seatNotSelect');
        return;
    }
    validation();
    if ($('.validation-text').length > 0) {
        validationScroll();
        return;
    }

    var reserveTickets = [];
    var form = $('form');
    $('input[name=seats]').val(JSON.stringify(seats));

    loadingStart(function () {
        form.submit();
    });
}

/**
 * パフォーマンス切り替えクリック
 * @function performanceChangeClick
 * @param {Event} event 
 */
function performanceChangeClick(event) {
    event.preventDefault();
    var performanceId = $(this).attr('data-performanceId');
    arrowClick(performanceId);
}

/**
 * 初期化
 * @function pageInit
 * @param {function} cb
 */
function pageInit(cb) {
    $('.seat-limit-text').text($('.screen-cover').attr('data-limit'));
    saveSalesTickets();
    loadingStart();
    if (isFixed()) {
        setArrows();
    }
    screenStateUpdate(function () {
        loadingEnd();
        if (cb !== undefined) {
            cb();
        }
    });
}

/**
 * 次の時間帯へ説明表示
 * @function showSeatSelectAnnounce
 * @returns {void}
 */
function showSeatSelectAnnounce() {
    setTimeout(function() {
        var json = sessionStorage.getItem('performances');
        if (json === null) {
            return;
        }
        var performances = JSON.parse(json);
        if (performances.length === 1) {
            return;
        }
        modal.open('seatSelectAnnounce');
        setTimeout(function() {
            modal.close('seatSelectAnnounce');
        }, 5000);
    }, 0);
}

/**
 * ズームボタンスクロール
 * @function zoomButtonScroll
 * @returns {void}
 */
function zoomButtonScroll() {
    if (screenSeatStatusesMap && !screenSeatStatusesMap.isZoom()) return;
    var win = $(window);
    var winTop = win.scrollTop();
    var screen = $('.screen');
    var screenTop = screen.offset().top;
    var screenRight = screen.offset().left;
    if (isFixed()) {
        screenRight = screen.offset().left - $('.navigation').width();
    }
    var screenH = screen.height();
    var target = $('.zoom-btn');
    var targetH = target.height();
    var fixH = 10;
    if (screenTop < winTop && (screenTop + screenH - targetH - fixH * 2) > winTop) {
        target.css({ top: fixH + 'px', right: screenRight + fixH + 'px' });
        target.addClass('scroll');
    } else if ((screenTop + screenH - targetH - fixH * 2) < winTop) {
        target.css({ top: screenH - targetH - fixH + 'px', right: fixH + 'px' });
        target.removeClass('scroll');
    } else {
        target.css({ top: fixH + 'px', right: fixH + 'px' });
        target.removeClass('scroll');
    }
}

/**
 * スクリーン状態取得
 * @function getScreenStateReserve
 * @param {number} count
 * @param {function} cb
 * @returns {void}
 */
function getScreenStateReserve(count, cb) {
    var target = $('.screen-cover');
    $.ajax({
        dataType: 'json',
        url: '/purchase/getScreenStateReserve',
        type: 'POST',
        timeout: 10000,
        data: {
            theaterCode: target.attr('data-theater'), // 施設コード
            dateJouei: target.attr('data-day'), // 上映日
            titleCode: target.attr('data-coa-title-code'), // 作品コード
            titleBranchNum: target.attr('data-coa-title-branch-num'), // 作品枝番
            timeBegin: target.attr('data-time-start'), // 上映時刻
            screenCode: target.attr('data-screen-code'), // スクリーンコード
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
 * 券種情報をセションへ保存
 * @function saveSalesTickets
 * @returns {void}
 */
function saveSalesTickets() {
    var target = $('.screen-cover');
    $.ajax({
        dataType: 'json',
        url: '/purchase/saveSalesTickets',
        type: 'POST',
        timeout: 10000,
        data: {
            theaterCode: target.attr('data-theater'), // 施設コード
            dateJouei: target.attr('data-day'), // 上映日
            titleCode: target.attr('data-coa-title-code'), // 作品コード
            titleBranchNum: target.attr('data-coa-title-branch-num'), // 作品枝番
            timeBegin: target.attr('data-time-start'), // 上映時刻
            screenCode: target.attr('data-screen-code'), // スクリーンコード
        }
    }).done(function (res) {
    }).fail(function (jqxhr, textStatus, error) {
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
        for (var i = 0, len = purchaseSeats.result.updTmpReserveSeatResult.listTmpReserve.length; i < len; i++) {
            var purchaseSeat = purchaseSeats.result.updTmpReserveSeatResult.listTmpReserve[i];
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
            // var seatNum = replaceHalfSize(freeSeat.seatNum);
            var seat = $('.seat a[data-seat-code=' + freeSeat.seatNum + ']');
            if (seat && !seat.hasClass('active')) {
                seat.removeClass('disabled');
                seat.addClass('default');
            }
        }
    }
}

/**
 * スクリーン生成
 * @function createScreen
 * @param {Object} setting スクリーン共通設定
 * @param {Object} screen スクリーン固有設定
 * @returns {JQuery}
 */
function createScreen(setting, screen) {
    var screenDom = $('.screen .screen-scroll');

    //html挿入の場合
    if (screen.html) {
        return screenDom.append(screen.html);
    }

    //通路大きさ
    var aisle = (screen.aisle) ? screen.aisle : setting.aisle;
    //座席同士の間隔
    var seatMargin = (screen.seatMargin) ? screen.seatMargin : setting.seatMargin;
    //座席の大きさ
    var seatSize = (screen.seatSize) ? screen.seatSize : setting.seatSize;
    //座席の大きさ
    var seatSize = (screen.seatSize) ? screen.seatSize : setting.seatSize;
    //座席ラベル位置
    var seatLabelPos = (screen.seatLabelPos) ? screen.seatLabelPos : setting.seatLabelPos;
    //座席番号位置
    var seatNumberPos = (screen.seatNumberPos) ? screen.seatNumberPos : setting.seatNumberPos;

    //y軸ラベル
    var labels = [];
    var startLabelNo = 65;
    var endLabelNo = 91;
    for (var i = startLabelNo; i < endLabelNo; i++) {
        labels.push(String.fromCharCode(i));
    }

    //ポジション
    var pos = { x: 0, y: 0 };

    //HTML
    var objectsHtml = [];
    var seatNumberHtml = [];
    var seatLabelHtml = [];
    var seatHtml = [];
    var labelCount = 0;

    for (var i = 0; i < screen.objects.length; i++) {
        var object = screen.objects[i];
        objectsHtml.push('<div class="object" style="' +
            'width: ' + object.w + 'px; ' +
            'height: ' + object.h + 'px; ' +
            'top: ' + object.y + 'px; ' +
            'left: ' + object.x + 'px; ' +
            'background-image: url(' + object.image + '); ' +
            'background-size: ' + object.w + 'px ' + object.h + 'px; ' +
            '"></div>');
    }

    for (var y = 0; y < screen.map.length; y++) {
        if (y === 0) pos.y = 0;
        //ポジション設定
        if (y === 0) {
            pos.y += screen.seatStart.y;
        } else if (screen.map[y].length === 0) {
            pos.y += aisle.middle.h - seatMargin.h;
        } else {
            labelCount++;
            pos.y += seatSize.h + seatMargin.h;
        }

        for (var x = 0; x < screen.map[y].length; x++) {
            if (x === 0) pos.x = screen.seatStart.x;

            //座席ラベルHTML生成
            if (x === 0) {
                seatLabelHtml.push('<div class="object label-object" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px; top:' + pos.y + 'px; left:' + (pos.x - seatLabelPos) + 'px">' + labels[labelCount] + '</div>');
            }

            if (screen.map[y][x] === 8) {
                pos.x += aisle.middle.w;
            } else if (screen.map[y][x] === 9) {
                pos.x += aisle.middle.w;
            }

            //座席番号HTML生成
            if (y === 0) {
                seatNumberHtml.push('<div class="object label-object" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px; top:' + (pos.y - seatNumberPos) + 'px; left:' + pos.x + 'px">' + (x + 1) + '</div>');
            }
            if (screen.map[y][x] === 1 || screen.map[y][x] === 4 || screen.map[y][x] === 5 || screen.map[y][x] === 8) {
                //座席HTML生成
                var code = toFullWidth(labels[labelCount]) + '－' + toFullWidth(String(x + 1)); //Ａ－１９
                var label = labels[labelCount] + String(x + 1);
                if (screen.hc.indexOf(label) !== -1) {
                    seatHtml.push('<div class="seat seat-hc" style="top:' + pos.y + 'px; left:' + pos.x + 'px">' +
                        '<a href="#" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px" data-seat-code="' + code + '"><span>' + label + '</span></a>' +
                        '</div>');
                } else {
                    seatHtml.push('<div class="seat" style="top:' + pos.y + 'px; left:' + pos.x + 'px">' +
                        '<a href="#" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px" data-seat-code="' + code + '"><span>' + label + '</span></a>' +
                        '</div>');
                }

            }
            //ポジション設定
            if (screen.map[y][x] === 2) {
                pos.x += aisle.middle.w + seatMargin.w;
            } else if (screen.map[y][x] === 3) {
                pos.x += aisle.small.w + seatMargin.w;
            } else if (screen.map[y][x] === 4) {
                pos.x += aisle.middle.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 5) {
                pos.x += aisle.small.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 6) {
                pos.x += aisle.middle.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 7) {
                pos.x += aisle.small.w + seatSize.w + seatMargin.w;
            } else {
                pos.x += seatSize.w + seatMargin.w;
            }
        }
    }
    //スクリーンタイプ
    var type = '';
    switch (screen.type) {
        case 1:
            type = 'screen-imax';
            break;
        case 2:
            type = 'screen-4dx';
            break;
        default:
            type = '';
            break;
    }
    $('.screen-cover').addClass(type);
    var html = '<div class="screen-inner" style=" width: ' + screen.size.w + 'px; height: ' + screen.size.h + 'px;">' +
        objectsHtml.join('\n') +
        seatNumberHtml.join('\n') +
        seatLabelHtml.join('\n') +
        seatHtml.join('\n') +
        '<div>';

    return screenDom.append(html);
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

/**
 * バリデーションスクロール
 * @function validationScroll
 * @returns {void}
 */
function validationScroll() {
    var target = $('.validation').eq(0);
    var top = target.offset().top - 20;
    $('html,body').animate({ scrollTop: top }, 300);
}

/**
 * バリデーション
 * @function validation
 * @returns {void}
 */
function validation() {
    $('.validation').removeClass('validation');
    $('.validation-text').remove();

    var validationList = [
        { name: 'agree', label: locales.label.agree, agree: true },
    ];

    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + ']');
        var value = target.val();

        if (validation.required
            && !value
            && value == '') {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.required + '</div>');
        } else if (validation.maxLength
            && value.length > validation.maxLength) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.required + '</div>');
        } else if (validation.regex
            && !value.match(validation.regex[0])) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + validation.regex[1] + '</div>');
        } else if (validation.equals
            && value !== $('input[name=' + validation.equals + ']').val()) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.equals + '</div>');
        } else if (validation.agree
            && !target.is(':checked')) {
            target = $('label[for=' + validation.name + ']');
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.agree + '</div>');
        }
    });
}

/**
 * 時間変更ボタン初期化
 * @function setArrows
 * @returns {void}
 */
function setArrows() {
    $('.arrow').hide();
    var performanceId = $('input[name=performanceId]').val();
    var json = sessionStorage.getItem('performances');
    if (json === null) {
        return;
    }
    var performances = JSON.parse(json);
    if (performances.length < 2) {
        return;
    }
    var current;
    performances.forEach(function(value, index){
        if (value.id === performanceId) {
            current = index;
            return;
        }
    });
    var prev = $('.prev-arrow');
    var next = $('.next-arrow');
    if (current === 0) {
        prev.hide();
        next.find('.time').text(performances[current + 1].startTime);
        next.find('a').attr('data-performanceId', performances[current + 1].id);
        next.show();
    } else if (current === performances.length - 1) {
        next.hide();
        prev.find('.time').text(performances[current - 1].startTime);
        prev.find('a').attr('data-performanceId', performances[current - 1].id);
        prev.show();
    } else {
        prev.find('.time').text(performances[current - 1].startTime);
        prev.find('a').attr('data-performanceId', performances[current - 1].id);
        prev.show();
        next.find('.time').text(performances[current + 1].startTime);
        next.find('a').attr('data-performanceId', performances[current + 1].id);
        next.show();
    }
}

/**
 * 作品変更クリック
 * @function arrowClick
 * @param {string} performanceId 
 */
function arrowClick(performanceId) {
    loadingStart();
    $.ajax({
        dataType: 'json',
        url: '/purchase/performanceChange',
        type: 'POST',
        timeout: 10000,
        data: {
            performanceId: performanceId
        },
        beforeSend: function () { }
    }).done(function (res) {
        if (res.result && res.error !== null) {
            $('input[name=seats]').val('');
            $('.screen-inner').remove();
            var target = $('.screen-cover');
            var individualScreeningEvent = res.result.individualScreeningEvent;
            target.attr({
                'data-limit': individualScreeningEvent.coaInfo.availableNum,
                'data-theater': individualScreeningEvent.coaInfo.theaterCode,
                'data-day': individualScreeningEvent.coaInfo.dateJouei,
                'data-coa-title-code': individualScreeningEvent.coaInfo.titleCode,
                'data-coa-title-branch-num': individualScreeningEvent.coaInfo.titleBranchNum,
                'data-time-start': individualScreeningEvent.coaInfo.timeBegin,
                'data-screen-code': individualScreeningEvent.coaInfo.screenCode
            });
            $('input[name=performanceId]').val(individualScreeningEvent.identifier);
            $('.screen-name').text(individualScreeningEvent.location.name.ja);
            $('.time-start').text(timeFormat(individualScreeningEvent.startDate, individualScreeningEvent.coaInfo.dateJouei));
            $('.time-end').text(timeFormat(individualScreeningEvent.endDate, individualScreeningEvent.coaInfo.dateJouei));
            $('.performance-date').removeClass('change-animation');
            pageInit(function() {
                $('.performance-date').addClass('change-animation');
            });
        } else {
            $('.purchase-seat').remove();
            $('.error').find('.access').hide();
            $('.error').find('.expire').show();
            $('.error').show();
            loadingEnd();
        }
    }).fail(function (jqxhr, textStatus, error) {
        loadingEnd();
    }).always(function () {

    });
}
