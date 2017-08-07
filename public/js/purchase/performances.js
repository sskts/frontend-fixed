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
            theaterCode: '118',
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
            theaterCode: 'fetchPerformancesData',
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
                this.theaterCode = (isFixed()) ? config.theater : this.theaterCode;
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
                this.error = null;
                this.chronologicalOrder = this.convertToChronologicalOrder(res.result);
                this.filmOrder = this.convertToFilmOrder(res.result);
                if (this.chronologicalOrder.length === 0) {
                    // パフォーマンスなし
                    this.error = 'スケジュールがありません。';
                }
            },
            /**
             * パフォーマンス取得後
             */
            afterHandler: function () {
                // 定期的にパフォーマンス更新
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
            onclickPerformance: function (event, id, filmId) {
                event.preventDefault();
                if (filmId !== undefined) {
                    var film = this.filmOrder.find(function (value) {
                        return (value.id === filmId);
                    });
                    if (film !== undefined) {
                        var performances = film.films.map(function (value) {
                            return value.id;
                        });
                        var json = JSON.stringify(performances);
                        sessionStorage.setItem('performances', json);
                    }
                }

                location.href = '/purchase/fixed.html?id=' + id;
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
