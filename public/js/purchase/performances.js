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
        $('.performances').html('');
        if (res.error) {

        } else {
            console.log(res)
            createSchedule(res.result)
            var performances = res.result;
            
        }
    }).fail(function (jqxhr, textStatus, error) {
        console.log(jqxhr, textStatus, error)
    }).always(function () {
        loadingEnd();
    });
}

/**
 * スケジュール作成
 * @function createSchedule
 * @param {any[]} performances
 * @returns {void}
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
    $('.performances').append(dom.join('\n'));
}

/**
 * スケジュールHTML作成
 * @function createScheduleDom
 * @param {any} data
 * @returns {string}
 */
function createScheduleDom(data) {
    var performances = data.performances.map(function (performance) {
        var link = '/purchase?id=' + performance.id;
        if (isFixed()) {
            // 券売機
            link = '/purchase/fixed.html?id=' + performance.id;
        }
        return ('<li class="button small-button gray-button">'+
            '<a href="'+ link +'">'+ 
            '<div class="mb-x-small">' + timeFormat(performance.attributes.time_start) + '</div>' + 
            '<div class="small-text mb-x-small">～' + timeFormat(performance.attributes.time_end) + '</div>' + 
            '<div class="small-text">' + performance.attributes.screen.name.ja + '</div>' + 
            '</a>' +
        '</li>');
    });
    return ('<li class="performance mb-small">' +
        '<dl>' +
            '<dt class="small-text"><strong>作品名</strong>' + data.performances[0].attributes.film.name.ja + '</dt>' +
            '<dd>'+
                '<div class="mb-small small-text"><strong>上映時間</strong>' + 0 + '分</div>'+
                '<ul>'+
                    performances.join('\n') +
                '</ul>'+
            '</dd>' +
        '</dl>' +
    '</li>');
}