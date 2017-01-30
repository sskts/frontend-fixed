"use strict";
const form = require("express-form");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = form(form.field('reserve_tickets', '券種').trim().required().custom((value) => {
    try {
        let tickets = JSON.parse(value);
        for (let ticket of tickets) {
            if (!ticket.seat_code
                || !ticket.section
                || !ticket.ticket_code) {
                throw new Error();
            }
        }
    }
    catch (err) {
        throw new Error('%sの形式がただしくありません。');
    }
}), form.field('mvtk').trim());
