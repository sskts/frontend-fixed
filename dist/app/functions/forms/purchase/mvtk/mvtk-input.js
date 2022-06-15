"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseMvtkInputForm = void 0;
/**
 * ムビチケ認証
 */
function purchaseMvtkInputForm(req) {
    req.checkBody('mvtk', `${req.__('common.mvtk')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('mvtk', `${req.__('common.mvtk')}${req.__('common.validation.is_json')}`).isJSON();
}
exports.purchaseMvtkInputForm = purchaseMvtkInputForm;
