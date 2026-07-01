/**
 * 用于将初始值依次传递给一系列函数进行处理的管道工具。
 *
 * `Tube.from` 支持同步函数与返回 `Promise` 的异步函数，前一个函数的输出
 * 会作为下一个函数的输入，最终返回处理结果。适用于多阶段数据转换、
 * 请求流水线等场景。
 *
 * @summary 用于将初始值依次传递给一系列函数进行处理的管道工具。
 *
 * @since 26.4.13
 *
 * @example
 * ```ts
 * const result = await Tube.from(
 *   1,
 *   (n) => n + 1,
 *   async (n) => n * 2,
 * )
 * console.log(result) // 4
 * ```
 */
export class Tube {
  /**
   * 从初始值开始，依次通过多个函数处理并返回最终结果。
   *
   * 函数数组按顺序执行，每个函数接收上一个函数的返回值。若函数返回
   * `Promise`，则会等待其解析后再传递给下一个函数。
   *
   * @summary 从初始值开始，依次通过多个函数处理并返回最终结果。
   *
   * @typeParam T 管道最终返回值的类型。
   * @param initial 初始值，可以是任意类型。
   * @param fns 处理函数数组，每个函数接收上一阶段结果并返回新结果或 `Promise`。
   * @returns 经过所有函数处理后的最终值。
   * @since 26.4.13
   */
  static async from<T>(initial: any, ...fns: ((val: any) => any | Promise<any>)[]): Promise<T> {
    let result = initial

    for (const fn of fns) {
      result = await fn(result)
    }

    return result
  }
}
