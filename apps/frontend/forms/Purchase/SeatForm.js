"use strict";
const form = require("express-form");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req) => {
    return form(form.field('seats', '座席').trim().required().custom((value) => {
        try {
            const seats = JSON.parse(value);
            for (const seat of seats.list_tmp_reserve) {
                if (!seat.seat_num || !seat.seat_section) {
                    throw new Error();
                }
            }
        }
        catch (err) {
            throw new Error(`%s${req.__('common.validation.is_json')}`);
        }
    }), form.field('agree', '利用規約').trim().required('', '%sに同意してください'));
};
