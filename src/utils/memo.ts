/**
 * 基于 `sessionStorage` 的对象状态记忆与差异比较工具。
 *
 * `Memo` 将对象的 JSON 序列化结果持久化到 `sessionStorage`，
 * 并提供 {@link Memo.compare} 与 {@link Memo.update} 方法，
 * 用于检测对象是否发生变化以及更新记忆状态。
 *
 * @summary 基于 `sessionStorage` 的对象状态记忆与差异比较工具。
 *
 * @since 26.4.13
 *
 * @example
 * ```ts
 * const memo = Memo.of("formState")
 * const changed = memo.compare({ name: "Yida" })
 * if (changed) {
 *   memo.update({ name: "Yida" })
 * }
 * ```
 */
export class Memo {
  /**
   * 创建一个新的 `Memo` 实例，并立即将对象持久化到 `sessionStorage`。
   *
   * @summary 创建一个新的 `Memo` 实例，并立即将对象持久化到 `sessionStorage`。
   *
   * @param name 记忆对象的唯一标识名称。
   * @param object 需要记忆的初始对象。
   * @since 26.4.13
   * @see {@link Memo.of}
   */
  constructor(
    readonly name: string,
    readonly object: object,
  ) {
    sessionStorage.setItem(`diff_cache_${name}`, JSON.stringify(object))
  }

  /**
   * 尝试从 `sessionStorage` 恢复记忆对象；若不存在则创建空对象记忆。
   *
   * 当缓存内容存在但 JSON 解析失败时，会静默忽略错误并返回一个以空对象
   * 为初始状态的新实例。
   *
   * @summary 尝试从 `sessionStorage` 恢复记忆对象；若不存在则创建空对象记忆。
   *
   * @param name 记忆对象的唯一标识名称。
   * @returns 恢复或新建的 `Memo` 实例。
   * @since 26.4.13
   * @see {@link Memo}
   */
  static of(name: string) {
    const cache = sessionStorage.getItem(`diff_cache_${name}`)
    if (cache) {
      try {
        const object = JSON.parse(cache)
        return new Memo(name, object)
      } catch (e) {}
    }
    return new Memo(name, {})
  }

  /**
   * 比较当前记忆对象与新对象的哈希值是否相同。
   *
   * 通过 {@link Memo.hashCode} 分别计算两个对象的哈希值，相等则视为未变化。
   *
   * @summary 比较当前记忆对象与新对象的哈希值是否相同。
   *
   * @param newObject 需要比较的新对象。
   * @returns 若两对象哈希值相同返回 `true`，否则返回 `false`。
   * @since 26.4.13
   */
  compare(newObject: object) {
    return this.hashCode() === this.hashCode(newObject)
  }

  /**
   * 更新记忆的对象状态，并将新状态同步到 `sessionStorage`。
   *
   * @summary 更新记忆的对象状态，并将新状态同步到 `sessionStorage`。
   *
   * @param newObject 需要更新的新对象。
   * @returns 包含新对象状态的 `Memo` 实例。
   * @since 26.4.13
   */
  update(newObject: object) {
    return new Memo(this.name, newObject)
  }

  /**
   * 计算指定对象的哈希值。
   *
   * 默认使用当前记忆的对象进行计算。实现基于 JSON 字符串的循环字符编码；
   * 若对象无法序列化，则返回一个随机的十六进制字符串。
   *
   * @summary 计算指定对象的哈希值。
   *
   * @param object 需要计算哈希值的对象，默认为当前记忆对象。
   * @returns 十六进制格式的哈希字符串。
   * @since 26.4.13
   */
  hashCode(object = this.object) {
    try {
      const str = JSON.stringify(object)
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0
      }
      return hash.toString(16)
    } catch (e) {
      return Math.random().toString(16)
    }
  }
}
