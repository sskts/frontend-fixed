# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased
### Added

### Changed

### Fixed

### Security

## 2.8.3 - 2021-04-30
### Added
 - エントランスへのリクエストに「sellerId」、「redirectUrl」を追加

## 2.8.2 - 2020-12-09
### Added
 - 注文取引の明示的な中止

## 2.8.1 - 2020-11-27
### Changed
 - 確認番号での注文照会結果を新しい型に対応

## 2.8.0 - 2020-08-18
### Changed
 - @cinerino/sdkへ変更
 - StarWebPRNTSDK更新
 
## 2.7.4 - 2020-07-13
### Changed
 - ムビチケ決済処理をサービス側へ変更

## 2.7.3 - 2020-07-07
### Changed
 - SDKアップデート
 - confirmationNumber参照を予約番号に変更
 - Cinerino SDKでサービスインスタンス生成時にプロジェクト指定へ変更

## 2.7.2 - 2020-06-30
### Changed
 - ムビチケロゴ変更

## 2.7.2 - 2020-06-30
### Changed
 - ムビチケロゴ変更

## 2.7.1 - 2020-03-13
### Added
 - 緊急用スクリーン追加

## 2.7.0 - 2020-02-10
### Changed
 - スケジュールをjson形式で取得へ変更

## 2.6.0 - 2019-12-05
### Changed
 - SDK変更

## 2.5.1 - 2019-08-24
### Changed
- jqueryをcdnから変更

## 2.5.0 - 2019-05-24
### Changed
- [@motionpicture/sskts-api-javascript-client@8.0.1](https://github.com/motionpicture/sskts-api-javascript-client)に対応。
- [@motionpicture/sskts-api-nodejs-client@8.0.1](https://github.com/motionpicture/sskts-api-nodejs-client)に対応。

## 2.4.2 - 2019-02-08
### Fixed
 - 印刷不具合修正（APIアップデートによる互換性調整）

## 2.4.1 - 2017-11-21
### Changed
 - 4DX動的金額対応

## 2.4.0 - 2017-01-23
### Added
 - スクリーン生成API追加
 - スマホアプリ用購入完了メール追加
 - スマホアプリプッシュ通知連携追加

## 2.3.3 - 2017-12-21
### Fixed
 - iPhone券種選択不具合修正

## 2.3.2 - 2017-12-20
### Fixed
 - 池袋スクリーン5修正

## 2.3.1 - 2017-12-13
### Fixed
 - ムビチケサイトコード変換修正
 - 照会ページリロード時自動認証機能修正

## 2.3.0 - 2017-12-11
### Added
 - 池袋劇場の座席データ追加
 - WAITER導入

## 2.2.0 - 2017-12-04
### Added
 - 電話番号バリデーション追加 [google-libphonenumber@3.0.9](https://github.com/ruimarinho/google-libphonenumber)

## 2.1.0 - 2017-11-21
### Added
 - スケジュール取得追加
### Changed
 - ムビチケサービス変更 [@motionpicture/mvtk-reserve-service@^1.1.0](https://github.com/motionpicture/mvtk-reserve-service)
### Fixed
 - 復数リクエスト対策（クライアントサイド）

## 2.0.0 - 2017-10-27
### Added
 - 会員フロー追加
 - テストコード追加
 - ムビチケQRコードリーダ読み込み機能追加
### Changed
 - APIのバージョン変更

## 1.8.2 - 2017-10-11
### Fixed
 - [Webアプリ] メンテナンス文言画面

## 1.8.2 - 2017-10-11
### Fixed
 - [Webアプリ] メンテナンス文言画面

## 1.8.1 - 2017-08-29
### Fixed
 - [Webアプリ] 購入完了メールのチケット照会リンク先を購入番号自動入力へ修正

## 1.8.0 - 2017-07-24
### Added
 - [券売機] 一定時間操作しないと勝手に画面TOPに戻る機能
 - [券売機] 購入/発券完了後すぐに画面TOPに戻す機能
 - [券売機] 「最初に戻る」ボタン押した時「予約内容を削除して戻る」旨のアラート表示

 ### Security
- 依存パッケージを最新に更新。
- [typescript@^2.4.2](https://github.com/Microsoft/TypeScript)

## 1.7.0 - 2017-07-18
### Changed
 - [券売機] QRコードの発行を上映日から1ヶ月に変更
 - [Webアプリ] Google Chart APIでのQR生成を廃止、jsで生成へ変更

### Fixed
 - 座席選択表示スピード改善

### Security
- packageアップデート
- @motionpicture/coa-service@^3.4.0に対応。
- @types/request-promise-native@1.0.6に対応。
- [express-validator@3.2.1](https://github.com/ctavan/express-validator)に対応。

## 1.6.1 - 2017-06-30
### Fixed
 - [券売機] スケジュール選択デザイン修正

## 1.6.0 - 2017-06-28
### Added
 - [券売機] 設定ページへテスト印刷ボタン追加

### Changed
 - [券売機] チケット発券可能時間変更（上映後10分まで）
 - [券売機] スケジュール選択のステータス表示変更

### Fixed
 - [券売機] プリンターエラー表示修正
 - アナリティクスのイベントへ劇場ID追加、カスタムイベントへ劇場ID追加、発券時計測イベント追加

## 1.5.3 - 2017-06-23
### Changed
 - [券売機] GoogleアナリティクスID変更

## 1.5.2 - 2017-06-23
### Fixed
 - [券売機] ナビゲーション文言修正
 - [券売機] テンキー操作性改善
 - [券売機] エラー画面へ戻るボタン設置

## 1.5.1 - 2017-06-23
### Added
 - [券売機] 設定ページへ証明書ダウンロードリンク追加
 - [券売機] プリンターエラー時に再試行ボタン追加
### Fixed
 - [北島] 利用規約修正
 - [券売機] TOPページQRコード修正


## 1.5.0 - 2017-06-22
### Added
 - [券売機] テンキー追加
 - [北島] 利用規約・注意事項追加

### Changed 
 - [券売機] チケット券面デザイン変更
 - 購入完了ページチケットレス入場のアナウンスデザイン変更
 - オンライン販売可能時間の制御を変更

### Removed
 - [券売機] 座席選択のズーム機能削除

### Fixed 
 - [券売機] 購入フローデザイン修正
 - [券売機] ブラウザ戻るボタン対応

## 1.4.3 - 2017-06-16
### Fixed 
 - ムビチケ選択後クレジットカードへ変更時エラー修正
 
## 1.4.2 - 2017-06-14
### Added
- 券売機COA本予約が間に合わなかった場合本予約する機能追加

### Fixed
- 券売機ムビチケバリデーション画面修正

## 1.4.1 - 2017-06-13
### Fixed
- テストコード修正

## 1.4.0 - 2017-06-13
### Added
- 券売機フロー追加
    - Template出し分け（環境変数で制御）
    - 発券機連携
- 北島マスタ追加（スクリーン座席）

### Changed
- 購入完了メールの劇場電話番号を動的に変更

### Fixed
- tslint修正（disable-next-line:variable-name）

### Security
- packageアップデート
- @motionpicture/coa-service@^3.1.0に対応。
- [fs-extra@^3.0.1](https://github.com/jprichardson/node-fs-extra)に対応。

## 1.3.3 - 2017-05-23
### Fixed
- クライアント情報収集タグ位置情報取得場所修正

## 1.3.2 - 2017-05-23
### Fixed
- CHANGELOG.md更新

## 1.3.1 - 2017-05-23
### Fixed
- package.json修正（scripts: css）

## 1.3.0 - 2017-05-22
### Added
- CHANGELOG.md追加

## 1.2.2 - 2017-05-19
### Fixed
- README.md更新

## 1.2.1 - 2017-05-19
### Fixed
- package.json修正（scripts: preversion）

## 1.2.0 - 2017-05-19
### Added
- クライアント情報収集タグ追加（GMOエラー、購入情報入力バリデーション、購入完了、チケット情報照会バリデーション）

## 1.1.0 - 2017-05-19

### Added
- 4DX作品とその他選択時の券種表示切り替え追加
- 購入内容確認ページ文言追加
- 推奨環境以外のIEでのアクセス制限追加
- Google Analyticsイベントトラッキング タグ追加（購入完了、チケット情報確認QRコード表示/非表示）

### Changed
- GMOエラー文言表示方法変更
- 「予約照会画面」の戻り先変更
- SP版座席選択画面で拡大する用のボタン変更
- ムビチケ着券情報連携できるよう変更
- QRコード生成APIのSSL対応へ変更

### Fixed
- 姶良BESTIAスクリーンの座席修正
- 座席選択から券種選択遷移スピード改善

## 1.0.0 - 2017-04-18
### Added
- ファーストリリース
