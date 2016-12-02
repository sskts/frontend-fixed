"use strict";
const form = require('express-form');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = form(form.field('lastNameKanji', '姓').trim().required('', '%sが未入力です')
    .maxLength(15, '%sは15文字以内で入力してください'), form.field('firstNameKanji', '名').trim().required('', '%sが未入力です')
    .maxLength(15, '%sは15文字以内で入力してください'), form.field('lastNameHira', 'せい').trim().required('', '%sが未入力です')
    .maxLength(30, '%sは30文字以内で入力してください')
    .regex(/^[ぁ-ゞ]+$/, '%sは全角カタカナで入力してください'), form.field('firstNameHira', 'めい').trim().required('', '%sが未入力です')
    .maxLength(30, '%sは30文字以内で入力してください')
    .regex(/^[ぁ-ゞ]+$/, '%sは全角カタカナで入力してください'), form.field('mail', 'メールアドレス').trim().required('', '%sが未入力です')
    .isEmail('%sが不適切です'), form.field('mailConfirm', 'メールアドレス(確認)').trim().required('', '%sが未入力です')
    .isEmail('%sが不適切です')
    .equals('field::mail', 'メールアドレスが一致しません'), form.field('tel', '電話番号').trim().required('', '%sが未入力です')
    .regex(/^[0-9]+$/, '%sは数字で入力してください'), 
// 4[0-9]{12}(?:[0-9]{3})?  4で始まる13か16桁（VISA）
// 5[1-5][0-9]{14}          51から55で始まる16桁（Master、Dinersの一部）
// 3[0-9]{15})              3から始まる16桁（JCB）
form.field('creditNumber', 'クレジットカード番号').trim().required('', '%sが未入力です')
    .regex(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[0-9]{15})$/, '%sが不適切です'), form.field('creditMonth', '有効期限（月）').trim().required('', '%sが未入力です'), form.field('creditYear', '有効期限（年）').trim().required('', '%sが未入力です'), form.field('creditName', 'カード名義人').trim().required('', '%sが未入力です')
    .regex(/^[A-Z]+[\s|　]+[A-Z]+[\s|　]*[A-Z]+$/, '%sが不適切です'), form.field('creditCord', 'セキュリティーコード').trim().required('', '%sが未入力です')
    .regex(/^[0-9]{3,4}$/, '%sが不適切です'));
