var dt = new Date('1999-12-31T23:59:59Z'); // 過去の日付をGMT形式に変換
document.cookie = 'applicationData=; max-age=0; path=/;';

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
            timer: null,
            viewType: 0,
            views: []
        },

        created: function () {
            this.getTheaterCode();
            this.createDate(3);
            this.createviewType();
            this.fetchPerformancesData();
        },

        watch: {
            theaterCode: 'fetchPerformancesData',
            date: 'fetchPerformancesData'
        },

        filters: {
            /**
             * ステータス変換
             * @function availability
             * @param {number} value 残席割合
             * @returns {string}
             */
            availability: function (value, type) {
                const availability = [
                    {
                        symbol: '×',
                        image: '/images/fixed/status_03.svg',
                        string: 'availability-full'
                    },
                    {
                        symbol: '△',
                        image: '/images/fixed/status_02.svg',
                        string: 'availability-little'
                    },
                    {
                        symbol: '○',
                        image: '/images/fixed/status_01.svg',
                        string: 'availability-large'
                    }
                ];

                return (value === 0)
                    ? availability[0][type] : (value <= 10)
                        ? availability[1][type] : availability[2][type];
            },
            /**
             * 時間フォーマット
             * @function timeFormat
             * @param {string} referenceDate 基準日
             * @param {string} screeningTime 時間
             * @returns {string}
             */
            timeFormat: function (screeningTime, referenceDate) {
                var HOUR = 60;
                var diff = moment(screeningTime).diff(moment(referenceDate), 'minutes');
                var hour = ('00' + Math.floor(diff / HOUR)).slice(-2);
                var minutes = moment(screeningTime).format('mm');

                return hour + ':' + minutes;
            },
            /**
             * ISO 8601変換
             * @function duration
             * @param {string} value
             * @returns {number}
             */
            duration: function (value) {
                return moment.duration(value).asMinutes();
            }
        },

        methods: {
            /**
             * 表示形式生成
             * @function createviewType
             * @returns {void}
             */
            createviewType: function () {
                this.views = [
                    { value: 0, text: 'WEB' },
                    { value: 1, text: 'APP' }
                ]
            },
            /**
             * 劇場コード取得
             * @function getTheaterCode
             * @returns {void}
             */
            getTheaterCode: function () {
                this.theaterCode = (isFixed()) ? config.theater : this.theaterCode;
            },
            /**
             * 選択日生成
             * @function getTheaterCode
             * @returns {void}
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
             * @function getTheaterCode
             * @returns {void}
             */
            fetchPerformancesData: function () {
                var options = {
                    dataType: 'json',
                    url: '/purchase/performances/getPerformances',
                    type: 'GET',
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
             * @function getTheaterCode
             * @param {any} res
             * @returns {void}
             */
            successHandler: function (data, textStatus, jqXhr) {
                if (jqXhr.status !== HTTP_STATUS.OK) {
                    // エラー
                    this.error = 'スケジュールを取得できません。';
                    return;
                }
                this.error = null;
                this.chronologicalOrder = this.convertToChronologicalOrder(data.result);
                this.filmOrder = this.convertToFilmOrder(data.result);
                if (this.chronologicalOrder.length === 0) {
                    // パフォーマンスなし
                    this.error = 'スケジュールがありません。';
                }
                if (this.chronologicalOrder.length === 0
                    && Number(this.selects[0].value) < Number(moment().format('YYYYMMDD'))) {
                    // スケジュールなし、日付変更している場合
                    location.reload();
                }
            },
            /**
             * パフォーマンス取得後
             * @function getTheaterCode
             * @returns {void}
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
             * 時間別へ変換
             * @function getTheaterCode
             * @param {any[]} data
             * @returns {any[]}
             */
            convertToChronologicalOrder: function (data) {
                var results = [];
                data.forEach(function (performance) {
                    // 販売可能時間判定
                    var limit = (isFixed()) ? END_TIME_FIXED : END_TIME_DEFAULT;
                    var limitTime = moment().add(limit, 'minutes');
                    if (limitTime.unix() > moment(`${performance.startDate}`).unix()) {
                        return;
                    }
                    results.push(performance);
                });
                return results;
            },
            /**
             * 作品別へ変換
             * @function getTheaterCode
             * @param {any[]} data
             * @returns {any[]}
             */
            convertToFilmOrder: function (data) {
                var results = [];
                data.forEach(function (performance) {
                    // 販売可能時間判定
                    var limit = (isFixed()) ? END_TIME_FIXED : END_TIME_DEFAULT;
                    var limitTime = moment().add(limit, 'minutes');
                    if (limitTime.unix() > moment(`${performance.startDate}`).unix()) {
                        return;
                    }
                    var film = results.find(function (film) {
                        return (film.id === performance.workPerformed.identifier);
                    });
                    if (film === undefined) {
                        results.push({
                            id: performance.workPerformed.identifier,
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
             * @function getTheaterCode
             * @param {Event} event
             * @param {string} filmId
             * @param {string} id
             * @returns {void}
             */
            onclickPerformance: function (event, performance) {
                event.preventDefault();
                // 残席なしなら遷移しない
                if (performance.offer.availability === 0) return;
                var id = performance.identifier;
                var filmId = performance.coaInfo.titleCode;
                if (filmId !== undefined) {
                    var film = this.filmOrder.find(function (value) {
                        return (value.id === filmId);
                    });
                    if (film !== undefined) {
                        var performances = film.films.map(function (value) {
                            return {
                                id: value.identifier,
                                startTime: timeFormat(value.startDate, value.coaInfo.dateJouei)
                            };
                        });
                        var json = JSON.stringify(performances);
                        sessionStorage.setItem('performances', json);
                    }
                }
                if (isFixed()) {
                    location.href = '/fixed?id=' + id;
                } else {
                    if (this.viewType === 0) {
                        location.href = '/purchase?id=' + id;
                    } else if (this.viewType === 1) {
                        location.href = '/signIn?id=' + id;
                    }
                }
            },
            /**
             * ソート選択
             * @function getTheaterCode
             * @param {string} type
             * @param {Event} event
             * @returns {void}
             */
            onClickSort: function (type, event) {
                event.preventDefault();
                if (this.sortType === type) {
                    return;
                }
                this.sortType = type
            },
            /**
             * 照会ボタンクリック
             * @function onclickInquiry
             * @param {Event} event
             * @returns {void}
             */
            onclickInquiry: function (event) {
                event.preventDefault();
                location.href = 'inquiry/login?theater=' + this.theaterCode;
            },
        }
    })
})();
