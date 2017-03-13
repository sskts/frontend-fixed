"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const form = require("express-form");
/**
 * 購入情報入力フォーム
 */
exports.default = (req) => {
    return form(form.field('mvtk', req.__('common.seat')).trim()
        .required('', `%s${req.__('common.validation.required')}`)
        .custom((value) => {
        //形式チェック
        try {
            const mvtkList = JSON.parse(value);
            for (const mvtk of mvtkList) {
                if (!mvtk.code || !mvtk.password) {
                    throw new Error();
                }
            }
        }
        catch (err) {
            throw new Error(`%s${req.__('common.validation.is_json')}`);
        }
    }));
};
