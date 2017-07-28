$(function () {
    getPerformances();

    // 照会クリック
    $(document).on('click', '.inquiry-button a', function (event) {
        event.preventDefault();
        var theater = $('select[name=theater]').val();
        var url = $(this).attr('href') + '?theater=' + theater;
        location.href = url;
    });
    // 検索セレクト
    $(document).on('change', 'select[name=theater], select[name=date], select[name=type]', function (event) {
        getPerformances();
    });
});

/**
 * パフォーマンスリスト取得
 * @function getPerformances
 * @returns {void}
 */
function getPerformances() {
    var performancesDom = $('.performances');
    var noPerformancesDom = $('.no-performances');
    performancesDom.hide();
    noPerformancesDom.hide();
    var theater = $('select[name=theater]').val();
    if (isFixed()) {
        // 券売機
        theater = config.theater;
    }
    var day = $('select[name=date]').val();
    $.ajax({
        dataType: 'json',
        url: '/purchase/performances',
        type: 'POST',
        timeout: 10000,
        data: {
            theater: theater,
            day: day
        },
        beforeSend: function () {
            loadingStart();
        }
    }).done(function (res) {
        if (res.error || res.result.length === 0) {
            console.log(res);
            noPerformancesDom.show();
        } else {
            var html = createSchedule(res.result);
            performancesDom.html(html);
            performancesDom.show();
        }
    }).fail(function (jqxhr, textStatus, error) {
        console.log(jqxhr, textStatus, error);
        noPerformancesDom.show();
    }).always(function () {
        loadingEnd();
    });
}

/**
 * スケジュール作成
 * @function createSchedule
 * @param {any[]} individualScreeningEvents
 * @returns {string}
 */
function createSchedule(individualScreeningEvents) {
    console.log(individualScreeningEvents)
    // 作品別へ変換
    var films = [];
    individualScreeningEvents.forEach(function (screeningEvent) {
        var film = films.find(function (film) {
            return (film.coaInfo.titleCode + film.coaInfo.titleBranchNum === screeningEvent.coaInfo.titleCode + screeningEvent.coaInfo.titleBranchNum);
        });
        if (film === undefined) {
            films.push({
                coaInfo: screeningEvent.coaInfo,
                identifier: screeningEvent.identifier,
                workPerformed: screeningEvent.workPerformed,
                name: screeningEvent.name,
                startDate: screeningEvent.startDate,
                endDate: screeningEvent.endDate,
                screeningEvents: [screeningEvent]
            });
        } else {
            film.screeningEvents.push(screeningEvent);
        }
    });
    // HTML生成
    var dom = [];
    films.forEach(function (film) {
        dom.push(createScheduleDom(film));
    });
    return dom.join('\n');
}

/**
 * スケジュールHTML作成
 * @function createScheduleDom
 * @param {any} data
 * @returns {string}
 */
function createScheduleDom(data) {
    /**
     * 販売終了時間 30分前
     */
    var END_TIME_DEFAULT = 30;
    /**
     * 販売終了時間(券売機) 10分後
     */
    var END_TIME_FIXED = -10;

    var screeningEvents = [];
    data.screeningEvents.forEach(function (screeningEvent) {
        // 販売可能時間判定
        var limit = (isFixed()) ? END_TIME_FIXED : END_TIME_DEFAULT;
        var limitTime = moment().add(limit, 'minutes');
        if (limitTime.unix() > moment(screeningEvent.startDate).unix()) {
            return;
        }
        var type = $('select[name=type]').val();
        var link = (type === '0')
            ? '/purchase?id=' + screeningEvent.identifier
            : (type === '1') ? '/purchase/app.html?id=' + screeningEvent.identifier
                : '';
        if (isFixed()) {
            // 券売機
            link = '/purchase/fixed.html?id=' + screeningEvent.identifier;
        }
        // 販売ステータス設定
        var status = (screeningEvent.stockStatus === 0) ? ' ×'
            : (performance.stockStatus <= 10) ? ' △'
                : '';
        var disabled = (screeningEvent.stockStatus === 0) ? 'disabled' : '';
        screeningEvents.push('<li class="button small-button gray-button ' + disabled + '">' +
            '<a href="' + link + '" class="icon-triangle-02">' +
            '<div class="mb-x-small">' + timeFormat(screeningEvent.coaInfo.timeBegin) + '</div>' +
            '<div class="small-text mb-x-small">～' + timeFormat(screeningEvent.coaInfo.timeEnd) + '</div>' +
            '<div class="small-text">' + screeningEvent.location.name.ja + status + '</div>' +
            '</a>' +
            '</li>');
    });

    if (screeningEvents.length === 0) return '';

    return ('<li class="performance mb-small">' +
        '<dl>' +
        '<dt class="small-text"><span class="film-ttl">作品名</span><strong>' + data.workPerformed.name + '</strong></dt>' +
        '<dd>' +
        '<div class="mb-small small-text"><span class="date-ttl">上映時間</span><strong>' + 0 + '分</strong></div>' +
        '<ul>' +
        screeningEvents.join('\n') +
        '</ul>' +
        '</dd>' +
        '</dl>' +
        '</li>');
}