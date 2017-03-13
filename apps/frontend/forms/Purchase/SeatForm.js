"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const form = require("express-form");
/**
 * 購入座席選択
 */
exports.default = (req) => {
    return form(form.field('seats', req.__('common.seat')).trim().required().custom((value) => {
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
    }), form.field('agree', req.__('common.agreement')).trim().required('', `%s${req.__('common.validation.agree')}`));
};
