/**
 * SSKTS API Node.js Client
 *
 * @ignore
 */

import ClientCredentialsClient from './auth/clientCredentialsClient';
import GoogleTokenClient from './auth/googleTokenClient';

import * as EventService from './service/event';
import * as OrderService from './service/order';
import * as OrganizationService from './service/organization';
import * as PersonService from './service/person';
import * as PlaceService from './service/place';
import * as PlaceOrderTransactionService from './service/transaction/placeOrder';

export namespace auth {
    export class ClientCredentials extends ClientCredentialsClient { }
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
