/// <reference types="express" />
import express = require('express');
declare namespace MvtkConfirmModule {
    /**
     * ムビチケ券適用確認ページ表示
     */
    function index(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * 購入者情報入力へ
     */
    function submit(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
export default MvtkConfirmModule;
