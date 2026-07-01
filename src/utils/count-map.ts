/**
 * 用于统计字符串键出现次数的计数映射。
 *
 * `CountMap` 继承自 `Map`，在键与计数器之间建立映射关系，
 * 并可选择为每个键关联一个类型为 `T` 的对象。适用于频次统计、
 * 标签计数、重复项检测等场景。
 *
 * @summary 用于统计字符串键出现次数的计数映射。
 *
 * @typeParam T 可选项关联对象的类型。
 * @since 26.4.13
 * @see {@link CountMap.from}
 *
 * @example
 * ```ts
 * const map = CountMap.from([
 *   ["apple", { category: "fruit" }],
 *   "banana",
 * ])
 * map.count("apple")
 * map.count("apple")
 * console.log(map.getCount("apple")) // 2
 * console.log(map.getObject("apple")) // { category: "fruit" }
 * ```
 */
export class CountMap<T> extends Map<string, { count: number; object?: T }> {
  /**
   * 从键数组或键-对象对数组创建新的 `CountMap` 实例。
   *
   * 传入数组时，每个元素既可以是仅含键的字符串，也可以是 `[键, 对象]` 元组。
   * 初始化后所有键的计数均为 `0`，后续可通过 {@link CountMap.count} 累加。
   *
   * @summary 从键数组或键-对象对数组创建新的 `CountMap` 实例。
   *
   * @typeParam T 可选项关联对象的类型。
   * @param keysOrEntries 键数组或键-对象对数组。
   * @returns 已初始化的新 `CountMap<T>` 实例。
   * @since 26.4.13
   *
   * @example
   * ```ts
   * const map = CountMap.from<string>(["x", ["y", "obj"]])
   * ```
   */
  static from<T>(keysOrEntries: string[] | Array<[string, T]>) {
    const countMap = new CountMap<T>()

    for (const item of keysOrEntries) {
      if (Array.isArray(item)) {
        const [key, object] = item
        countMap.set(key, { count: 0, object })
      } else {
        countMap.set(item, { count: 0 })
      }
    }

    return countMap
  }

  /**
   * 对指定键的计数器加一，并可关联一个对象。
   *
   * 若键已存在，则将其计数加 `1`，并用传入的 `object` 覆盖已关联的对象；
   * 若键不存在，则插入新记录，计数为 `1`。
   *
   * @summary 对指定键的计数器加一，并可关联一个对象。
   *
   * @param key 需要计数的键。
   * @param object 可选的关联对象，将覆盖该键之前关联的对象。
   * @since 26.4.13
   */
  count(key: string, object?: T) {
    const item = this.get(key)
    if (item) {
      item.count++
      item.object = object
    } else {
      this.set(key, { count: 1, object })
    }
  }

  /**
   * 获取指定键的当前计数值。
   *
   * 若键不存在或尚未计数，则返回 `0`。
   *
   * @summary 获取指定键的当前计数值。
   *
   * @param key 需要查询的键。
   * @returns 该键的计数值；键不存在时返回 `0`。
   * @since 26.4.13
   */
  getCount(key: string): number {
    return this.get(key)?.count ?? 0
  }

  /**
   * 获取指定键关联的对象。
   *
   * 若键不存在或未关联对象，则返回 `undefined`。
   *
   * @summary 获取指定键关联的对象。
   *
   * @param key 需要查询的键。
   * @returns 该键关联的类型为 `T` 的对象，或 `undefined`。
   * @since 26.4.13
   */
  getObject(key: string): T | undefined {
    return this.get(key)?.object
  }
}
