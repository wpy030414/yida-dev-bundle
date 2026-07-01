import { DateX, Memo, SchoolDays, SchoolDaysPreset } from "../utils"

/**
 * 宜搭组件侵入式改造与教育时间语义化工具集。
 *
 * 本模块通过劫持并改造宜搭组件行为，动态生成学年、学期、年级、班级、
 * 周次、星期、上下午等教育场景常用选项，无需手动配置数据源即可将普通
 * 输入框或下拉框转换为具有业务语义的组件。
 *
 * 核心抽象为 {@link Infection.HijackedComponent} 与
 * {@link Infection.VirtualComponent}。前者负责定义组件的值与选项生成逻辑，
 * 后者负责将生成的值与选项注入到目标宜搭组件中。
 *
 * @summary 宜搭组件侵入式改造与教育时间语义化工具集。
 *
 * @since 26.7.1
 * @see {@link https://docs.aliwork.com/docs/developer/api/yidaAPI}
 * @see {@link Utils.SchoolDays}
 * @see {@link Utils.DateX}
 * @see {@link Utils.Memo}
 *
 * @example
 * ```js
 * Infection.SchoolYear.of()
 *   .infect("selectField_xxx")
 *   .setDefaultValue()
 *   .setOptions()
 * ```
 */
export namespace Infection {
  /**
   * 宜搭开发者 API 官方参考文档地址。
   *
   * @summary 宜搭开发者 API 官方参考文档地址。
   *
   * @since 26.7.1
   * @see {@link https://docs.aliwork.com/docs/developer/api/yidaAPI}
   */
  export const ref = "https://docs.aliwork.com/docs/developer/api/yidaAPI"

  /**
   * 组件劫持基类。
   *
   * 本抽象类定义了可被 {@link Infection.VirtualComponent} 转换的劫持组件
   * 契约。子类通过实现 {@link HijackedComponent.main} 方法生成组件的
   * {@link HijackedComponent.value | 默认值} 与
   * {@link HijackedComponent.options | 选项列表}，随后可调用
   * {@link HijackedComponent.infect} 方法将自身转换为虚拟组件并绑定到
   * 目标字段。
   *
   * 多个劫持组件还可通过 {@link HijackedComponent.compose} 方法进行组合，
   * 生成一个新的 {@link Infection.VirtualComponent}，其值为各组件值的连接，
   * 选项为各组件选项的笛卡尔积。
   *
   * @summary 组件劫持基类。
   *
   * @since 26.7.1
   * @see {@link Infection.VirtualComponent}
   * @see {@link Infection.SchoolYear}
   * @see {@link Infection.Semester}
   * @see {@link Infection.Grade}
   * @see {@link Infection.Class}
   * @see {@link Infection.Week}
   * @see {@link Infection.WeekDay}
   * @see {@link Infection.HalfDay}
   */
  export abstract class HijackedComponent {
    /**
     * 组件主逻辑方法，需在子类中实现。
     *
     * 子类应在此方法中完成 {@link HijackedComponent.value} 与
     * {@link HijackedComponent.options} 的生成，并返回当前实例以支持链式调用。
     *
     * @summary 组件主逻辑方法，需在子类中实现。
     *
     * @returns 当前组件实例。
     * @protected
     * @throws {Error} 当子类未实现此方法时抛出。
     * @since 26.7.1
     */
    protected main(): this {
      throw new Error("Method not implemented.")
    }

    /**
     * 时间语义化预设配置项。
     *
     * 该配置项在实例化时传入，供 {@link HijackedComponent.main} 方法使用，
     * 用于控制学年、学期、周次等时间相关组件的计算基准。
     *
     * @summary 时间语义化预设配置项。
     *
     * @since 26.7.1
     * @see {@link Utils.SchoolDaysPreset}
     */
    preset: SchoolDaysPreset = {}

    /**
     * 创建并初始化一个劫持组件实例。
     *
     * 工厂方法会创建子类实例，并将传入的预设配置合并到
     * {@link HijackedComponent.preset} 中，然后自动调用
     * {@link HijackedComponent.main} 完成初始化。
     *
     * @summary 创建并初始化一个劫持组件实例。
     *
     * @typeParam T 具体的劫持组件子类类型。
     * @param preset 可选的时间语义化预设配置项，将传入组件实例供其主逻辑使用。
     * @returns 已完成初始化的组件实例。
     * @since 26.7.1
     * @see {@link Utils.SchoolDaysPreset}
     */
    static of<T extends HijackedComponent>(this: new () => T, preset: SchoolDaysPreset = {}) {
      const instance = new this()
      Object.assign(instance.preset, preset)
      return instance.main()
    }

    /**
     * 组件的默认值。
     *
     * 该值通常由 {@link HijackedComponent.main} 方法计算得出，并通过
     * {@link VirtualComponent.setDefaultValue} 注入到目标组件中。
     *
     * @summary 组件的默认值。
     *
     * @since 26.7.1
     */
    value = ""

    /**
     * 组件的选项列表。
     *
     * 每个选项包含 `text`（显示文本）与 `value`（实际值）两个字段，适用于
     * 下拉框、单选框等宜搭组件。该列表通常由 {@link HijackedComponent.main}
     * 方法计算得出，并通过 {@link VirtualComponent.setOptions} 注入到目标组件中。
     *
     * @summary 组件的选项列表。
     *
     * @since 26.7.1
     */
    options: { text: string; value: string }[] = []

    /**
     * 目标组件的字段标识。
     *
     * 该字段标识用于在 {@link HijackedComponent.infect} 或
     * {@link HijackedComponent.compose} 方法中指定需要被改造的目标宜搭组件。
     *
     * @summary 目标组件的字段标识。
     *
     * @since 26.7.1
     */
    fieldId = ""

    /**
     * 将当前劫持组件转换为虚拟组件，并绑定到指定的目标字段。
     *
     * 该方法会创建一个 {@link Infection.VirtualComponent} 实例，并将当前组件的
     * 值、选项与目标字段标识注入其中。返回的虚拟组件可进一步调用
     * {@link VirtualComponent.setDefaultValue} 与
     * {@link VirtualComponent.setOptions} 完成实际改造。
     *
     * @summary 将当前劫持组件转换为虚拟组件，并绑定到指定的目标字段。
     *
     * @param fieldId 目标宜搭组件的字段标识，例如 `"selectField_xxx"`。
     * @returns 绑定后的虚拟组件实例。
     * @since 26.7.1
     * @see {@link Infection.VirtualComponent}
     */
    infect(fieldId: string) {
      return VirtualComponent.from(this.value, this.options, fieldId)
    }

    /**
     * 将当前组件与另一个组件进行组合，生成新的虚拟组件。
     *
     * 组合逻辑如下：
     * - 新值为两个组件 {@link HijackedComponent.value | value} 的连接。
     * - 新选项为两个组件 {@link HijackedComponent.options | options} 的笛卡尔积，
     *   其中 `text` 与 `value` 分别由对应字段连接而成。
     * - 新目标字段标识取两个组件 {@link HijackedComponent.fieldId | fieldId} 中非空者。
     *
     * 例如，若当前组件值为 `"2023-2024学年"`，另一组件值为 `"第一学期"`，
     * 则组合后的值为 `"2023-2024学年第一学期"`。
     *
     * @summary 将当前组件与另一个组件进行组合，生成新的虚拟组件。
     *
     * @param another 另一个劫持组件实例。
     * @returns 组合后的虚拟组件实例。
     * @since 26.7.1
     * @see {@link Infection.VirtualComponent}
     */
    compose(another: HijackedComponent) {
      const value = this.value + another.value
      const options = []
      for (const o1 of this.options) {
        for (const o2 of another.options) {
          options.push({
            text: o1.text + o2.text,
            value: o1.value + o2.value,
          })
        }
      }
      const fieldId = this.fieldId || another.fieldId
      return VirtualComponent.from(value, options, fieldId)
    }
  }

  /**
   * 虚拟组件类。
   *
   * 本类表示一个已经生成值与选项、并绑定到目标字段的虚拟组件。通过调用
   * {@link VirtualComponent.setDefaultValue} 与
   * {@link VirtualComponent.setOptions} 方法，可将值与选项注入到目标宜搭组件中，
   * 实现组件的动态改造。此外，{@link VirtualComponent.useMemo} 方法可用于记忆
   * 组件值并在后续变更时同步更新。
   *
   * 虚拟组件实例通过 {@link VirtualComponent.from} 工厂方法创建，创建后会被
   * `Object.freeze` 冻结，字段不可再修改。
   *
   * @summary 虚拟组件类。
   *
   * @since 26.7.1
   * @extends {Infection.HijackedComponent}
   * @see {@link Infection.HijackedComponent}
   * @see {@link YidaComponent}
   * @see {@link YidaPageContext}
   */
  export class VirtualComponent extends HijackedComponent {
    /**
     * 创建一个新的虚拟组件实例。
     *
     * 构造函数为私有，外部应使用 {@link VirtualComponent.from} 工厂方法创建实例。
     *
     * @summary 创建一个新的虚拟组件实例。
     *
     * @param value 组件默认值。
     * @param options 组件选项列表。
     * @param fieldId 目标宜搭组件字段标识。
     * @since 26.7.1
     */
    private constructor(
      readonly value: string,
      readonly options: { text: string; value: string }[],
      readonly fieldId: string,
    ) {
      super()

      this.value = value
      this.options = options
      this.fieldId = fieldId
    }

    /**
     * 创建一个不可变的虚拟组件实例。
     *
     * 该方法会调用私有构造函数创建实例，并通过 `Object.freeze` 冻结后返回。
     *
     * @summary 创建一个不可变的虚拟组件实例。
     *
     * @param value 组件默认值。
     * @param options 组件选项列表。
     * @param fieldId 目标宜搭组件字段标识。
     * @returns 被冻结的虚拟组件实例。
     * @since 26.7.1
     */
    static from(value: string, options: { text: string; value: string }[], fieldId: string) {
      return Object.freeze(new VirtualComponent(value, options, fieldId))
    }

    /**
     * 将当前虚拟组件的值注入到目标组件中作为默认值。
     *
     * 该方法会尝试通过 {@link YidaPageContext.$} 获取目标组件，并调用其
     * `setValue` 方法注入当前值。若目标组件当前值为空（或为长度为零的数组），
     * 才会执行注入；否则保留现有值。
     *
     * @summary 将当前虚拟组件的值注入到目标组件中作为默认值。
     *
     * @returns 当前虚拟组件实例，支持链式调用。
     * @throws {Error} 当目标组件不存在时抛出。
     * @since 26.7.1
     * @see {@link YidaComponent}
     */
    setDefaultValue() {
      let _
      if ((_ = window.usePlus().env.context.$(this.fieldId))) {
        const v = _.getValue()
        if (!v || (v instanceof Array && !v.length)) {
          _.setValue(this.value)
        }
      } else {
        throw new Error("未找到目标元素，无法设置默认值！")
      }
      return this
    }

    /**
     * 将当前虚拟组件的选项列表注入到目标组件中。
     *
     * 根据目标字段标识的前缀，采用不同的注入策略：
     * - 若字段以 `text` 开头，则为文本输入框创建一个 `datalist` 元素，
     *   并将选项作为 `option` 子元素追加到该 `datalist`，同时设置输入框的
     *   `list` 属性指向该 `datalist`。
     * - 若字段以 `radio`、`checkbox`、`select` 或 `multiSelect` 开头，
     *   则调用目标组件的 `set("dataSource", options)` 方法注入数据源。
     *
     * @summary 将当前虚拟组件的选项列表注入到目标组件中。
     *
     * @returns 当前虚拟组件实例，支持链式调用。
     * @throws {Error} 当目标组件不存在或类型不支持时抛出。
     * @since 26.7.1
     * @see {@link YidaComponent}
     */
    setOptions() {
      if (this.fieldId.startsWith("text")) {
        const _ = document.querySelector(`#${this.fieldId}`)
        if (!_) {
          throw new Error("未找到目标元素，无法设置可选项！")
        }
        _.setAttribute("list", `${this.fieldId}_datalist`)
        _.setAttribute("autocomplete", "off")
        const datalist = document.createElement("datalist")
        datalist.id = `${this.fieldId}_datalist`
        for (const o of this.options) {
          const option = document.createElement("option")
          option.value = o.value
          option.innerText = o.text
          datalist.appendChild(option)
        }
        document.body.appendChild(datalist)
      } else if (
        ["radio", "checkbox", "select", "multiSelect"].some((id) => this.fieldId.startsWith(id))
      ) {
        let _
        if ((_ = window.usePlus().env.context.$(this.fieldId))) {
          _.set("dataSource", this.options)
        } else {
          throw new Error("未找到目标元素，无法设置可选项！")
        }
      }
      return this
    }

    /**
     * 使用 {@link Utils.Memo} 记忆并同步目标组件的值。
     *
     * 该方法会为当前目标字段创建一个 {@link Utils.Memo} 实例。若记忆中不存在
     * 对象，则将当前虚拟组件的值写入记忆；否则将记忆中的值回写到目标组件。
     * 同时，方法会监听目标组件的 `onChange` 事件，在值发生变化时更新记忆对象，
     * 并保留原有的 `onChange` 回调。
     *
     * @summary 使用 {@link Utils.Memo} 记忆并同步目标组件的值。
     *
     * @returns 当前虚拟组件实例，支持链式调用。
     * @since 26.7.1
     * @see {@link Utils.Memo}
     * @see {@link YidaComponent}
     */
    useMemo() {
      const memo = Memo.of(`Infection.VirtualComponent:${this.fieldId}`)
      if (!memo.object) {
        memo.update(this.value as unknown as object)
      } else {
        window.usePlus().env.context.$(this.fieldId).setValue(memo.object)
      }

      const old = window.usePlus().env.context.$(this.fieldId).get("onChange")
      window
        .usePlus()
        .env.context.$(this.fieldId)
        .set("onChange", ({ value }: { value: unknown }) => {
          if (typeof old === "function") {
            old()
          }

          memo.update(value as object)
        })
      return this
    }
  }

  /**
   * 学年选择组件。
   *
   * 该组件基于 {@link Utils.SchoolDays} 计算当前学年，并生成以当前学年
   * 为起始、向前推 {@link SchoolYear.range | range} 年的选项列表。
   * 每个选项的显示文本与实际值均为 `"YYYY-YYYY学年"` 格式，默认值为当前学年。
   *
   * @summary 学年选择组件。
   *
   * @since 26.7.1
   * @extends {Infection.HijackedComponent}
   *
   * @example
   * ```js
   * Infection.SchoolYear.of()
   *   .withRange(6)
   *   .infect("selectField_xxx")
   *   .setDefaultValue()
   *   .setOptions()
   * ```
   */
  export class SchoolYear extends HijackedComponent {
    /**
     * 学年选项跨越的年份数量。
     *
     * 默认值为 `6`，表示生成当前学年及往前推共 6 年的选项。
     *
     * @summary 学年选项跨越的年份数量。
     *
     * @since 26.7.1
     */
    range = 6

    /**
     * 生成学年选项列表与默认值。
     *
     * 该方法通过 {@link Utils.SchoolDays.of} 与
     * {@link Utils.SchoolDays.benchmarkYear} 计算基准学年，然后生成
     * `range` 个连续的学年选项。默认值为选项列表中的第一个元素，即当前学年。
     *
     * @summary 生成学年选项列表与默认值。
     *
     * @returns 当前组件实例。
     * @protected
     * @since 26.7.1
     * @see {@link Utils.SchoolDays}
     */
    protected override main() {
      const by = SchoolDays.of(this.preset).benchmarkYear()
      this.options = new Array(this.range)
        .fill(0)
        .map((_, i) => `${by - i}-${by - i + 1}学年`)
        .map((s) => ({
          text: s,
          value: s,
        }))

      this.value = this.options[0].value

      return this
    }

    /**
     * 设置学年选项跨越的年份数量。
     *
     * @summary 设置学年选项跨越的年份数量。
     *
     * @param range 跨越年份数量，例如 `6` 表示生成当前学年及往前推共 6 年的选项。
     * @returns 当前组件实例，支持链式调用。
     * @since 26.7.1
     */
    withRange(range: number) {
      this.range = range
      return this.main()
    }
  }

  /**
   * 学期选择组件。
   *
   * 该组件基于 {@link Utils.SchoolDays} 计算当前学期，并生成
   * `["第一学期", "第二学期"]` 的选项列表，默认值为当前学期。
   *
   * @summary 学期选择组件。
   *
   * @since 26.7.1
   * @extends {Infection.HijackedComponent}
   */
  export class Semester extends HijackedComponent {
    /**
     * 生成学期选项列表与默认值。
     *
     * 选项列表固定为 `["第一学期", "第二学期"]`，默认值通过
     * {@link Utils.SchoolDays.benchmarkSemester} 计算得出。
     *
     * @summary 生成学期选项列表与默认值。
     *
     * @returns 当前组件实例。
     * @protected
     * @since 26.7.1
     * @see {@link Utils.SchoolDays}
     */
    protected override main() {
      this.options = ["第一学期", "第二学期"].map((s) => ({
        text: s,
        value: s,
      }))

      this.value = this.options[SchoolDays.of(this.preset).benchmarkSemester(true) - 1].value

      return this
    }
  }

  /**
   * 年级选择组件。
   *
   * 该组件基于 {@link Utils.SchoolDays} 计算当前年级，并生成以当前年级
   * 为起始、向前推 {@link Grade.range | range} 年的选项列表。
   * 显示文本与实际值的格式由 {@link Grade.mode | mode} 控制：
   * - `"a"`（绝对模式）：显示文本与实际值均为 `"YYYY级"`。
   * - `"r"`（相对模式）：显示文本为 `"一年级"`、`"二年级"` 等，实际值为 `"YYYY级"`。
   *
   * @summary 年级选择组件。
   *
   * @since 26.7.1
   * @extends {Infection.HijackedComponent}
   */
  export class Grade extends HijackedComponent {
    /**
     * 年级选项跨越的年份数量。
     *
     * 默认值为 `6`。有效取值范围为 `[1, 9]`。
     *
     * @summary 年级选项跨越的年份数量。
     *
     * @since 26.7.1
     */
    range = 6

    /**
     * 年级显示模式。
     *
     * - `"a"`：绝对年级模式，显示文本与实际值均为 `"YYYY级"`。
     * - `"r"`：相对年级模式，显示文本为 `"一年级"`、`"二年级"` 等。
     *
     * 默认值为 `"a"`。
     *
     * @summary 年级显示模式。
     *
     * @since 26.7.1
     */
    mode: "a" | "r" = "a"

    /**
     * 生成年级选项列表与默认值。
     *
     * 该方法通过 {@link Utils.SchoolDays.of} 与
     * {@link Utils.SchoolDays.benchmarkYear} 计算基准年份，然后生成
     * `range` 个连续年级选项。默认值为选项列表中的第一个元素，即当前年级。
     *
     * @summary 生成年级选项列表与默认值。
     *
     * @returns 当前组件实例。
     * @protected
     * @since 26.7.1
     * @see {@link Utils.SchoolDays}
     */
    protected override main() {
      const aList = new Array(this.range)
        .fill(0)
        .map((_, i) => `${SchoolDays.of(this.preset).benchmarkYear() - i}级`)
      const rList = "一二三四五六七八九"
        .slice(0, this.range)
        .split("")
        .map((c) => `${c}年级`)
      this.options = aList.map((s, i) => ({
        text: this.mode === "a" ? s : rList[i],
        value: s,
      }))

      this.value = this.options[0].value

      return this
    }

    /**
     * 设置年级选项跨越的年份数量。
     *
     * 仅当传入值位于闭区间 `[1, 9]` 内时才会更新；否则保持原值。
     *
     * @summary 设置年级选项跨越的年份数量。
     *
     * @param range 跨越年份数量。
     * @returns 当前组件实例，支持链式调用。
     * @since 26.7.1
     */
    withRange(range: number) {
      if (1 <= range && range <= 9) {
        this.range = range
      }
      return this.main()
    }

    /**
     * 切换为相对年级显示模式。
     *
     * 切换后，选项的显示文本将变为 `"一年级"`、`"二年级"` 等，
     * 但实际值仍保持 `"YYYY级"` 格式。
     *
     * @summary 切换为相对年级显示模式。
     *
     * @returns 当前组件实例，支持链式调用。
     * @since 26.7.1
     */
    beRelative() {
      this.mode = "r"
      return this.main()
    }
  }

  /**
   * 班级选择组件。
   *
   * 该组件生成 `"01班"` 至 `"{amount}班"` 的班级选项列表，
   * 默认值为 `"01班"`，默认班级数量为 `20`。
   *
   * @summary 班级选择组件。
   *
   * @since 26.7.1
   * @extends {Infection.HijackedComponent}
   */
  export class Class extends HijackedComponent {
    /**
     * 班级数量。
     *
     * 默认值为 `20`。有效取值范围为 `[1, 99]`。
     *
     * @summary 班级数量。
     *
     * @since 26.7.1
     */
    amount = 20

    /**
     * 生成班级选项列表与默认值。
     *
     * 该方法生成 `amount` 个班级选项，每个选项的显示文本与实际值均为
     * 三位宽度补齐的班级名称，例如 `"01班"`、`"12班"`。默认值为 `"01班"`。
     *
     * @summary 生成班级选项列表与默认值。
     *
     * @returns 当前组件实例。
     * @protected
     * @since 26.7.1
     */
    protected override main() {
      this.options = new Array(this.amount)
        .fill(0)
        .map((_, i) => `${i + 1}班`.padStart(3, "0"))
        .map((s) => ({
          text: s,
          value: s,
        }))

      this.value = this.options[0].value

      return this
    }

    /**
     * 设置班级数量。
     *
     * 仅当传入值位于闭区间 `[1, 99]` 内时才会更新；否则保持原值。
     *
     * @summary 设置班级数量。
     *
     * @param amount 班级数量。
     * @returns 当前组件实例，支持链式调用。
     * @since 26.7.1
     */
    withAmount(amount: number) {
      if (1 <= amount && amount <= 99) {
        this.amount = amount
      }
      return this.main()
    }
  }

  /**
   * 周次选择组件。
   *
   * 该组件基于 {@link Utils.SchoolDays} 计算当前周次，并生成
   * `"第01周"` 至 `"第{range}周"` 或 `"1"` 至 `"{range}"` 的选项列表，
   * 默认值为当前周次。可通过 {@link Week.offset | offset} 调整计算基准，
   * 通过 {@link Week.mode | mode} 切换显示格式。
   *
   * @summary 周次选择组件。
   *
   * @since 26.7.1
   * @extends {Infection.HijackedComponent}
   */
  export class Week extends HijackedComponent {
    /**
     * 相对于当前日期的毫秒偏移量。
     *
     * 默认值为 `0`。正值表示向后偏移，负值表示向前偏移。
     *
     * @summary 相对于当前日期的毫秒偏移量。
     *
     * @since 26.7.1
     */
    offset = 0

    /**
     * 周次选项跨越的周数。
     *
     * 默认值为 `52`。有效取值范围为 `[1, 99]`。
     *
     * @summary 周次选项跨越的周数。
     *
     * @since 26.7.1
     */
    range = 52

    /**
     * 周次显示模式。
     *
     * - `"string"`：显示文本与实际值均为 `"第XX周"` 格式。
     * - `"number"`：显示文本与实际值均为纯数字字符串。
     *
     * 默认值为 `"string"`。
     *
     * @summary 周次显示模式。
     *
     * @since 26.7.1
     */
    mode: "string" | "number" = "string"

    /**
     * 生成周次选项列表与默认值。
     *
     * 该方法首先根据 {@link Week.mode | mode} 生成 `range` 个周次选项，
     * 然后通过 {@link Utils.SchoolDays.benchmarkDateTime} 与
     * {@link Utils.SchoolDays.semesterStart} 计算当前周次。若计算结果超出
     * `[1, range]` 范围，则默认值为 `"Unexpected week {deltaWeek}!"`。
     *
     * @summary 生成周次选项列表与默认值。
     *
     * @returns 当前组件实例。
     * @protected
     * @since 26.7.1
     * @see {@link Utils.SchoolDays}
     * @see {@link Utils.DateX}
     */
    protected override main() {
      this.options = new Array(this.range).fill(0).map((_, i) => {
        const w = i + 1 + ""

        return this.mode === "string"
          ? {
              text: `第${w.padStart(2, "0")}周`,
              value: `第${w.padStart(2, "0")}周`,
            }
          : {
              text: w,
              value: w,
            }
      })

      const instant = SchoolDays.of(this.preset).benchmarkDateTime() + 1 + this.offset
      const deltaWeek = Math.ceil(
        (instant - SchoolDays.of(this.preset).semesterStart()) / (DateX.ONE_DAY * 7),
      )
      this.value =
        0 < deltaWeek && deltaWeek <= this.range
          ? this.options[deltaWeek - 1].text
          : `Unexpected week ${deltaWeek}!`

      return this
    }

    /**
     * 设置周次计算的日期偏移量。
     *
     * 传入值会被乘以 {@link Utils.DateX.ONE_DAY} 转换为毫秒偏移量。
     * 例如 `offset = -7` 表示将计算基准向前推 7 天。
     *
     * @summary 设置周次计算的日期偏移量。
     *
     * @param offset 以天为单位的偏移量。
     * @returns 当前组件实例，支持链式调用。
     * @since 26.7.1
     * @see {@link Utils.DateX}
     */
    withDayOffset(offset: number) {
      this.offset = offset * DateX.ONE_DAY
      return this.main()
    }

    /**
     * 设置周次选项跨越的周数。
     *
     * 仅当传入值位于闭区间 `[1, 99]` 内时才会更新；否则保持原值。
     *
     * @summary 设置周次选项跨越的周数。
     *
     * @param range 跨越周数。
     * @returns 当前组件实例，支持链式调用。
     * @since 26.7.1
     */
    withRange(range: number) {
      if (1 <= range && range <= 99) {
        this.range = range
      }
      return this.main()
    }

    /**
     * 切换为数字周次显示模式。
     *
     * 切换后，选项的显示文本与实际值均为纯数字字符串，例如 `"1"`、`"2"`。
     *
     * @summary 切换为数字周次显示模式。
     *
     * @returns 当前组件实例，支持链式调用。
     * @since 26.7.1
     */
    beNumber() {
      this.mode = "number"
      return this.main()
    }
  }

  /**
   * 星期选择组件。
   *
   * 该组件基于 {@link Utils.SchoolDays} 计算当前星期，并生成
   * `["周一", "周二", ..., "周日"]` 的选项列表，默认值为当前星期。
   * 可通过 {@link WeekDay.offset | offset} 调整计算基准。
   *
   * @summary 星期选择组件。
   *
   * @since 26.7.1
   * @extends {Infection.HijackedComponent}
   */
  export class WeekDay extends HijackedComponent {
    /**
     * 相对于当前日期的毫秒偏移量。
     *
     * 默认值为 `0`。正值表示向后偏移，负值表示向前偏移。
     *
     * @summary 相对于当前日期的毫秒偏移量。
     *
     * @since 26.7.1
     */
    offset = 0

    /**
     * 生成星期选项列表与默认值。
     *
     * 选项列表固定为 `["周一", "周二", ..., "周日"]`。默认值通过
     * {@link Utils.SchoolDays.benchmarkDateTime} 加上 {@link WeekDay.offset | offset}
     * 后计算星期得出。
     *
     * @summary 生成星期选项列表与默认值。
     *
     * @returns 当前组件实例。
     * @protected
     * @since 26.7.1
     * @see {@link Utils.SchoolDays}
     */
    protected override main() {
      this.options = "一二三四五六日".split("").map((c) => ({
        text: `周${c}`,
        value: `周${c}`,
      }))

      const instant = SchoolDays.of(this.preset).benchmarkDateTime() + this.offset
      this.value = `周${"日一二三四五六"[new Date(instant).getDay()]}`

      return this
    }

    /**
     * 设置星期计算的日期偏移量。
     *
     * 传入值会被乘以 {@link Utils.DateX.ONE_DAY} 转换为毫秒偏移量。
     * 例如 `offset = -1` 表示将计算基准向前推 1 天。
     *
     * @summary 设置星期计算的日期偏移量。
     *
     * @param offset 以天为单位的偏移量。
     * @returns 当前组件实例，支持链式调用。
     * @since 26.7.1
     * @see {@link Utils.DateX}
     */
    withDayOffset(offset: number) {
      this.offset = offset * DateX.ONE_DAY
      return this.main()
    }
  }

  /**
   * 上下午选择组件。
   *
   * 该组件基于当前时间自动判断上午或下午，并生成
   * `["上午", "下午"]` 的选项列表，默认值为当前时间对应的上下午。
   *
   * @summary 上下午选择组件。
   *
   * @since 26.7.1
   * @extends {Infection.HijackedComponent}
   */
  export class HalfDay extends HijackedComponent {
    /**
     * 生成上下午选项列表与默认值。
     *
     * 选项列表固定为 `["上午", "下午"]`。默认值为
     * {@link Utils.SchoolDays.benchmarkDateTime} 对应小时数加 1 后小于 12
     * 时为 `"上午"`，否则为 `"下午"`。
     *
     * @summary 生成上下午选项列表与默认值。
     *
     * @returns 当前组件实例。
     * @protected
     * @since 26.7.1
     * @see {@link Utils.SchoolDays}
     */
    protected override main() {
      this.options = ["上午", "下午"].map((s) => ({
        text: s,
        value: s,
      }))

      this.value =
        new Date(SchoolDays.of(this.preset).benchmarkDateTime()).getHours() + 1 < 12
          ? "上午"
          : "下午"

      return this
    }
  }
}
