import { DateX } from "."

/**
 * `SchoolDays` 计算所需的预设配置项。
 *
 * 通过预设可以固定学期开始时间、指定基准年份、基准学期以及基准时间，
 * 从而在校历计算中使用确定的参考点，而非当前系统时间。
 *
 * @summary `SchoolDays` 计算所需的预设配置项。
 *
 * @since 26.4.13
 * @see {@link SchoolDays}
 */
export type SchoolDaysPreset = {
  /**
   * 学期开始时间（毫秒时间戳）。
   *
   * 若提供该项，{@link SchoolDays.semesterStart} 将直接返回该时间戳，
   * {@link SchoolDays.benchmarkSemester} 的计算也将基于此固定时间戳进行。
   */
  semesterStart?: ReturnType<typeof Date.now>
  /**
   * 基准年份。
   *
   * 若提供该项，{@link SchoolDays.semesterStart} 与
   * {@link SchoolDays.benchmarkSemester} 将基于该年份进行计算，
   * 而非当前系统年份。
   */
  benchmarkYear?: number
  /**
   * 基准学期。
   *
   * 若提供该项，{@link SchoolDays.benchmarkSemester} 将直接返回该学期值
   *（`1` 或 `2`），不再基于当前日期进行计算。
   */
  benchmarkSemester?: 1 | 2
  /**
   * 基准时间。
   *
   * 若提供该项，{@link SchoolDays.semesterStart} 与
   * {@link SchoolDays.benchmarkSemester} 将基于该时间进行计算，
   * 而非当前系统时间。
   */
  benchmarkDateTime?: ReturnType<typeof Date.now>
}

/**
 * 基于学年、学期和周次等学校时间语义进行日期计算的工具类。
 *
 * `SchoolDays` 通过 {@link SchoolDaysPreset} 提供基准时间、基准年份、
 * 基准学期以及固定学期开始时间等预设，支持计算指定学年的学期开始时间、
 * 获取基准年份与基准学期。适用于课表、学期安排等学校相关场景。
 *
 * @summary 基于学年、学期和周次等学校时间语义进行日期计算的工具类。
 *
 * @since 26.4.13
 * @see {@link Utils.DateX}
 *
 * @example
 * ```ts
 * const sd = SchoolDays.of({ benchmarkYear: 2025 })
 * console.log(sd.semesterStart()) // 2025-2026 学年第一学期开始时间戳
 * console.log(sd.benchmarkSemester())
 * ```
 */
export class SchoolDays {
  private constructor(private readonly preset: SchoolDaysPreset) {}

  /**
   * 根据预设配置创建新的 `SchoolDays` 实例。
   *
   * @summary 根据预设配置创建新的 `SchoolDays` 实例。
   *
   * @param preset 学期计算所需的预设配置项。
   * @returns 新的 `SchoolDays` 实例。
   * @since 26.4.13
   */
  static of(preset: SchoolDaysPreset) {
    return new SchoolDays(preset)
  }

  private lunarJan16(y: number) {
    const map: { [year: number]: [month: number, day: number] } = {
      2020: [2, 11],
      2021: [1, 27],
      2022: [1, 16],
      2023: [2, 9],
      2024: [1, 25],
      2025: [2, 15],
      2026: [2, 4],
      2027: [1, 21],
      2028: [2, 11],
      2029: [1, 28],
      2030: [1, 18],
      2031: [1, 7],
      2032: [1, 26],
      2033: [1, 15],
      2034: [2, 6],
      2035: [1, 23],
      2036: [2, 14],
      2037: [2, 2],
      2038: [1, 19],
      2039: [2, 10],
    }

    const [m, d] = map[y] || [1, 25]
    return new Date(y, m, d)
  }

  private calcSemesterStart(year: number, semester: 1 | 2, isInAdvance: boolean) {
    if (this.preset.semesterStart) {
      return this.preset.semesterStart
    }

    let timestamp
    switch (semester) {
      case 1:
        timestamp = new Date(year, 9 - 1, 1).getTime()

        if (isInAdvance) {
          timestamp -= DateX.ONE_DAY * 10
        }

        break
      case 2:
        timestamp = this.lunarJan16(year + 1).getTime()

        if (isInAdvance) {
          timestamp -= DateX.ONE_DAY * 15
        }

        break
    }

    const day = new Date(timestamp).getDay()
    const offset = day >= 1 && day <= 4 ? -(day - 1) : 8 - day

    return timestamp + offset * DateX.ONE_DAY
  }

  /**
   * 计算指定学年和学期的开始时间戳。
   *
   * 若 {@link SchoolDaysPreset.semesterStart} 已提供，则直接返回该固定值；
   * 否则基于农历正月十六与学期规则推算。第一学期默认从 9 月 1 日开始，
   * 第二学期默认从次年农历正月十六开始；启用提前计算时，分别再提前
   * 10 天与 15 天，并按周一对齐。
   *
   * @summary 计算指定学年和学期的开始时间戳。
   *
   * @param year 学年年份，例如 `2025` 表示 2025-2026 学年，
   *             默认为 {@link SchoolDays.benchmarkYear}。
   * @param semester 学期，`1` 表示第一学期，`2` 表示第二学期，
   *                 默认为 {@link SchoolDays.benchmarkSemester}。
   * @param isInAdvance 是否提前计算学期开始时间，默认为 `false`。
   * @returns 学期开始时间的毫秒时间戳。
   * @since 26.4.13
   */
  semesterStart(
    year = this.benchmarkYear(),
    semester: 1 | 2 = this.benchmarkSemester(),
    isInAdvance = false,
  ) {
    if (this.preset.semesterStart) {
      return this.preset.semesterStart
    }

    return this.calcSemesterStart(year, semester, isInAdvance)
  }

  /**
   * 获取当前用于计算的基准时间戳。
   *
   * 若 {@link SchoolDaysPreset.benchmarkDateTime} 已提供，则返回该预设时间；
   * 否则返回当前系统时间的时间戳。
   *
   * @summary 获取当前用于计算的基准时间戳。
   *
   * @returns 基准时间的毫秒时间戳。
   * @since 26.4.13
   */
  benchmarkDateTime() {
    if (this.preset.benchmarkDateTime) {
      return new Date(this.preset.benchmarkDateTime).getTime()
    }

    return Date.now()
  }

  /**
   * 获取当前用于计算的基准学年年份。
   *
   * 若 {@link SchoolDaysPreset.benchmarkYear} 已提供，则返回该预设年份；
   * 否则基于 {@link SchoolDays.benchmarkDateTime} 计算：在当年 8 月 20 日之前
   * 视为上一学年，8 月 20 日及之后视为当前学年。
   *
   * @summary 获取当前用于计算的基准学年年份。
   *
   * @returns 基准学年年份。
   * @since 26.4.13
   */
  benchmarkYear() {
    if (this.preset.benchmarkYear) {
      return this.preset.benchmarkYear
    }

    const thisYear = new Date(this.benchmarkDateTime()).getFullYear()
    return thisYear - (this.benchmarkDateTime() < new Date(thisYear, 8 - 1, 20).getTime() ? 1 : 0)
  }

  /**
   * 获取当前用于计算的基准学期。
   *
   * 若 {@link SchoolDaysPreset.benchmarkSemester} 已提供，则直接返回该学期；
   * 否则根据当前基准时间是否处于第一学期开始时间与第二学期开始时间之间
   * 进行判断：处于之间则为第一学期，否则为第二学期。
   *
   * @summary 获取当前用于计算的基准学期。
   *
   * @param isInAdvance 是否使用提前计算的学期开始时间，默认为 `false`。
   * @returns 基准学期，`1` 或 `2`。
   * @since 26.4.13
   */
  benchmarkSemester(isInAdvance = false) {
    if (this.preset.benchmarkSemester) {
      return this.preset.benchmarkSemester
    }

    return [
      this.calcSemesterStart(this.benchmarkYear(), 1, isInAdvance) < this.benchmarkDateTime(),
      this.benchmarkDateTime() < this.calcSemesterStart(this.benchmarkYear(), 2, isInAdvance),
    ].every((e) => e)
      ? 1
      : 2
  }
}
