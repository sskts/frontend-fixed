"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NAME_MAX_LENGTH = 12;
const MAIL_MAX_LENGTH = 50;
const TEL_MAX_LENGTH = 11;
const TEL_MIN_LENGTH = 9;
/**
 * 購入情報入力フォーム
 */
exports.default = (req) => {
    // 名前（せい）
    req.checkBody('lastNameHira', `${req.__('common.last_name_hira')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('lastNameHira', `${req.__('common.last_name_hira')}${req.__('common.validation.maxlength %s', String(NAME_MAX_LENGTH))}`).isLength({
        min: 0,
        max: NAME_MAX_LENGTH
    });
    req.checkBody('lastNameHira', `${req.__('common.last_name_hira')}${req.__('common.validation.is_hira')}`).matches(/^[ぁ-ゞー]+$/);
    // 名前（めい）
    req.checkBody('lastNameHira', `${req.__('common.first_name_hira')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('lastNameHira', `${req.__('common.first_name_hira')}${req.__('common.validation.maxlength %s', String(NAME_MAX_LENGTH))}`).isLength({
        min: 0,
        max: NAME_MAX_LENGTH
    });
    req.checkBody('lastNameHira', `${req.__('common.first_name_hira')}${req.__('common.validation.is_hira')}`).matches(/^[ぁ-ゞー]+$/);
    // メールアドレス
    req.checkBody('mailAddr', `${req.__('common.mail_addr')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('mailAddr', `${req.__('common.mail_addr')}${req.__('common.validation.maxlength %s', String(MAIL_MAX_LENGTH))}`).isLength({
        max: MAIL_MAX_LENGTH
    });
    req.checkBody('mailAddr', `${req.__('common.mail_addr')}${req.__('common.validation.is_email')}`).isEmail();
    // メールアドレス確認
    req.checkBody('mailConfirm', `${req.__('common.mail_confirm')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('mailConfirm', `${req.__('common.mail_confirm')}${req.__('common.validation.maxlength %s', String(MAIL_MAX_LENGTH))}`).isLength({
        max: MAIL_MAX_LENGTH
    });
    req.checkBody('mailConfirm', `${req.__('common.mail_confirm')}${req.__('common.validation.is_email')}`).isEmail();
    req.checkBody('mailConfirm', `${req.__('common.mail_confirm')}${req.__('common.validation.is_email')}`).equals(req.body.mailAddr);
    // 電話番号
    req.checkBody('telNum', `${req.__('common.tel_num')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('telNum', `${req.__('common.tel_num')}${req.__('common.validation.is_hira')}`).matches(/^[0-9]+$/);
    req.checkBody('telNum', `${req.__('common.tel_num')}${req.__('common.validation.maxlength %s', String(TEL_MAX_LENGTH))}`).isLength({
        max: TEL_MAX_LENGTH
    });
    req.checkBody('telNum', `${req.__('common.tel_num')}${req.__('common.validation.minlength %s', String(TEL_MIN_LENGTH))}`).isLength({
        min: TEL_MIN_LENGTH
    });
};
