/**
 * 用于限制函数调用频率的节流工具类。
 *
 * `Throttle.of` 返回一个包装函数，当该函数被调用后，在指定的延迟时间内
 * 再次调用将被忽略。适用于滚动、拖拽、窗口调整等需要限制触发频率的场景。
 *
 * @summary 用于限制函数调用频率的节流工具类。
 *
 * @since 26.4.13
 *
 * @example
 * ```ts
 * const resize = Throttle.of(() => {
 *   console.log("窗口尺寸已改变")
 * }, 200)
 *
 * window.addEventListener("resize", resize)
 * ```
 */
export class Throttle {
  /**
   * 创建一个节流函数。
   *
   * 返回的包装函数在执行原函数后进入锁定状态，直到延迟时间结束后才解锁。
   * 锁定期间的所有调用均会被忽略。
   *
   * @summary 创建一个节流函数。
   *
   * @typeParam T 被包装函数的类型。
   * @param fn 需要节流的原始函数。
   * @param delay 节流延迟时间，单位为毫秒，默认为 `300`。
   * @returns 节流包装函数，其参数类型与 `fn` 一致，返回值为 `void`。
   * @since 26.4.13
   */
  static of<T extends (...args: unknown[]) => unknown>(fn: T, delay = 300) {
    let locked = false

    return (...args: Parameters<T>) => {
      if (locked) return
      locked = true
      fn(...args)
      setTimeout(() => (locked = false), delay)
    }
  }
}
