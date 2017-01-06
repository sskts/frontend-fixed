"use strict";
const request = require("request");
const config = require("config");
let COA_URI = config.get("coa_api_endpoint");
let credentials = {
    access_token: "",
    expired_at: ""
};
function publishAccessToken(cb) {
    if (credentials.access_token && Date.parse(credentials.expired_at) > Date.now())
        return cb(null);
    request.post({
        url: `${COA_URI}/token/access_token`,
        form: {
            refresh_token: config.get("coa_api_refresh_token")
        },
        json: true
    }, (error, response, body) => {
        console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
        if (error)
            return cb(error);
        if (typeof body === "string")
            return cb(new Error(body));
        if (body.message)
            return cb(new Error(body.message));
        credentials = body;
        console.log("credentials:", credentials);
        cb(null);
    });
}
var findTheaterInterface;
(function (findTheaterInterface) {
    function call(args, cb) {
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), null);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/theater/`,
                auth: { bearer: credentials.access_token },
                json: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, {
                    theater_code: body.theater_code,
                    theater_name: body.theater_name,
                    theater_name_eng: body.theater_name_eng,
                    theater_name_kana: body.theater_name_kana,
                });
            });
        });
    }
    findTheaterInterface.call = call;
})(findTheaterInterface = exports.findTheaterInterface || (exports.findTheaterInterface = {}));
var findFilmsByTheaterCodeInterface;
(function (findFilmsByTheaterCodeInterface) {
    ;
    function call(args, cb) {
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), []);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/title/`,
                auth: { bearer: credentials.access_token },
                json: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, []);
                if (typeof body === "string")
                    return cb(new Error(body), []);
                if (body.message)
                    return cb(new Error(body.message), []);
                if (body.status !== 0)
                    return cb(new Error(body.status), []);
                cb(null, body.list_title);
            });
        });
    }
    findFilmsByTheaterCodeInterface.call = call;
})(findFilmsByTheaterCodeInterface = exports.findFilmsByTheaterCodeInterface || (exports.findFilmsByTheaterCodeInterface = {}));
var findScreensByTheaterCodeInterface;
(function (findScreensByTheaterCodeInterface) {
    ;
    function call(args, cb) {
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), []);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/screen/`,
                auth: { bearer: credentials.access_token },
                json: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, []);
                if (typeof body === "string")
                    return cb(new Error(body), []);
                if (body.message)
                    return cb(new Error(body.message), []);
                if (body.status !== 0)
                    return cb(new Error(body.status), []);
                cb(null, body.list_screen);
            });
        });
    }
    findScreensByTheaterCodeInterface.call = call;
})(findScreensByTheaterCodeInterface = exports.findScreensByTheaterCodeInterface || (exports.findScreensByTheaterCodeInterface = {}));
var findPerformancesByTheaterCodeInterface;
(function (findPerformancesByTheaterCodeInterface) {
    function call(args, cb) {
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), []);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/schedule/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {
                    begin: args.begin,
                    end: args.end
                }
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, []);
                if (typeof body === "string")
                    return cb(new Error(body), []);
                if (body.message)
                    return cb(new Error(body.message), []);
                if (body.status !== 0)
                    return cb(new Error(body.status), []);
                cb(null, body.list_schedule);
            });
        });
    }
    findPerformancesByTheaterCodeInterface.call = call;
})(findPerformancesByTheaterCodeInterface = exports.findPerformancesByTheaterCodeInterface || (exports.findPerformancesByTheaterCodeInterface = {}));
var reserveSeatsTemporarilyInterface;
(function (reserveSeatsTemporarilyInterface) {
    function call(args, cb) {
        console.log("reserveSeatsTemporarilyInterface calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), null);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/upd_tmp_reserve_seat/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                    cnt_reserve_seat: args.list_seat.length,
                    seat_section: args.list_seat.map((value) => { return value.seat_section; }),
                    seat_num: args.list_seat.map((value) => { return value.seat_num; }),
                    screen_code: args.screen_code,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, {
                    tmp_reserve_num: body.tmp_reserve_num,
                    list_tmp_reserve: body.list_tmp_reserve
                });
            });
        });
    }
    reserveSeatsTemporarilyInterface.call = call;
})(reserveSeatsTemporarilyInterface = exports.reserveSeatsTemporarilyInterface || (exports.reserveSeatsTemporarilyInterface = {}));
var deleteTmpReserveInterface;
(function (deleteTmpReserveInterface) {
    function call(args, cb) {
        console.log("deleteTmpReserveInterface calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), false);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/del_tmp_reserve/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                    tmp_reserve_num: args.tmp_reserve_num,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, false);
                if (typeof body === "string")
                    return cb(new Error(body), false);
                if (body.message)
                    return cb(new Error(body.message), false);
                if (body.status !== 0)
                    return cb(new Error(body.status), false);
                cb(null, true);
            });
        });
    }
    deleteTmpReserveInterface.call = call;
})(deleteTmpReserveInterface = exports.deleteTmpReserveInterface || (exports.deleteTmpReserveInterface = {}));
var getStateReserveSeatInterface;
(function (getStateReserveSeatInterface) {
    function call(args, cb) {
        console.log("getStateReserveSeat calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), null);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/state_reserve_seat/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                    screen_code: args.screen_code,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, {
                    cnt_reserve_free: body.cnt_reserve_free,
                    cnt_seat_line: body.cnt_seat_line,
                    list_seat: body.list_seat,
                });
            });
        });
    }
    getStateReserveSeatInterface.call = call;
})(getStateReserveSeatInterface = exports.getStateReserveSeatInterface || (exports.getStateReserveSeatInterface = {}));
var countFreeSeatInterface;
(function (countFreeSeatInterface) {
    function call(args, cb) {
        console.log("countFreeSeat calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), null);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/count_free_seat/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {
                    begin: args.begin,
                    end: args.end,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, {
                    theater_code: body.theater_code,
                    list_date: body.list_date,
                });
            });
        });
    }
    countFreeSeatInterface.call = call;
})(countFreeSeatInterface = exports.countFreeSeatInterface || (exports.countFreeSeatInterface = {}));
var salesTicketInterface;
(function (salesTicketInterface) {
    function call(args, cb) {
        console.log("salesTicket calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), null);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/sales_ticket/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, {
                    list_ticket: body.list_ticket,
                });
            });
        });
    }
    salesTicketInterface.call = call;
})(salesTicketInterface = exports.salesTicketInterface || (exports.salesTicketInterface = {}));
var ticketInterface;
(function (ticketInterface) {
    function call(args, cb) {
        console.log("ticket calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), null);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/ticket/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {},
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, {
                    list_ticket: body.list_ticket,
                });
            });
        });
    }
    ticketInterface.call = call;
})(ticketInterface = exports.ticketInterface || (exports.ticketInterface = {}));
var updateReserveInterface;
(function (updateReserveInterface) {
    function call(args, cb) {
        console.log("updateReserve calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), null);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/upd_reserve/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {},
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, {
                    reserve_num: body.reserve_num,
                    list_qr: body.list_qr,
                });
            });
        });
    }
    updateReserveInterface.call = call;
})(updateReserveInterface = exports.updateReserveInterface || (exports.updateReserveInterface = {}));
var deleteReserveInterface;
(function (deleteReserveInterface) {
    function call(args, cb) {
        console.log("deleteReserve calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), false);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/del_reserve/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {},
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, false);
                if (typeof body === "string")
                    return cb(new Error(body), false);
                if (body.message)
                    return cb(new Error(body.message), false);
                if (body.status !== 0)
                    return cb(new Error(body.status), false);
                cb(null, true);
            });
        });
    }
    deleteReserveInterface.call = call;
})(deleteReserveInterface = exports.deleteReserveInterface || (exports.deleteReserveInterface = {}));
var stateReserveInterface;
(function (stateReserveInterface) {
    function call(args, cb) {
        console.log("stateReserve calling...", args);
        publishAccessToken((err) => {
            if (err)
                return cb(new Error("failed in publishing access token."), null);
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/state_reserve/`,
                auth: { bearer: credentials.access_token },
                json: true,
                qs: {},
                useQuerystring: true
            }, (error, response, body) => {
                console.log("request processed.", error, (response) ? response.statusCode : undefined, body);
                if (error)
                    return cb(error, null);
                if (typeof body === "string")
                    return cb(new Error(body), null);
                if (body.message)
                    return cb(new Error(body.message), null);
                if (body.status !== 0)
                    return cb(new Error(body.status), null);
                cb(null, {
                    date_jouei: body.date_jouei,
                    title_code: body.title_code,
                    title_branch_num: body.title_branch_num,
                    time_begin: body.time_begin,
                    list_reserve_seat: body.list_reserve_seat,
                    list_ticket: body.list_ticket,
                });
            });
        });
    }
    stateReserveInterface.call = call;
})(stateReserveInterface = exports.stateReserveInterface || (exports.stateReserveInterface = {}));
