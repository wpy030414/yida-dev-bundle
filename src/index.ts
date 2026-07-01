/**
 * Yida Plus 库的入口文件。
 *
 * 本文件负责聚合业务模块（{@link Modules}）与通用工具（{@link Utils}），
 * 在脚本加载时将 `usePlus` 函数、所有模块及工具类挂载到 `window.top` 与 `window`，
 * 使宜搭自定义页面可以在 `didMount()` 中直接访问。
 *
 * @summary Yida Plus 库的入口文件。
 *
 * @module
 * @since 26.7.1
 */

import { YidaPageWindow } from "../types"
import * as Modules from "./modules"
import * as Utils from "./utils"

/**
 * 获取当前已挂载的 Yida Plus 运行时上下文。
 *
 * 该函数由本入口文件在脚本加载时自动注入到 `window.top` 与 `window`。
 * 调用方可传入一个宜搭页面窗口对象；若省略参数，则默认使用当前 `window`。
 *
 * 返回值是一个被 {@link Utils.DeepFreeze} 递归深度冻结的只读对象，包含项目主页、
 * 版本号以及从页面上下文中提取的环境信息（CSRF Token、应用 ID、表单 UUID、
 * 宜搭组件访问上下文）。其中 `env.context` 通过 getter 暴露，避免误冻结
 * 页面提供的可变运行时上下文。
 *
 * @summary 获取当前已挂载的 Yida Plus 运行时上下文。
 *
 * @param yidaPageWindow 可选的宜搭页面窗口对象。默认为当前 `window`。
 * @returns 被 {@link Utils.DeepFreeze} 递归深度冻结的运行时上下文对象。
 * @throws {TypeError} 当传入参数不是有效的 YidaPageWindow 对象，或当前 `window`
 *         未暴露必要的宜搭全局对象（`g_config`、`pageContext`、`LeGao`）时抛出。
 *         错误信息会同时通过 {@link Utils.Logger} 输出。
 * @since 26.7.1
 * @see {@link YidaPageWindow}
 *
 * @example
 * ```js
 * const plus = window.usePlus()
 * console.debug(plus.version)
 * plus.env.context.$("textField_xxx").setValue("hello")
 * ```
 */
export function usePlus(yidaPageWindow = window as unknown as YidaPageWindow) {
  const w = yidaPageWindow as unknown as Record<string, unknown>
  const gConfig = w.g_config as Record<string, unknown> | undefined
  const pageContext = w.pageContext as Record<string, unknown> | undefined
  const leGao = w.LeGao as Record<string, unknown> | undefined

  const isValidYidaPageWindow =
    typeof yidaPageWindow === "object" &&
    yidaPageWindow !== null &&
    typeof gConfig === "object" &&
    gConfig !== null &&
    typeof gConfig._csrf_token === "string" &&
    typeof pageContext === "object" &&
    pageContext !== null &&
    typeof pageContext.appType === "string" &&
    typeof pageContext.formUuid === "string" &&
    typeof leGao === "object" &&
    leGao !== null &&
    typeof leGao.getContext === "function"

  if (!isValidYidaPageWindow) {
    const errorMessage =
      "传入的参数不是有效的 YidaPageWindow 对象。请确保页面已加载宜搭全局对象，" +
      "或省略参数以使用当前 window。"
    Utils.Logger.err(`usePlus: ${errorMessage}`)
    throw new TypeError(errorMessage)
  }

  return Utils.DeepFreeze.of({
    homepage: "https://github.com/wpy030414/yida-plus",
    version: import.meta.env.VITE_APP_VERSION,
    env: {
      csrfToken: yidaPageWindow.g_config._csrf_token,
      appId: yidaPageWindow.pageContext.appType,
      formUuid: yidaPageWindow.pageContext.formUuid,
      get context() {
        return yidaPageWindow.LeGao.getContext().__debugThis__
      },
    },
  })
}

/**
 * 导出的业务模块命名空间。
 *
 * 包含 EZPush、Mock、Infection、Zeppelin、QuickMap 五个业务外挂模块。
 */
export { Modules }

/**
 * 导出的通用工具命名空间。
 *
 * 包含 CountMap、CSSBuilder、DateX、Debounce、Logger、Member、Memo、
 * SchoolDays、Tasks、Throttle、Tube 等基础工具类。
 */
export { Utils }

/**
 * 重新导出宜搭页面相关全局类型。
 *
 * 这些类型定义在 `types/index.d.ts` 中，通过入口文件重新导出后，
 * 便于模块文档与外部调用方统一引用。
 */
export type { YidaPageContext, YidaComponent, YidaPageWindow } from "../types"

/**
 * 将库挂载到页面全局作用域。
 *
 * 脚本加载时，会依次尝试向 `window.top` 与 `window` 注入
 * `usePlus` 函数、所有业务模块以及所有工具类。挂载完成后，
 * 会通过 {@link Utils.Logger} 输出成功日志。
 *
 * 由于本项目为外挂 IIFE 库，全局污染是预期行为，便于宜搭页面脚本直接访问。
 */
for (const w of [window.top, window]) {
  w && Object.assign(w, usePlus, { ...Modules, ...Utils })
  Utils.Logger.info(`Yida Plus v${import.meta.env.VITE_APP_VERSION} has been mounted to:`, w)
}
