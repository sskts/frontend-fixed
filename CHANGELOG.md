# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased
### Added


### Changed


### Fixed
 - 印刷中アニメーション画像修正

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
- packageアップデート
    - @motionpicture/coa-service ^2.0.10 => ^3.1.0
    - fs-extra ^2.1.2 => ^3.0.1

### Fixed
- tslint修正（disable-next-line:variable-name）

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
