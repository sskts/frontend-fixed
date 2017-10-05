/**
 * Auth.AuthModel
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as sinon from 'sinon';

import { AuthModel, MemberType } from '../../../../app/models/Auth/AuthModel';

describe('Auth.AuthModel', () => {

    it('constructor 正常', () => {
        const authModel = new AuthModel({
            state: {},
            scopes: {},
            memberType: {},
            credentials: {},
            codeVerifier: {}
        });
        assert.notStrictEqual(authModel.state, null);
        assert.notStrictEqual(authModel.scopes, null);
        assert.notStrictEqual(authModel.memberType, null);
        assert.notStrictEqual(authModel.credentials, null);
        assert.notStrictEqual(authModel.codeVerifier, null);
    });

    it('create 正常 会員', () => {
        const oAuth2 = sinon.stub(sasaki.auth, 'OAuth2').returns(
            Promise.resolve({
                setCredentials: () => {
                    return {};
                }
            })
        );
        const authModel = new AuthModel({
            memberType: MemberType.Member,
            credentials: {}
        });
        const result = authModel.create();
        assert(result);

        oAuth2.restore();
    });

    it('create 正常 非会員', () => {
        const clientCredentials = sinon.stub(sasaki.auth, 'ClientCredentials').returns(
            Promise.resolve({})
        );
        const authModel = new AuthModel();
        const result = authModel.create();
        assert(result);

        clientCredentials.restore();
    });

    it('save 正常', () => {
        const authModel = new AuthModel();
        const session: any = {};
        authModel.save(session);
        assert(session.auth);
    });

});
