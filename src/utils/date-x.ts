/**
 * 表示日期时间加减运算中可配置的时间段。
 *
 * 所有字段均为可选。{@link DateX.add} 与 {@link DateX.subtract}
 * 支持通过字段别名（如 `year`、`mon`、`day` 等）指定时间段；
 * 这些别名最终由内部映射表归一化为标准字段名。
 *
 * @summary 表示日期时间加减运算中可配置的时间段。
 *
 * @since 26.4.13
 * @see {@link DateX}
 */
export type DateXDuration = {
  /** @summary 年数。 */
  years?: number
  /** @summary 月数。 */
  months?: number
  /** @summary 周数。 */
  weeks?: number
  /** @summary 日数。 */
  days?: number
  /** @summary 小时数。 */
  hours?: number
  /** @summary 分钟数。 */
  minutes?: number
  /** @summary 秒数。 */
  seconds?: number
  /** @summary 毫秒数。 */
  milliseconds?: number
}

const DURATION_ALIAS_MAP: Record<string, keyof DateXDuration> = {
  year: "years",
  years: "years",

  mon: "months",
  mons: "months",
  month: "months",
  months: "months",

  week: "weeks",
  weeks: "weeks",

  day: "days",
  days: "days",

  hour: "hours",
  hours: "hours",

  min: "minutes",
  mins: "minutes",
  minute: "minutes",
  minutes: "minutes",

  sec: "seconds",
  secs: "seconds",
  second: "seconds",
  seconds: "seconds",

  mill: "milliseconds",
  mills: "milliseconds",
  millsec: "milliseconds",
  millsecs: "milliseconds",
  millisecond: "milliseconds",
  milliseconds: "milliseconds",
}

/**
 * 扩展 `Date` 的日期时间运算类。
 *
 * `DateX` 在原生 `Date` 基础上增加了 {@link DateX.add} 与
 * {@link DateX.subtract} 方法，支持按年、月、周、日、时、分、秒、
 * 毫秒进行偏移计算。同时覆盖 {@link DateX.toString} 与
 * {@link DateX.toJSON}，输出统一的 `YYYY-MM-DD HH:MM:SS` 格式。
 *
 * @summary 扩展 `Date` 的日期时间运算类。
 *
 * @since 26.4.13
 * @see {@link DateXDuration}
 *
 * @example
 * ```ts
 * const now = new DateX("2026-07-01 12:00:00")
 * const later = now.add({ days: 1, hours: 2 })
 * console.log(later.toString()) // "2026-07-02 14:00:00"
 * ```
 */
export class DateX extends Date {
  /**
   * 一日的毫秒数。
   *
   * 常量值为 `24 * 60 * 60 * 1000`，即 `86,400,000` 毫秒。
   *
   * @summary 一日的毫秒数。
   *
   * @since 26.4.13
   */
  static readonly ONE_DAY = 24 * 60 * 60 * 1000

  /**
   * 一周的毫秒数。
   *
   * 常量值为 `7 * ONE_DAY`。
   *
   * @summary 一周的毫秒数。
   *
   * @since 26.4.13
   * @see {@link DateX.ONE_DAY}
   */
  static readonly ONE_WEEK = 7 * DateX.ONE_DAY

  /**
   * 返回在当前日期时间基础上加上指定时间段后的新 `DateX` 实例。
   *
   * 该方法会归一化传入的 {@link DateXDuration}，支持标准字段名及其常用别名
   * （如 `year`、`mon`、`week`、`day`、`hour`、`min`、`sec`、`mill` 等）。
   * 计算按“年 → 月 → 日 → 时 → 分 → 秒 → 毫秒”的顺序依次应用。
   *
   * @summary 返回在当前日期时间基础上加上指定时间段后的新 `DateX` 实例。
   *
   * @param duration 需要增加的时间段。
   * @returns 增加后的新 `DateX` 实例；原实例不被修改。
   * @since 26.4.13
   * @see {@link DateX.subtract}
   */
  add(duration: DateXDuration) {
    const norm = {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }
    for (const [k, v] of Object.entries(duration)) {
      if (v !== undefined && DURATION_ALIAS_MAP[k]) {
        norm[DURATION_ALIAS_MAP[k]] += v
      }
    }

    const d = new DateX(this)
    d.setFullYear(d.getFullYear() + norm.years)
    d.setMonth(d.getMonth() + norm.months)
    d.setDate(d.getDate() + norm.weeks * 7 + norm.days)
    d.setHours(d.getHours() + norm.hours)
    d.setMinutes(d.getMinutes() + norm.minutes)
    d.setSeconds(d.getSeconds() + norm.seconds)
    d.setMilliseconds(d.getMilliseconds() + norm.milliseconds)
    return d
  }

  /**
   * 返回在当前日期时间基础上减去指定时间段后的新 `DateX` 实例。
   *
   * 该方法将传入时间段的每个字段取反后调用 {@link DateX.add} 完成计算。
   *
   * @summary 返回在当前日期时间基础上减去指定时间段后的新 `DateX` 实例。
   *
   * @param duration 需要减少的时间段，类型与 {@link DateX.add} 的参数一致。
   * @returns 减少后的新 `DateX` 实例；原实例不被修改。
   * @since 26.4.13
   * @see {@link DateX.add}
   */
  subtract(duration: Parameters<DateX["add"]>[0]) {
    const negDuration: DateXDuration = {}
    for (const key in duration) {
      negDuration[key as keyof typeof duration] = -duration[key as keyof typeof duration]!
    }
    return this.add(negDuration)
  }

  /**
   * 将日期时间格式化为 `YYYY-MM-DD HH:MM:SS` 形式的字符串。
   *
   * 当传入 `"json"` 模式时，日期与时间之间使用 `T` 连接，以兼容 ISO 风格。
   *
   * @summary 将日期时间格式化为 `YYYY-MM-DD HH:MM:SS` 形式的字符串。
   *
   * @param mode 可选的格式化模式。传入 `"json"` 时使用 `T` 分隔符。
   * @returns 格式化后的日期时间字符串。
   * @since 26.4.13
   * @see {@link DateX.toJSON}
   */
  override toString(mode?: "json") {
    const pad = (n: number) => n.toString().padStart(2, "0")

    const year = this.getFullYear()
    const month = pad(this.getMonth() + 1)
    const day = pad(this.getDate())
    const hours = pad(this.getHours())
    const minutes = pad(this.getMinutes())
    const seconds = pad(this.getSeconds())

    return `${year}-${month}-${day}${mode === "json" ? "T" : " "}${hours}:${minutes}:${seconds}`
  }

  /**
   * 返回用于 JSON 序列化的日期时间字符串。
   *
   * 默认调用 {@link DateX.toString} 并传入 `"json"` 模式，输出
   * `YYYY-MM-DDTHH:MM:SS` 格式。
   *
   * @summary 返回用于 JSON 序列化的日期时间字符串。
   *
   * @returns JSON 序列化字符串。
   * @since 26.4.13
   * @see {@link DateX.toString}
   */
  override toJSON() {
    return this.toString("json")
  }
}
