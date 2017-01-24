"use strict";
const form = require("express-form");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = form(form.field('last_name_hira', 'せい').trim().required('', '%sが未入力です')
    .maxLength(30, '%sは30文字以内で入力してください')
    .regex(/^[ぁ-ゞ]+$/, '%sは全角ひらがなで入力してください'), form.field('first_name_hira', 'めい').trim().required('', '%sが未入力です')
    .maxLength(30, '%sは30文字以内で入力してください')
    .regex(/^[ぁ-ゞ]+$/, '%sは全角ひらがなで入力してください'), form.field('mail_addr', 'メールアドレス').trim().required('', '%sが未入力です')
    .isEmail('%sが不適切です'), form.field('mail_confirm', 'メールアドレス(確認)').trim().required('', '%sが未入力です')
    .isEmail('%sが不適切です')
    .equals('field::mail_addr', 'メールアドレスが一致しません'), form.field('tel_num', '電話番号').trim().required('', '%sが未入力です')
    .regex(/^[0-9]+$/, '%sは数字で入力してください'), form.field('agree', '利用規約').trim().required('', '%sに同意してください'));
