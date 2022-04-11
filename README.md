# Features

# Usage

* set environment variables - For example,

| Name                      | Required | Value | Purpose                 |
| ------------------------- | -------- | ----- | ----------------------- |
| `NODE_ENV`                | true     |       | NODE ENV                |
| `NPM_TOKEN`               | false    |       | NPM TOKEN               |
| `SSKTS_API_ENDPOINT`      | true     |       | SSKTS API ENDPOINT      |
| `REDIS_HOST`              | true     |       | REDIS HOST              |
| `REDIS_PORT`              | true     |       | REDIS PORT              |
| `REDIS_KEY`               | true     |       | REDIS KEY               |
| `GMO_ENDPOINT`            | true     |       | GMO ENDPOINT            |
| `COA_ENDPOINT`            | true     |       | COA ENDPOINT            |
| `COA_REFRESH_TOKEN`       | true     |       | COA REFRESH TOKEN       |
| `CLIENT_ID`               | true     |       | CLIENT ID               |
| `CLIENT_SECRET`           | true     |       | CLIENT SECRET           |
| `AUTHORIZE_SERVER_DOMAIN` | true     |       | AUTHORIZE SERVER DOMAIN |
| `RESOURCE_SERVER_URL`     | true     |       | RESOURCE SERVER URL     |
| `ENTRANCE_SERVER_URL`     | true     |       | ENTRANCE SERVER URL     |
| `MOVIETICKET_CODE`        | false    |       | MOVIETICKET CODE        |


only on Aure WebApps

```shell
set WEBSITE_NODE_DEFAULT_VERSION=**********node.jsバージョン**********
set WEBSITE_TIME_ZONE=Tokyo Standard Time
```

クロスドメイン、iframeからのリクエスト許可

```shell
set WHITELIST=**********カンマつなぎのURLリスト**********
```

IP制限をかけたい場合

```shell
set SSKTS_ALLOWED_IPS=**********カンマつなぎのIPリスト**********
```

ベーシック認証をかけたい場合

```shell
set SSKTS_BASIC_AUTH_NAME=**********認証ユーザー名**********
set SSKTS_BASIC_AUTH_PASS=**********認証パスワード**********
```

メンテナンスページを表示させたい場合

```shell
set SSKTS_MAINTENANCE_TEXT=**********適当な文字列**********
```


# Build

ビルドは以下で実行できます。
- typescript
```shell
npm run build
```

- scss
```shell
npm run css
```

# Tests

単体テストは以下で実行できます。

```shell
npm test
```

<!-- UIテストは以下で実行できます。

```shell
npm ui-test
``` -->

# JsDoc

```shell
npm run jsdoc
```

`jsdocを作成できます。./docsに出力されます。
