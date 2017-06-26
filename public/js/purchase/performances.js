$(function () {
    getPerformances();
    
    // 照会クリック
    $(document).on('click', '.inquiry-button a', function (event) {
        event.preventDefault();
        var theater = $('.inquiry-theater select').val();
        var url = $(this).attr('href') + '?theater=' + theater;
        location.href = url;
    });
    // 検索クリック
    $(document).on('click', '.search a', function (event) {
        event.preventDefault();
        getPerformances();
    });
    // 検索セレクト
    $(document).on('change', '.date select', function (event) {
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
    var theater = $('.theater select').val();
    if (isFixed()) {
        // 券売機
        theater = config.theater;
    }
    var day = $('.date select').val();
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
 * @param {any[]} performances
 * @returns {string}
 */
function createSchedule(performances) {
    // 作品別へ変換
    var films = [];
    performances.forEach(function (performance) {
        var film = films.find(function (film) {
            return (film.id === performance.attributes.film.id)
        });
        if (film === undefined) {
            films.push({
                id: performance.attributes.film.id,
                performances: [performance]
            });
        } else {
            film.performances.push(performance)
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

    var performances = [];
    data.performances.forEach(function (performance) {
        // 販売可能時間判定
        var limit = (isFixed()) ? END_TIME_FIXED : END_TIME_DEFAULT;
        var limitTime = moment().add(limit, 'minutes');
        if (limitTime.unix() > moment(`${performance.attributes.day} ${performance.attributes.time_start}`).unix()) {
            return;
        }

        var link = '/purchase?id=' + performance.id;
        if (isFixed()) {
            // 券売機
            link = '/purchase/fixed.html?id=' + performance.id;
        }
        // 販売ステータス設定
        var disabled = (performance.attributes.stock_status === '×') ? 'disabled' : '';
        performances.push('<li class="button small-button gray-button ' + disabled + '">'+
            '<a href="'+ link +'" class="icon-triangle-02">'+ 
            '<div class="mb-x-small">' + timeFormat(performance.attributes.time_start) + '</div>' + 
            '<div class="small-text mb-x-small">～' + timeFormat(performance.attributes.time_end) + '</div>' + 
            '<div class="small-text">' + performance.attributes.screen.name.ja + ' ' + performance.attributes.stock_status + '</div>' + 
            '</a>' +
        '</li>');
    });

    if (performances.length === 0) return '';

    return ('<li class="performance mb-small">' +
        '<dl>' +
            '<dt class="small-text"><strong>作品名</strong>' + data.performances[0].attributes.film.name.ja + '</dt>' +
            '<dd>'+
                '<div class="mb-small small-text"><strong>上映時間</strong>' + data.performances[0].attributes.film.minutes + '分</div>'+
                '<ul>'+
                    performances.join('\n') +
                '</ul>'+
            '</dd>' +
        '</dl>' +
    '</li>');
}