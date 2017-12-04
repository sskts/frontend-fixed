"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * AwsCognitoService
 */
const AWS = require("aws-sdk");
const debug = require("debug");
const log = debug('SSKTS:AwsCognitoService');
const REGION = process.env.COGNITO_REGION;
const IDENTITY_POOL_ID = process.env.COGNITO_IDENTITY_POOL_ID;
/**
 * 端末IDで認証
 * @function authenticateWithTerminal
 * @param {string} identityId
 * @returns {AWS.CognitoIdentityCredentials}
 */
function authenticateWithTerminal(identityId) {
    AWS.config.region = REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID,
        IdentityId: identityId
    });
    return AWS.config.credentials;
}
exports.authenticateWithTerminal = authenticateWithTerminal;
/**
 * レコード更新
 * @function updateRecords
 * @param {string} args.datasetName
 * @param {object} args.value
 * @param {AWS.CognitoIdentityCredentials} args.credentials
 * @returns {Promise<void>}
 */
function updateRecords(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.credentials === null)
            throw new Error('credentials is null');
        yield args.credentials.getPromise();
        const cognitoSync = new AWS.CognitoSync({
            credentials: args.credentials
        });
        const listRecords = yield cognitoSync.listRecords({
            DatasetName: args.datasetName,
            IdentityId: args.credentials.identityId,
            IdentityPoolId: IDENTITY_POOL_ID,
            LastSyncCount: 0
        }).promise();
        const mergeValue = convertToObjects(listRecords.Records);
        Object.assign(mergeValue, args.value);
        const updateRecordsResult = yield cognitoSync.updateRecords({
            DatasetName: args.datasetName,
            IdentityId: args.credentials.identityId,
            IdentityPoolId: IDENTITY_POOL_ID,
            SyncSessionToken: listRecords.SyncSessionToken,
            RecordPatches: convertToRecords(mergeValue, listRecords.DatasetSyncCount)
        }).promise();
        log('updateRecords');
        return convertToObjects(updateRecordsResult);
    });
}
exports.updateRecords = updateRecords;
/**
 * レコード取得
 * @function getRecords
 * @param {string} args.datasetName
 * @param {AWS.CognitoIdentityCredentials} args.credentials
 * @param {string} datasetName
 * @returns {Promise<any>}
 */
function getRecords(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.credentials === null)
            throw new Error('credentials is null');
        yield args.credentials.getPromise();
        const cognitoSync = new AWS.CognitoSync({
            credentials: args.credentials
        });
        const listRecords = yield cognitoSync.listRecords({
            DatasetName: args.datasetName,
            IdentityId: args.credentials.identityId,
            IdentityPoolId: IDENTITY_POOL_ID,
            LastSyncCount: 0
        }).promise();
        log('getRecords', convertToObjects(listRecords.Records));
        return convertToObjects(listRecords.Records);
    });
}
exports.getRecords = getRecords;
/**
 * レコードの形式へ変換
 * @param {any} value
 * @param {number} count
 */
function convertToRecords(value, count) {
    return Object.keys(value).map((key) => {
        return {
            Key: key,
            Op: 'replace',
            SyncCount: count,
            Value: JSON.stringify(value[key])
        };
    });
}
/**
 * レコードの形式へ変換
 * @param {any} records
 * @param {number} count
 */
function convertToObjects(records) {
    const result = {};
    records.forEach((record) => {
        result[record.Key] = JSON.parse(record.Value);
    });
    return result;
}
