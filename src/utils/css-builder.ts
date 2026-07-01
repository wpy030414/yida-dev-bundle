/**
 * 用于链式构建 CSS 样式字符串的构建器。
 *
 * `CSSBuilder` 继承自 `Map`，以 CSS 属性名为键、属性值为值。
 * 调用方可通过 `set` 方法逐步追加样式，最终调用 {@link CSSBuilder.toString}
 * 生成 `property:value;` 格式的内联样式字符串。
 *
 * @summary 用于链式构建 CSS 样式字符串的构建器。
 *
 * @since 26.4.13
 * @see {@link Utils.Logger}
 *
 * @example
 * ```ts
 * const style = CSSBuilder.from({
 *   color: "#333",
 *   "font-size": "14px",
 * })
 *   .set("margin", "8px")
 *   .toString()
 * // "color:#333;font-size:14px;margin:8px;"
 * ```
 */
export class CSSBuilder extends Map<string, string> {
  /**
   * 从普通对象创建新的 `CSSBuilder` 实例。
   *
   * 遍历传入对象的所有可枚举属性，将属性名与属性值作为 CSS 属性
   * 名与值存入新的构建器。
   *
   * @summary 从普通对象创建新的 `CSSBuilder` 实例。
   *
   * @param source 包含 CSS 属性键值对的对象。
   * @returns 已填充样式的新 `CSSBuilder` 实例。
   * @since 26.4.13
   *
   * @example
   * ```ts
   * const builder = CSSBuilder.from({ padding: "4px 8px" })
   * ```
   */
  static from(source: Record<string, string>) {
    const _ = new CSSBuilder()
    for (const [k, v] of Object.entries(source)) {
      _.set(k, v)
    }
    return _
  }

  /**
   * 将当前构建器中所有样式转换为 CSS 字符串。
   *
   * 每个样式条目将渲染为 `property:value;` 格式，并按键值对迭代顺序拼接。
   *
   * @summary 将当前构建器中所有样式转换为 CSS 字符串。
   *
   * @returns 拼接后的 CSS 样式字符串。
   * @since 26.4.13
   */
  toString() {
    return Array.from(this)
      .map((e) => `${e[0]}:${e[1]};`)
      .join("")
  }
}
