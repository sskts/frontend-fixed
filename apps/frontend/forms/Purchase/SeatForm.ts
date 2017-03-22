import * as express from 'express';

/**
 * 座席選択
 */
export default (req: express.Request): void => {
    req.checkBody(
        'seats',
        `${req.__('common.seat')}${req.__('common.validation.required')}`
    ).notEmpty();
    req.checkBody(
        'seats',
        `${req.__('common.seat')}${req.__('common.validation.is_json')}`
    ).isJSON();

    req.checkBody(
        'agree',
        `${req.__('common.agreement')}${req.__('common.validation.agree')}`
    ).notEmpty();
};
