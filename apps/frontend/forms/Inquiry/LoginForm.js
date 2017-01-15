"use strict";
const form = require("express-form");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = form(form.field('theater_code', '施設コード').trim().required('', '%sが未入力です')
    .regex(/^[0-9]+$/, '%sは数字で入力してください'), form.field('reserve_num', '購入番号').trim().required('', '%sが未入力です')
    .regex(/^[0-9]+$/, '%sは数字で入力してください'), form.field('tel_num', '電話番号').trim().required('', '%sが未入力です')
    .regex(/^[0-9]+$/, '%sは数字で入力してください'));
