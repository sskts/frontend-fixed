$(function () {
    getPerformance();
    $(document).on('click', '.search a', function (event) {
        event.preventDefault();
        getPerformance();
    });
});

/**
 * パフォーマンスリスト取得
 * @returns {void}
 */
function getPerformance() {
    var theater = $('.theater select').val();
    var day = $('.date select').val();
    console.log(day)
    $.ajax({
        dataType: 'json',
        url: '/performances',
        type: 'POST',
        timeout: 10000,
        data: {
            theater: theater,
            day: day
        },
        beforeSend: function () {

        }
    }).done(function (res) {
        $('.performances').html('');
        if (res.error) {
            console.log(res.error);
        } else {
            console.log(res)
            console.log(JSON.stringify(res));
            var performances = res.result;
            var dom = '';
            for (var i = 0, len = performances.length; i < len; i++) {
                var performance = performances[i].attributes;
                dom += '<li>' +
                    '<dl>' +
                        '<dt>鑑賞日 / スクリーン</dt>' +
                        '<dd>' + moment(performance.day).format('YYYY年MM月DD日') + ' / ' + performance.theater.name.ja + ' ' + performance.screen.name.ja + '</dd>' +
                        '<dt>作品名</dt>' +
                        '<dd>' + performance.film.name.ja + '</dd>' +
                        '<dd>' +
                            '<div class="button blue-button">' +
                                '<a href="/purchase?id='+performance.id+'">' + moment(performance.time_start, 'hmm').format('HH:mm') + ' - ' + moment(performance.time_end, 'hmm').format('HH:mm') + '</a>' +
                            '</div>' +
                        '</dd>' +
                    '</dl>' +
                '</li>';
            };
            $('.performances').append(dom);
        }
    }).fail(function (jqxhr, textStatus, error) {
        console.log(jqxhr, textStatus, error)
    }).always(function () {

    });
}