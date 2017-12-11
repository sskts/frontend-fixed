/**
 * AwsCognitoService
 */
import * as AWS from 'aws-sdk';
import * as debug from 'debug';

const log = debug('SSKTS:AwsCognitoService');

const REGION: string = <string>process.env.COGNITO_REGION;
const IDENTITY_POOL_ID: string = <string>process.env.COGNITO_IDENTITY_POOL_ID;

/**
 * 端末IDで認証
 * @function authenticateWithTerminal
 * @param {string} identityId
 * @returns {AWS.CognitoIdentityCredentials}
 */
export function authenticateWithTerminal(identityId: string): AWS.CognitoIdentityCredentials {
    AWS.config.region = REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID,
        IdentityId: identityId
    });

    return (<AWS.CognitoIdentityCredentials>AWS.config.credentials);
}

/**
 * レコード更新
 * @function updateRecords
 * @param {string} args.datasetName
 * @param {object} args.value
 * @param {AWS.CognitoIdentityCredentials} args.credentials
 * @returns {Promise<void>}
 */
export async function updateRecords(args: {
    datasetName: string,
    value: object,
    credentials: AWS.CognitoIdentityCredentials
}) {
    if (args.credentials === null) throw new Error('credentials is null');
    await args.credentials.getPromise();
    const cognitoSync = new AWS.CognitoSync({
        credentials: args.credentials
    });
    const listRecords = await cognitoSync.listRecords({
        DatasetName: args.datasetName,
        IdentityId: args.credentials.identityId,
        IdentityPoolId: IDENTITY_POOL_ID,
        LastSyncCount: 0
    }).promise();
    if (listRecords.Records === undefined) {
        listRecords.Records = [];
    }

    const mergeValue = convertToObjects(listRecords.Records);
    Object.assign(mergeValue, args.value);

    const updateRecordsResult = await cognitoSync.updateRecords({
        DatasetName: args.datasetName,
        IdentityId: args.credentials.identityId,
        IdentityPoolId: IDENTITY_POOL_ID,
        SyncSessionToken: <string>listRecords.SyncSessionToken,
        RecordPatches: convertToRecords(mergeValue, <number>listRecords.DatasetSyncCount)
    }).promise();
    log('updateRecords');
    if (updateRecordsResult.Records === undefined) {
        updateRecordsResult.Records = [];
    }

    return convertToObjects(updateRecordsResult.Records);
}

/**
 * レコード取得
 * @function getRecords
 * @param {string} args.datasetName
 * @param {AWS.CognitoIdentityCredentials} args.credentials
 * @param {string} datasetName
 * @returns {Promise<any>}
 */
export async function getRecords(args: {
    datasetName: string,
    credentials: AWS.CognitoIdentityCredentials
}) {
    if (args.credentials === null) throw new Error('credentials is null');
    await args.credentials.getPromise();
    const cognitoSync = new AWS.CognitoSync({
        credentials: args.credentials
    });
    const listRecords = await cognitoSync.listRecords({
        DatasetName: args.datasetName,
        IdentityId: args.credentials.identityId,
        IdentityPoolId: IDENTITY_POOL_ID,
        LastSyncCount: 0
    }).promise();
    if (listRecords.Records === undefined) {
        listRecords.Records = [];
    }
    log('getRecords', convertToObjects(listRecords.Records));

    return convertToObjects(listRecords.Records);
}

/**
 * レコードの形式へ変換
 * @param {any} value
 * @param {number} count
 */
function convertToRecords(value: any, count: number): {
    Key: string;
    Op: string;
    SyncCount: number;
    Value: string;
}[] {
    return Object.keys(value).map((key: string) => {
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
function convertToObjects(records: any[]): any {
    const result: any = {};
    records.forEach((record: {
        Key: string;
        Op: string;
        SyncCount: number;
        Value: string;
    }) => {
        result[record.Key] = JSON.parse(record.Value);
    });

    return result;
}
