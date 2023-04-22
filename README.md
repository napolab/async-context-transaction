# @napolab/transaction sandbox

AsyncContext を使った transaction の実装サンプル

[![Image from Gyazo](https://i.gyazo.com/712bd2ebbab57a976035a0a09d38baf3.png)](https://gyazo.com/712bd2ebbab57a976035a0a09d38baf3)

client がこのように実装されているとする。
transaction が呼ばれたら、AsyncContext に transaction が開始された情報を格納する。
query は常に AsyncContext に格納されている db client を使ってクエリを実行するため、transaction 状態を判別して実装を差し替えることができる。

```typescript
interface DBClient {
  query<T>(query: string): PromiseLike<T>;
  transaction<T>(callback: () => PromiseLike<T>): PromiseLike<T>;
}
```
