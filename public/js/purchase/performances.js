var dt = new Date('1999-12-31T23:59:59Z'); // 過去の日付をGMT形式に変換
document.cookie = 'applicationData=; max-age=0; path=/;';

/**
 * パフォーマンス
 * @class
 */
var Performance = (function () {
    function Performance(params) {
        this.date = params.date;
        this.movie = params.movie;
        this.screen = params.screen;
        this.time = params.time;
        this.member = (params.member === undefined) ? false : params.member;
    }
    /**
     * 予約ステータス情報取得
     */
    Performance.prototype.getAvailability = function () {
        var value = this.time.seat_count.cnt_reserve_free / this.time.seat_count.cnt_reserve_max * 100;
        var availability = [
            { symbolText: '×', icon: '/images/fixed/status_03.svg', className: 'availability-full', text: '満席' },
            { symbolText: '△', icon: '/images/fixed/status_02.svg', className: 'availability-little', text: '残りわずか' },
            { symbolText: '○', icon: '/images/fixed/status_01.svg', className: 'availability-large', text: '空席あり' }
        ];
        var threshold = 10;
        return (value === 0)
            ? availability[0] : (value <= threshold)
                ? availability[1] : availability[2];
    };
    /**
     * 販売可能判定
     */
    Performance.prototype.isSalse = function () {
        return !this.isBeforePeriod()
            && !this.isAfterPeriod()
            && this.time.seat_count.cnt_reserve_free > 0;
    };
    /**
     * 予約期間前判定
     */
    Performance.prototype.isBeforePeriod = function () {
        var rsvStartDate = (this.member)
            ? moment(this.time.member_rsv_start_day + " " + this.time.member_rsv_start_time, 'YYYYMMDD HHmm')
            : moment(this.time.rsv_start_day + " " + this.time.rsv_start_time, 'YYYYMMDD HHmm');
        return rsvStartDate > moment();
    };
    /**
     * 予約期間後判定（上映開始10分以降）
     */
    Performance.prototype.isAfterPeriod = function () {
        var startDate = moment(this.date + " " + this.time.start_time, 'YYYYMMDD HHmm');
        return moment(startDate).add(10, 'minutes') < moment();
    };
    /**
     * 上映時間取得
     */
    Performance.prototype.getTime = function (type) {
        return (type === 'start')
            ? this.time.start_time.slice(0, 2) + ":" + this.time.start_time.slice(2, 4)
            : this.time.end_time.slice(0, 2) + ":" + this.time.end_time.slice(2, 4);
    };
    /**
     * 表示判定
     */
    Performance.prototype.isDisplay = function () {
        var now = moment();
        var displayStartDate = moment(this.time.online_display_start_day, 'YYYYMMDD');
        var endDate = moment(this.date + " " + this.time.end_time, 'YYYYMMDD HHmm');
        return (displayStartDate < now && endDate > now);
    };
    /**
     * id生成
     */
    Performance.prototype.createId = function () {
        var id = "" + this.movie.movie_short_code + this.movie.movie_branch_code + this.date + this.screen.screen_code + this.time.start_time;
        return id;
    };
    return Performance;
}());

/**
 * スケジュールからパフォーマンスへ変換
 */
function schedule2Performance(schedule, member) {
    var performances = [];
    var date = schedule.date;
    schedule.movie.forEach(function (movie) {
        movie.screen.forEach(function (screen) {
            screen.time.forEach(function (time) {
                performances.push(new Performance({ date: date, movie: movie, screen: screen, time: time, member: member }));
            });
        });
    });
    return performances;
}
/**
 * パフォーマンスを作品で絞り込み
 */
function filterPerformancebyMovie(performances, movie) {
    var filterResult = performances.filter(function (p) { return p.movie.movie_short_code === movie.movie_short_code && p.movie.movie_branch_code === movie.movie_branch_code; });
    var sortResult = filterResult.sort(function (a, b) {
        if (a.time.start_time < b.time.start_time) {
            return -1;
        }
        else {
            return 1;
        }
    });
    return sortResult;
}

/**
 * 劇場一覧取得
 */
function getTheaterTable() {
    return [
        { "code": "20", "name": "gdcs" },
        { "code": "02", "name": "heiwajima" },
        { "code": "19", "name": "yukarigaoka" },
        { "code": "13", "name": "tsuchiura" },
        { "code": "06", "name": "numazu" },
        { "code": "21", "name": "lalaportnumazu" },
        { "code": "14", "name": "kahoku" },
        { "code": "16", "name": "yamatokoriyama" },
        { "code": "17", "name": "shimonoseki" },
        { "code": "07", "name": "okaido" },
        { "code": "08", "name": "kinuyama" },
        { "code": "09", "name": "shigenobu" },
        { "code": "15", "name": "masaki" },
        { "code": "12", "name": "kitajima" },
        { "code": "18", "name": "aira" }
    ];
}

Vue.component('purchase-performance-time', {
    props: ['schedule'],
    data: function () {
        return {
            performances: [],
            filterPerformancebyMovie: filterPerformancebyMovie
        };
    },
    created: function () {
        this.performances = schedule2Performance(this.schedule, false);
    },
    template: '<ul class="time-order">\
    <li v-for="performance in performances" v-if="performance.isDisplay()" v-bind:class="performance.getAvailability().className" class="button white-button mb-middle">\
        <a v-on:click="$emit(\'select\', { event: $event, performance: performance })" class="icon-triangle-gray">\
            <div v-if="performance.time.late === 1" class="icon-morning-black"></div>\
            <div v-if="performance.time.late === 2" class="icon-late-black"></div>\
            <dl>\
                <dt class="text-left">\
                    <div>\
                        <div class="mb-x-small"><strong class="large-x-text">{{ performance.getTime(\'start\') }}</strong></div>\
                        <div>～{{ performance.getTime(\'end\') }}</div>\
                    </div>\
                    <div v-if="performance.isSalse()" class="small-text text-center status">\
                        <div class="mb-x-small">{{ performance.getAvailability().text }}</div>\
                        <div><img v-bind:src="performance.getAvailability().icon"></div>\
                    </div>\
                    <div v-if="!performance.isSalse() && performance.isBeforePeriod()" class="small-text text-center status">\
                        <div class="mb-x-small">販売期間外</div>\
                    </div>\
                    <div v-if="!performance.isSalse() && performance.isAfterPeriod()" class="small-text text-center status">\
                        <div class="mb-x-small">販売期間外</div>\
                    </div>\
                </dt>\
                <dd class="text-left">\
                    <div class="screen-name mb-x-small small-text d-ib">{{ performance.screen.name }}</div>\
                    <div class="small-text mb-x-small d-ib">{{ performance.movie.running_time }}分</div>\
                    <p class="break-all"><strong>{{ performance.movie.name }}</strong></p>\
                </dd>\
            </dl>\
        </a>\
    </li>\
</ul>'
});

Vue.component('purchase-performance-film', {
    props: ['schedule'],
    data: function () {
        return {
            performances: [],
            filterPerformancebyMovie: filterPerformancebyMovie
        };
    },
    created: function () {
        this.performances = schedule2Performance(this.schedule, false);
    },
    template: '<ul class="film-order">\
    <li v-for="movie of schedule.movie" class="performance mb-x-small">\
        <dl>\
            <dt>\
                <div class="mb-x-small"><strong>{{ movie.name }}</strong></div>\
                <div class="small-text">{{ movie.running_time }}分</div>\
            </dt>\
            <dd>\
                <ul>\
                    <li v-for="performance of filterPerformancebyMovie(performances, movie)" v-if="performance.isDisplay()" v-bind:class="performance.getAvailability().className" class="button white-button">\
                        <a v-on:click="$emit(\'select\', { event: $event, performance: performance })" class="icon-triangle-gray">\
                            <div v-if="performance.time.late === 1" class="icon-morning-black"></div>\
                            <div v-if="performance.time.late === 2" class="icon-late-black"></div>\
                            <dl>\
                                <dt>\
                                    <div class="text-left">\
                                        <div class="large-text mb-x-small"><strong>{{ performance.getTime(\'start\') }}</strong></div>\
                                        <div>～{{ performance.getTime(\'end\') }}</div>\
                                    </div>\
                                    <div v-if="performance.isSalse()" class="text-cente small-x-text status">\
                                        <div class="mb-x-small">{{ performance.getAvailability().text }}</div>\
                                        <div><img v-bind:src="performance.getAvailability().icon"></div>\
                                    </div>\
                                    <div v-if="!performance.isSalse() && performance.isBeforePeriod()" class="text-cente small-x-text status">\
                                        <div class="mb-x-small">販売期間外</div>\
                                    </div>\
                                    <div v-if="!performance.isSalse() && performance.isAfterPeriod()" class="text-cente small-x-text status">\
                                        <div class="mb-x-small">販売期間外</div>\
                                    </div>\
                                </dt>\
                                <dd class="small-text text-center">\
                                    <div class="screen-name">{{ performance.screen.name }}</div>\
                                </dd>\
                            </dl>\
                        </a>\
                    </li>\
                </ul>\
            </dd>\
        </dl>\
    </li>\
</ul>'
});

var app = new Vue({
    el: '#performances',
    data: {
        theaterCode: config.theater,
        date: moment().format('YYYYMMDD'),
        dateList: [],
        sortType: 'time',
        error: undefined,
        timer: undefined,
        schedules: [],
        schedule: undefined
    },

    created: function () {
        var _this = this;
        this.getSchedule().done(function (data) {
            _this.schedules = data;
            _this.createDate();
            _this.createSchedule();
            _this.update();
        }).fail(function (error) {
            console.error(error);
        });

    },

    methods: {
        /**
         * 選択日生成
         */
        createDate: function () {
            var results = [];
            var limit = 3;
            for (var i = 0; i < limit; i++) {
                results.push({
                    value: moment().add(i, 'days').format('YYYYMMDD'),
                    text: (i === 0) ? '本日'
                        : (i === 1) ? '明日'
                            : (i === 2) ? '明後日'
                                : date.format('YYYY年MM月DD日')
                });
            }
            this.dateList = results;
        },
        /**
         * スケジュール取得
         */
        getSchedule: function () {
            this.error = undefined;
            var now = moment().format('YYYYMMDDHHmm');
            var branchCode = this.theaterCode;
            var theatreTable = getTheaterTable();
            var theatreTableFindResult = theatreTable.find(function (t) { return (branchCode.slice(-2) === t.code); });
            var url = $('input[name=SCHEDULE_API_ENDPOINT]').val() + '/' + theatreTableFindResult.name + '/schedule/json/schedule.json?date=' + now;
            var options = {
                dataType: 'json',
                url: url,
                type: 'GET',
                timeout: API_TIMEOUT
            };
            var _this = this;
            return $.ajax(options);
        },
        /**
         * スケジュール作成
         */
        createSchedule: function () {
            this.schedule = undefined;
            var _this = this;
            setTimeout(function(){
                var now = moment();
                var today = moment(now).format('YYYYMMDD');
                var searchDate = (_this.dateList.find(function (d) { return (d.value === _this.date); }) === undefined)
                    ? today : _this.date;
                _this.date = searchDate;
                // 選択したスケジュールを抽出　上映終了は除外
                _this.schedule = _this.schedules.find(function (s) { return (s.date === _this.date); });
            }, 0);
        },
        /**
         * 定期的にスケジュール更新
         */
        update: function () {
            var time = 1000 * 60 * 5;
            var _this = this;
            this.timer = setInterval(function () {
                _this.getSchedule().done(function (data) {
                    _this.schedules = data;
                    _this.createDate();
                    _this.createSchedule();
                }).fail(function (error) {
                    console.error(error);
                });
            }, time);
        },

        /**
         * パフォーマンス選択
         */
        selectPerformance: function (params) {
            var event = params.event;
            var performance = params.performance;
            event.preventDefault();
            // 残席なしなら遷移しない
            if (!performance.isSalse()) {
                return;
            };
            var performances = schedule2Performance(this.schedule, false);
            var filterResult = performances.filter(function (p) {
                return (p.movie.movie_short_code === performance.movie.movie_short_code
                    && p.movie.movie_branch_code === performance.movie.movie_branch_code
                    && p.isSalse());
            });
            var _this = this;
            var data = filterResult.map(function (p) {
                return {
                    id: _this.theaterCode + p.createId(),
                    startTime: p.getTime('start')
                };
            });
            sessionStorage.setItem('performances', JSON.stringify(data));
            var id = this.theaterCode + performance.createId();
            var entrance = $('input[name=ENTRANCE_SERVER_URL]').val();
            location.href = entrance + '/fixed/index.html?id=' + id;
        },
        /**
         * ソート変更
         */
        changeSortType: function (type, event) {
            event.preventDefault();
            if (this.sortType === type) {
                return;
            }
            this.sortType = type
        },
        /**
         * 日付変更
         */
        changeDate: function () {
            this.createSchedule();
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
});


