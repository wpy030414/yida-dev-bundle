import { CSSBuilder } from "."

/**
 * 提供统一格式化样式的浏览器控制台日志输出工具。
 *
 * `Logger` 通过 {@link Utils.CSSBuilder} 为时间戳与日志内容分别生成样式，
 * 并基于 `console.debug` 输出。支持成功、信息、错误三种日志级别，
 * 便于开发调试与运行状态展示。
 *
 * @summary 提供统一格式化样式的浏览器控制台日志输出工具。
 *
 * @since 26.4.13
 * @see {@link Utils.CSSBuilder}
 *
 * @example
 * ```ts
 * Logger.ok("操作成功")
 * Logger.info("当前状态", { count: 3 })
 * Logger.err("请求失败", new Error("timeout"))
 * ```
 */
export class Logger {
  private static get timestamp() {
    return (new Date().getHours() + new Date().toISOString().match(/T\d\d(.+)Z/)![1]).padStart(
      12,
      "0",
    )
  }

  private static readonly styleLeft = CSSBuilder.from({
    padding: "4px 8px",
    "border-radius": "4px 0 0 4px",
    background: "linear-gradient(90deg, #ccc, #333)",
    color: "#fff",
  }).toString()

  private static readonly styleOk = CSSBuilder.from({
    padding: "4px 8px",
    "border-radius": "0 4px 4px 0",
    background: "#d4edda",
    color: "#155724",
  }).toString()

  private static readonly styleInfo = CSSBuilder.from({
    padding: "4px 8px",
    "border-radius": "0 4px 4px 0",
    background: "#cce5ff",
    color: "#004085",
  }).toString()

  private static readonly styleErr = CSSBuilder.from({
    padding: "4px 8px",
    "border-radius": "0 4px 4px 0",
    background: "#f8d7da",
    color: "#721c24",
  }).toString()

  private static log(type: "ok" | "info" | "err", text: string, ...args: unknown[]) {
    const rightStyle =
      type === "ok" ? this.styleOk : type === "info" ? this.styleInfo : this.styleErr
    console.debug(`%c${this.timestamp}%c${text}`, this.styleLeft, rightStyle, ...args)
  }

  /**
   * 输出成功级别的日志。
   *
   * 成功日志以绿色背景展示，适用于表示操作成功、状态正常等场景。
   *
   * @summary 输出成功级别的日志。
   *
   * @param text 日志文本内容。
   * @param args 可选的附加参数，将传递给 `console.debug`。
   * @since 26.4.13
   */
  static ok(text: string, ...args: unknown[]) {
    this.log("ok", text, ...args)
  }

  /**
   * 输出信息级别的日志。
   *
   * 信息日志以蓝色背景展示，适用于输出一般信息、调试数据等场景。
   *
   * @summary 输出信息级别的日志。
   *
   * @param text 日志文本内容。
   * @param args 可选的附加参数，将传递给 `console.debug`。
   * @since 26.4.13
   */
  static info(text: string, ...args: unknown[]) {
    this.log("info", text, ...args)
  }

  /**
   * 输出错误级别的日志。
   *
   * 错误日志以红色背景展示，适用于表示操作失败、异常情况等场景。
   *
   * @summary 输出错误级别的日志。
   *
   * @param text 日志文本内容。
   * @param args 可选的附加参数，通常是错误对象或相关信息，将传递给 `console.debug`。
   * @since 26.4.13
   */
  static err(text: string, ...args: unknown[]) {
    this.log("err", text, ...args)
  }
}
