import * as express from 'express';
import * as form from 'express-form';

interface Mvtk {
    code: string;
    password: string;
}

/**
 * 購入情報入力フォーム
 */
export default (req: express.Request) => {
    return form(
        form.field('mvtk', req.__('common.seat')).trim()
        .required('', `%s${req.__('common.validation.required')}`)
        .custom((value: string) => {
            //形式チェック
            try {
                const mvtkList: Mvtk[] = JSON.parse(value);
                for (const mvtk of mvtkList) {
                    if (!mvtk.code || !mvtk.password {
                        throw new Error();
                    }
                }
            } catch (err) {
                throw new Error(`%s${req.__('common.validation.is_json')}`);
            }
        })
    );
};
