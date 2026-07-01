/**
 * 用于降低函数调用频率的防抖工具类。
 *
 * `Debounce.of` 返回一个包装函数，当该函数被连续调用时，只有在最后一次调用
 * 后的指定延迟时间内没有新的调用，才会真正执行原函数。适用于输入框联想、
 * 窗口尺寸调整、滚动事件等高频触发场景。
 *
 * @summary 用于降低函数调用频率的防抖工具类。
 *
 * @since 26.4.13
 *
 * @example
 * ```ts
 * const search = Debounce.of((keyword: string) => {
 *   console.log("搜索", keyword)
 * }, 300)
 *
 * search("a")
 * search("ab")
 * search("abc") // 300ms 后仅输出 "搜索 abc"
 * ```
 */
export class Debounce {
  /**
   * 创建一个防抖函数。
   *
   * 返回的包装函数在被调用时会重置内部计时器；当延迟时间内没有新的调用时，
   * 原函数才会被执行。
   *
   * @summary 创建一个防抖函数。
   *
   * @typeParam T 被包装函数的类型，必须是一个接受任意参数并返回未知值的函数。
   * @param fn 需要防抖的原始函数。
   * @param delay 防抖延迟时间，单位为毫秒，默认为 `300`。
   * @returns 防抖包装函数，其参数类型与 `fn` 一致，返回值为 `void`。
   * @since 26.4.13
   */
  static of<T extends (...args: unknown[]) => unknown>(fn: T, delay = 300) {
    let timer: ReturnType<typeof setTimeout>

    return (...args: Parameters<T>) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn(...args)
      }, delay)
    }
  }
}
