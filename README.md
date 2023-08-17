# GitHub のリポジトリ init してくれるくん

## 何をするやつか

リポジトリ作成イベントの Webhook で起動して、そのリポジトリに対して team アクセスを追加してくれる GitHub App のサンプル

### team アクセスとは

これです

![image](https://github.com/assets/3516343/57c344fa-c28a-4b32-8653-959dc842bcd0)

## 使い方

### App の作成

https://github.com/settings/apps/new で作成する

-   Webhook URL: このアプリが動いている URL を入れる ローカルで試す場合は ngrok や smee などで露出させる必要がある
-   Webhook secret:ランダムな文字
    > エントロピが高いランダムな文字列を入力します。 たとえば、ターミナルで `ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'` を含む文字列を生成できます。
    >
    > https://docs.github.com/ja/webhooks-and-events/webhooks/securing-your-webhooks
-   Permissions:
    -   Repository permissions:
        -   Administration: Read & write
            -   team の追加に必要
            -   追加すると Metadata も勝手に追加される
    -   Organization permissions:
        -   Members: Read
            -   team の追加に必要
-   Subscribe to events:
    -   Repository: チェックを入れる
        -   リポジトリ作成イベントを受け取るために必要
-   Where can this GitHub App be installed?
    -   Any account
        -   org に対してインストールするために必要

### .env の設定

`.env.example` をコピーして `.env` を作成する

項目を埋める

-   WEBHOOK_SECRET: App 作成時に設定した Webhook secret
-   APP_ID: App の About にある App ID
-   PRIVATE_KEY: 後述

#### Private key の作成

App を作成したら Generate a private key をクリックして pem ファイルをダウンロードする

ここでもらえる pem は PKCS#1 だけどリクエストは PKCS#8 である必要があるのであらかじめ openssl で変換しておく

```
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private-key.pem -out private-key-pkcs8.key
```

base64 にエンコードしておく

```
base64 -i private-key-pkcs8.key
```

出力を.env の `PRIVATE_KEY` に設定する

詳しく: https://github.com/gr2m/universal-github-app-jwt#readme

### App のインストール

App の Public Page にアクセスして Install を押して任意の org に入れる

たぶん All repositories にしないと動かないんじゃないか？（未検証）

### 起動

```
deno task start
```

### 動作の確認

リポジトリを作成して、そのリポジトリに team が追加されていることを確認する
