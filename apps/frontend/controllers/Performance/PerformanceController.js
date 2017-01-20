"use strict";
const BaseController_1 = require("../BaseController");
const request = require("request");
const config = require("config");
class PerformanceController extends BaseController_1.default {
    index() {
        if (!this.req.session)
            return;
        delete this.req.session['purchaseInfo'];
        delete this.req.session['reserveSeats'];
        delete this.req.session['reserveTickets'];
        delete this.req.session['updateReserve'];
        delete this.req.session['gmoTokenObject'];
        this.res.render('performance');
    }
    getPerformances(day) {
        let endpoint = config.get('mp_api_endpoint');
        let method = 'performances';
        let options = {
            url: `${endpoint}/${method}/?day=${day}`,
            method: 'GET',
            json: true,
        };
        request.get(options, (error, response, body) => {
            this.res.json({
                error: error,
                response: response,
                result: body
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformanceController;
