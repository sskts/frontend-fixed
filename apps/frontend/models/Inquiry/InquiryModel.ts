import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');
import express = require('express');

/**
 * 照会セッション
 */
export class InquiryModel {
    public performance: MP.performance | null;
    public stateReserve: COA.stateReserveInterface.Result | null;


    constructor(inquirySession: any) {
        if (!inquirySession) {
            inquirySession = {};
        }
        this.performance = (inquirySession.performance) ? inquirySession.performance : null;
        this.stateReserve = (inquirySession.stateReserve) ? inquirySession.stateReserve : null;
    }

    /**
     * 保存
     */
    public formatToSession(): {
        performance: MP.performance | null,
        stateReserve: COA.stateReserveInterface.Result | null,
    } {
        return {
            performance: (this.performance) ? this.performance : null,
            stateReserve: (this.stateReserve) ? this.stateReserve : null,
        }
    }


    /**
     * ステータス確認
     */
    public checkAccess(next: express.NextFunction): void {
        let result: boolean = false;
        if (this.performance && this.stateReserve) {
            result = true;
        }
        if (!result) {
            return next(new Error('無効なアクセスです'));
        }
    }


}