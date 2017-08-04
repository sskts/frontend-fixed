(function () {
    /**
     * 販売終了時間 30分前
     */
    var END_TIME_DEFAULT = 30;
    /**
     * 販売終了時間(券売機) 10分後
     */
    var END_TIME_FIXED = -10;

    var app = new Vue({

        el: '#performances',

        data: {
            theaterCode: '',
            date: moment().format('YYYYMMDD'),
            selects: [],
            chronologicalOrder: [],
            filmOrder: [],
            sortType: 'chronological',
            error: null,
            timer: null
        },

        created: function () {
            this.getTheaterCode();
            this.createDate(3);
            this.fetchPerformancesData();
        },

        watch: {
            date: 'fetchPerformancesData'
        },

        filters: {
            /**
             * 時間フォーマット
             */
            timeFormat: function (value) {
                if (typeof value !== 'string') {
                    return '';
                }
                const start = 2;
                const end = 4;
                return value.slice(0, start) + ':' + value.slice(start, end);
            }
        },

        methods: {
            /**
             * 劇場コード取得
             */
            getTheaterCode: function () {
                this.theaterCode = (isFixed()) ? config.theater : $('.theater select').val();
            },
            /**
             * 選択日生成
             */
            createDate: function (period) {
                var results = [];
                for (var i = 0; i < period; i++) {
                    results.push({
                        value: moment().add(i, 'days').format('YYYYMMDD'),
                        text: (i === 0) ? '本日'
                            : (i === 1) ? '明日'
                                : (i === 2) ? '明後日'
                                    : date.format('YYYY年MM月DD日')
                    });
                }
                console.log(this)
                this.selects = results;
            },
            /**
             * パフォーマンス取得
             */
            fetchPerformancesData: function () {
                var options = {
                    dataType: 'json',
                    url: '/purchase/performances',
                    type: 'POST',
                    timeout: 10000,
                    data: {
                        theater: this.theaterCode,
                        day: this.date
                    }
                };
                var _this = this;
                $.ajax(options)
                    .done(this.successHandler)
                    .fail(function (jqxhr, textStatus, error) {
                        console.log(jqxhr, textStatus, error);
                    })
                    .always(this.afterHandler);
                return;
            },
            /**
             * パフォーマンス取得成功
             */
            successHandler: function (res) {
                if (res.error !== null) {
                    // エラー
                    this.error = 'スケジュールを取得できません。';
                    return;
                }
                if (res.result.length === 0) {
                    // パフォーマンスなし
                    this.error = 'スケジュールがありません。';
                    return;
                }
                this.error = null;
                this.chronologicalOrder = this.convertToChronologicalOrder(res.result);
                this.filmOrder = this.convertToFilmOrder(res.result);
            },
            /**
             * パフォーマンス取得後
             */
            afterHandler: function () {
                var time = 1000 * 60 * 3;
                if (this.timer !== null) {
                    clearTimeout(this.timer);
                }
                this.timer = setTimeout(this.fetchPerformancesData, time);
            },
            /**
             * 作品別へ変換
             */
            convertToChronologicalOrder: function (data) {
                var results = [];
                data.forEach(function (performance) {
                    // 販売可能時間判定
                    var limit = (isFixed()) ? END_TIME_FIXED : END_TIME_DEFAULT;
                    var limitTime = moment().add(limit, 'minutes');
                    if (limitTime.unix() > moment(`${performance.attributes.day} ${performance.attributes.time_start}`).unix()) {
                        return;
                    }
                    results.push(performance);
                });
                return results;
            },
            /**
             * 作品別へ変換
             */
            convertToFilmOrder: function (data) {
                var results = [];
                data.forEach(function (performance) {
                    // 販売可能時間判定
                    var limit = (isFixed()) ? END_TIME_FIXED : END_TIME_DEFAULT;
                    var limitTime = moment().add(limit, 'minutes');
                    if (limitTime.unix() > moment(`${performance.attributes.day} ${performance.attributes.time_start}`).unix()) {
                        return;
                    }
                    var film = results.find(function (film) {
                        return (film.id === performance.attributes.film.id)
                    });
                    if (film === undefined) {
                        results.push({
                            id: performance.attributes.film.id,
                            films: [performance]
                        });
                    } else {
                        film.films.push(performance);
                    }
                });
                return results;
            },
            /**
             * パフォーマンス選択
             */
            onclickPerformance: function (id) {
                return '/purchase/fixed.html?id=' + id;
            },
            /**
             * ソート選択
             */
            onClickSort: function (type, event) {
                event.preventDefault();
                if (this.sortType === type) {
                    return;
                }
                this.sortType = type
            }
        }
    })
})();



// $(function () {
//     getPerformances();

//     // 照会クリック
//     $(document).on('click', '.inquiry-button a', function (event) {
//         event.preventDefault();
//         var theater = $('.inquiry-theater select').val();
//         var url = $(this).attr('href') + '?theater=' + theater;
//         location.href = url;
//     });
//     // 検索クリック
//     $(document).on('click', '.search a', function (event) {
//         event.preventDefault();
//         getPerformances();
//     });
//     // 検索セレクト
//     $(document).on('change', '.date select', function (event) {
//         getPerformances();
//     });
// });

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
        var status = (performance.attributes.stock_status === 0) ? ' ×'
            : (performance.attributes.stock_status <= 10) ? ' △'
                : '';
        var disabled = (performance.attributes.stock_status === 0) ? 'disabled' : '';
        performances.push('<li class="button small-button gray-button ' + disabled + '">' +
            '<a href="' + link + '" class="icon-triangle-02">' +
            '<div class="mb-x-small"><strong>' + timeFormat(performance.attributes.time_start) + '</strong><span class="small-text">～' + timeFormat(performance.attributes.time_end) + '</span></div>' +
            '<div class="small-text">' + performance.attributes.screen.name.ja + status + '</div>' +
            '</a>' +
            '</li>');
    });

    if (performances.length === 0) return '';

    return ('<li class="performance mb-small">' +
        '<dl>' +
        '<dt>' +
        '<div class="mb-x-small"><strong>' + data.performances[0].attributes.film.name.ja + '</strong></div>' +
        '<div class="small-text">' + data.performances[0].attributes.film.minutes + '分</div>' +
        '</dt>' +
        '<dd>' +

        '<ul>' +
        performances.join('\n') +
        '</ul>' +
        '</dd>' +
        '</dl>' +
        '</li>');
}