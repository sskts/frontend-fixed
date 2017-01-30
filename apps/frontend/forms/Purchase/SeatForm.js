"use strict";
const form = require("express-form");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = form(form.field('seats', '座席').trim().required().custom((value) => {
    try {
        let seats = JSON.parse(value);
        for (let seat of seats) {
            if (!seat.seat_num || !seat.seat_section) {
                throw new Error();
            }
        }
    }
    catch (err) {
        throw new Error('%sの形式がただしくありません。');
    }
}));
