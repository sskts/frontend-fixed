/**
 * SSKTS API Node.js Client
 *
 * @ignore
 */

import GoogleTokenClient from './auth/googleTokenClient';
import OAuth2client from './auth/oAuth2client';

import * as EventService from './service/event';
import * as OrderService from './service/order';
import * as OrganizationService from './service/organization';
import * as PersonService from './service/person';
import * as PlaceService from './service/place';
import * as PlaceOrderTransactionService from './service/transaction/placeOrder';

export namespace auth {
    export class OAuth2 extends OAuth2client { }
    export class GoogleToken extends GoogleTokenClient { }
}

export namespace service {
    export import event = EventService;
    export import order = OrderService;
    export import organization = OrganizationService;
    export import person = PersonService;
    export import place = PlaceService;
    export namespace transaction {
        export import placeOrder = PlaceOrderTransactionService;
    }
}
