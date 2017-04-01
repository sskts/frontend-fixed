# Features


# Usage

* set environment variables - For example,
```shell
set NODE_ENV=**********環境名**********
set NPM_TOKEN=**********npm motionpicture トークン**********
set MP_ENDPOINT=**********mp apiのエンドポイント**********
set REDIS_HOST=**********REDISホスト**********
set REDIS_PORT=**********REDISポート**********
set REDIS_KEY=**********REDISキー**********
set GMO_CLIENT_MODULE=**********GMOCLIENTモージュールURL=**********
set GMO_ENDPOINT=**********gmo apiのエンドポイント**********
set COA_ENDPOINT=**********coa apiのエンドポイント**********
set COA_REFRESH_TOKEN=**********coa apiのリフレッシュトークン**********
set SSKTS_API_REFRESH_TOKEN=**********coa apiのリフレッシュトークン**********
set MVTK_ENDPOINT_SERVICE_01=**********ムビチケService apiのエンドポイント**********
set MVTK_ENDPOINT_SERVICE_02=**********ムビチケService2 apiのエンドポイント**********
set MVTK_ENDPOINT_RESERVE_SERVICE=**********ムビチケReserveService apiのエンドポイント**********
```

only on Aure WebApps

```shell
set WEBSITE_NODE_DEFAULT_VERSION=**********node.jsバージョン=**********
set WEBSITE_TIME_ZONE=Tokyo Standard Time
```
# Build

ビルドは以下で実行できます。

```shell
npm run build
```

# Tests

単体テストは以下で実行できます。

```shell
npm test
```

UIテストは以下で実行できます。

```shell
npm ui-test
```

# JsDoc

```shell
npm run jsdoc
```

`jsdocを作成できます。./docsに出力されます。
