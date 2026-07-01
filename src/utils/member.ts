/**
 * 表示选择器或表单中的成员项。
 *
 * 成员项包含唯一标识 `id` 与展示名称 `name`，常用于宜搭成员选择组件
 * 的值标准化。{@link Member.from} 支持从 `YidaComponent` 原始值格式创建实例。
 *
 * @summary 表示选择器或表单中的成员项。
 *
 * @since 26.4.13
 * @see `YidaComponent`
 *
 * @example
 * ```ts
 * const member = Member.from({ value: "user_123", label: "张三" })
 * console.log(member.id)   // "user_123"
 * console.log(member.name) // "张三"
 * ```
 */
export class Member {
  /**
   * 创建一个新的 `Member` 实例。
   *
   * @summary 创建一个新的 `Member` 实例。
   *
   * @param id 成员唯一标识。
   * @param name 成员展示名称。
   * @since 26.4.13
   */
  constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  /**
   * 从宜搭原始数据创建新的 `Member` 实例。
   *
   * 当传入数组时，仅取第一个元素进行解析。若原始数据缺失 `value` 或
   * `label` 字段，或字段类型不为字符串，则返回 `id` 与 `name` 均为空字符串
   * 的兜底实例。
   *
   * @summary 从宜搭原始数据创建新的 `Member` 实例。
   *
   * @param raw 包含成员信息的原始数据，通常为 `YidaComponent` 返回的值。
   * @returns 解析后的 `Member` 实例。
   * @since 26.4.13
   */
  static from(raw: Record<string, unknown> | Record<string, unknown>[]) {
    const item = Array.isArray(raw) ? raw[0] : raw

    if (!item || typeof item.value !== "string" || typeof item.label !== "string") {
      return new Member("", "")
    }

    return new Member(item.value, item.label)
  }
}
