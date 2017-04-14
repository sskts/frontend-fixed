"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maxLength = 30;
const minLength = 9;
/**
 * 購入情報入力フォーム
 */
exports.default = (req) => {
    // 名前（せい）
    req.checkBody('last_name_hira', `${req.__('common.last_name_hira')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('last_name_hira', `${req.__('common.last_name_hira')}${req.__('common.validation.maxlength %s', String(maxLength))}`).isLength({
        min: 0,
        max: maxLength
    });
    req.checkBody('last_name_hira', `${req.__('common.last_name_hira')}${req.__('common.validation.is_hira')}`).matches(/^[ぁ-ゞー]+$/);
    // 名前（めい）
    req.checkBody('last_name_hira', `${req.__('common.first_name_hira')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('last_name_hira', `${req.__('common.first_name_hira')}${req.__('common.validation.maxlength %s', String(maxLength))}`).isLength({
        min: 0,
        max: maxLength
    });
    req.checkBody('last_name_hira', `${req.__('common.first_name_hira')}${req.__('common.validation.is_hira')}`).matches(/^[ぁ-ゞー]+$/);
    // メールアドレス
    req.checkBody('mail_addr', `${req.__('common.mail_addr')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('mail_addr', `${req.__('common.mail_addr')}${req.__('common.validation.is_email')}`).isEmail();
    // メールアドレス確認
    req.checkBody('mail_confirm', `${req.__('common.mail_confirm')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('mail_confirm', `${req.__('common.mail_confirm')}${req.__('common.validation.is_email')}`).isEmail();
    req.checkBody('mail_confirm', `${req.__('common.mail_confirm')}${req.__('common.validation.is_email')}`).equals(req.body.mail_addr);
    // 電話番号
    req.checkBody('tel_num', `${req.__('common.tel_num')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('tel_num', `${req.__('common.tel_num')}${req.__('common.validation.is_hira')}`).matches(/^[0-9]+$/);
    req.checkBody('tel_num', `${req.__('common.tel_num')}${req.__('common.validation.minlength %s', String(minLength))}`).isLength({
        min: minLength
    });
};
