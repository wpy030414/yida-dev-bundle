/**
 * 递归冻结对象及其所有嵌套属性。
 *
 * `DeepFreeze.of` 以深度优先方式遍历对象的所有自有数据属性，并对每个对象调用
 * `Object.freeze`。对于访问器属性（getter/setter），仅冻结属性描述符本身，
 * 不会调用 getter，也不会冻结其返回值，从而避免误冻结页面或运行时提供的
 * 可变外部对象。
 *
 * 该工具常用于将配置对象、常量集合或库返回的上下文快照转换为不可变对象，
 * 防止上层调用方意外修改内部状态。
 *
 * @summary 递归冻结对象及其所有嵌套属性。
 *
 * @since 26.7.1
 * @see `Object.freeze`
 */
export class DeepFreeze {
  /**
   * 递归冻结传入的对象及其所有嵌套属性。
   *
   * 非对象值（如原始类型、`null`）会被直接返回；已冻结的对象也会直接返回，
   * 避免重复处理。
   *
   * @summary 递归冻结传入的对象及其所有嵌套属性。
   *
   * @typeParam T 待冻结对象的类型。
   * @param value 待冻结的任意值。
   * @returns 冻结后的同一引用。
   * @since 26.7.1
   *
   * @example
   * ```ts
   * const config = DeepFreeze.of({
   *   api: { base: "https://example.com", timeout: 5000 },
   *   flags: ["a", "b"],
   * })
   *
   * // config.api.base = "..." // TypeError: Cannot assign
   * ```
   */
  static of<T>(value: T): T {
    if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
      return value
    }

    const descriptors = Object.getOwnPropertyDescriptors(value as object) as Record<
      PropertyKey,
      PropertyDescriptor
    >
    for (const key of Reflect.ownKeys(descriptors)) {
      const descriptor = descriptors[key]
      if (
        "value" in descriptor &&
        descriptor.value !== null &&
        typeof descriptor.value === "object"
      ) {
        this.of(descriptor.value)
      }
    }

    return Object.freeze(value)
  }
}
