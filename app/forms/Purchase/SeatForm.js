"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 座席選択
 */
exports.default = (req) => {
    req.checkBody('seats', `${req.__('common.seat')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('seats', `${req.__('common.seat')}${req.__('common.validation.is_json')}`).isJSON();
    req.checkBody('agree', `${req.__('common.agreement')}${req.__('common.validation.agree')}`).notEmpty();
};
