/**
 * MPサービス
 * @desc シネマサンシャインAPI
 */
import * as filmService from './lib/services/film';
import * as oauthService from './lib/services/oauth';
import * as performanceService from './lib/services/performance';
import * as screenService from './lib/services/screen';
import * as theaterService from './lib/services/theater';
import * as transactionService from './lib/services/transaction';

/**
 * サービスモジュール群
 * @namespace services
 */
export namespace services {
    export import film = filmService;
    export import oauth = oauthService;
    export import performance = performanceService;
    export import screen = screenService;
    export import theater = theaterService;
    export import transaction = transactionService;
}
