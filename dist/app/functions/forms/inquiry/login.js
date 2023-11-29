"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inquiryLoginForm = void 0;
const minLength = 9;
/**
 * 購入者情報入力フォーム
 */
function inquiryLoginForm(req) {
    req.checkBody('theaterCode', `${req.__('common.theater_code')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('theaterCode', `${req.__('common.theater_code')}${req.__('common.validation.is_number')}`).matches(/^[0-9]+$/);
    req.checkBody('reserveNum', `${req.__('common.purchase_number')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('reserveNum', `${req.__('common.purchase_number')}${req.__('common.validation.is_number')}`).matches(/^[0-9]+$/);
    req.checkBody('telephone', `${req.__('common.tel_num')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('telephone', `${req.__('common.tel_num')}${req.__('common.validation.is_number')}`).matches(/^[0-9]+$/);
    req.checkBody('telephone', `${req.__('common.tel_num')}${req.__('common.validation.minlength %s', String(minLength))}`).isLength({
        min: minLength,
    });
}
exports.inquiryLoginForm = inquiryLoginForm;
