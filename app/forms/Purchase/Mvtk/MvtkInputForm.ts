import * as express from 'express';

/**
 * ムビチケ認証
 */
export default (req: express.Request): void => {
    req.checkBody(
        'mvtk',
        `${req.__('common.mvtk')}${req.__('common.validation.required')}`
    ).notEmpty();
    req.checkBody(
        'mvtk',
        `${req.__('common.mvtk')}${req.__('common.validation.is_json')}`
    ).isJSON();
};
