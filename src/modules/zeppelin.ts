import { Debounce, Throttle } from "../utils"

/**
 * 宜搭组件组合业务增强工具集。
 *
 * 本模块通过组合宜搭基础组件实现高级业务功能，包括表格实时关键词搜索、
 * 表格数据导出为 CSV 文件以及页面或区域截图下载。各服务均通过 `compose`
 * 方法将功能绑定到指定组件，并内置防抖或节流优化以提升性能。
 *
 * @summary 宜搭组件组合业务增强工具集。
 *
 * @since 26.7.1
 * @see {@link https://docs.aliwork.com/docs/developer/api/yidaAPI}
 * @see {@link Utils.Debounce}
 * @see {@link Utils.Throttle}
 * @see {@link YidaComponent}
 * @see {@link YidaPageContext}
 *
 * @example
 * ```js
 * Zeppelin.TableSearcher.of().compose("textField_keyword", "tableField_list")
 * Zeppelin.TableExporter.of().compose("button_export", "tableField_list")
 * Zeppelin.ViewCapturer.of().compose("button_screenshot", "view_container")
 * ```
 */
export namespace Zeppelin {
  /**
   * 宜搭开发者 API 官方参考文档地址。
   *
   * @summary 宜搭开发者 API 官方参考文档地址。
   *
   * @since 26.7.1
   * @see {@link https://docs.aliwork.com/docs/developer/api/yidaAPI}
   */
  export const ref = "https://docs.aliwork.com/docs/developer/api/yidaAPI"

  // 内部使用的宜搭表格组件包装类，用于屏蔽自定义页面表格与普通表单表格的 API 差异。
  class YidaTableComponent {
    private fieldId
    private type

    private props?: {
      columns: { dataKey: string; title: string }[]
    }
    private baseRef?: {
      columns: { fieldId: string; label: string }[]
    }

    /**
     * 创建一个新的宜搭表格组件包装实例。
     *
     * @summary 创建一个新的宜搭表格组件包装实例。
     *
     * @param fieldId 表格组件的字段标识。
     */
    constructor(fieldId: string) {
      this.fieldId = fieldId
      this.type = fieldId.startsWith("tablePc") ? "custom-page" : "form"
    }

    /**
     * 获取表格组件的当前数据。
     *
     * @summary 获取表格组件的当前数据。
     *
     * @returns 表格数据数组。
     */
    getValue() {
      return (
        this.type === "custom-page"
          ? window.usePlus().env.context.$(this.fieldId).get("data")
          : window.usePlus().env.context.$(this.fieldId).getValue()
      ) as Record<string, unknown>[]
    }

    /**
     * 设置表格组件的当前数据。
     *
     * @summary 设置表格组件的当前数据。
     *
     * @param value 新的表格数据数组。
     */
    setValue(value: Record<string, unknown>[]) {
      if (this.type === "custom-page") {
        window.usePlus().env.context.$(this.fieldId).set("data", value)
      } else {
        window.usePlus().env.context.$(this.fieldId).setValue(value)
      }
    }

    /**
     * 获取表格列的字段标识到标题的映射。
     *
     * @summary 获取表格列的字段标识到标题的映射。
     *
     * @returns 列字段标识与显示标题的映射表。
     */
    getHeaderMapper() {
      return new Map(
        this.type === "custom-page"
          ? (window.usePlus().env.context.$(this.fieldId) as unknown as this).props!.columns.map(
              (e) => [e.dataKey, e.title],
            )
          : (window.usePlus().env.context.$(this.fieldId) as unknown as this).baseRef!.columns.map(
              (e) => [e.fieldId, e.label],
            ),
      )
    }
  }

  // 内部使用的文件下载器，用于触发浏览器下载指定 URL 的文件。
  class Downloader {
    private link = document.createElement("a")

    /**
     * 创建一个新的文件下载器实例。
     *
     * @summary 创建一个新的文件下载器实例。
     *
     * @param href 文件资源地址。
     * @param filename 下载保存的文件名。
     * @returns 初始化后的下载器实例。
     */
    static of(href: string, filename: string) {
      const _ = new this()
      const link = document.createElement("a")
      link.href = href
      link.target = "_blank"
      link.download = filename

      _.link = link
      return _
    }

    /**
     * 触发文件下载。
     *
     * 该方法会在页面中临时插入下载链接元素并触发点击事件，完成后移除该元素。
     */
    apply() {
      if (this.link) {
        document.body.appendChild(this.link)
        this.link.click()
        document.body.removeChild(this.link)
      }
    }
  }

  /**
   * 表格实时搜索服务。
   *
   * 该服务通过在关键词输入框绑定 `onChange` 事件，实时筛选表格数据。
   * 搜索逻辑为前端本地过滤，将匹配行保留、不匹配行隐藏。搜索过程经过
   * {@link Utils.Debounce} 防抖处理，避免输入过程中频繁触发重渲染。
   *
   * 匹配规则为：将每行数据的所有值序列化为 JSON 字符串后，判断是否包含
   * 关键词输入框的当前值。
   *
   * @summary 表格实时搜索服务。
   *
   * @since 26.7.1
   * @see {@link Utils.Debounce}
   * @see {@link YidaComponent}
   *
   * @example
   * ```js
   * Zeppelin.TableSearcher.of().compose("textField_keyword", "tableField_list", "id")
   * ```
   */
  export class TableSearcher {
    /**
     * 创建一个新的表格搜索服务实例。
     *
     * @summary 创建一个新的表格搜索服务实例。
     *
     * @returns 初始化后的表格搜索服务实例。
     * @since 26.7.1
     */
    static of() {
      return new this()
    }

    /**
     * 将表格搜索功能组合到指定组件。
     *
     * 该方法会为关键词输入框注册防抖处理后的 `onChange` 回调。当输入框值
     * 变化时，会根据当前关键词对表格数据进行本地过滤，并将过滤结果写回
     * 表格组件。若页面状态中存在表格快照，还会先同步快照中的变更。
     *
     * @summary 将表格搜索功能组合到指定组件。
     *
     * @param keywordComponentFieldId 关键词输入框组件的字段标识。
     * @param tableComponentFieldId 需要被搜索的表格组件的字段标识。
     * @param tableKeyComponentFieldId 表格组件中用于唯一标识行数据的字段标识，默认为空字符串。
     * @since 26.7.1
     * @see {@link Utils.Debounce}
     * @see {@link YidaPageContext.state}
     */
    compose(
      keywordComponentFieldId: string,
      tableComponentFieldId: string,
      tableKeyComponentFieldId = "",
    ) {
      const _ = Debounce.of((value) => {
        const tableSnapshot = window.usePlus().env.context.state[tableComponentFieldId] as Record<
          string,
          unknown
        >[]
        if (tableSnapshot) {
          for (const e of value as Record<string, unknown>[]) {
            const i = tableSnapshot.findIndex(
              (e2) => e2[tableKeyComponentFieldId] === e[tableKeyComponentFieldId],
            )
            tableSnapshot[i] = e
          }
        }

        const data = (window.usePlus().env.context.state[tableComponentFieldId] || value) as Record<
          string,
          unknown
        >[]
        window.usePlus().env.context.state[tableComponentFieldId] = data
        for (const e of data) {
          e.show = JSON.stringify(Object.values(e)).includes(
            String(window.usePlus().env.context.$(keywordComponentFieldId).getValue()),
          )
        }

        new YidaTableComponent(tableComponentFieldId).setValue(data.filter((e) => e.show))
      })

      const old = window.usePlus().env.context.$(keywordComponentFieldId).get("onChange")
      window
        .usePlus()
        .env.context.$(keywordComponentFieldId)
        .set("onChange", ({ value }: { value: unknown }) => {
          if (typeof old === "function") {
            old()
          }

          _(value)
        })
    }
  }

  /**
   * 表格 CSV 导出服务。
   *
   * 该服务通过在按钮组件绑定点击事件，将表格数据导出为 CSV 文件。
   * 导出过程经过 {@link Utils.Throttle} 节流处理，避免重复点击导致的性能问题。
   * 生成的 CSV 文件使用 UTF-8 编码并包含 BOM，可被 Excel 直接打开。
   *
   * 列标题通过 `YidaTableComponent.getHeaderMapper` 获取，行数据按列顺序
   * 拼接，自动处理包含逗号或双引号的单元格。
   *
   * @summary 表格 CSV 导出服务。
   *
   * @since 26.7.1
   * @see {@link Utils.Throttle}
   * @see {@link YidaComponent}
   *
   * @example
   * ```js
   * Zeppelin.TableExporter.of().compose("button_export", "tableField_list", "学生名单")
   * ```
   */
  export class TableExporter {
    /**
     * 创建一个新的表格导出服务实例。
     *
     * @summary 创建一个新的表格导出服务实例。
     *
     * @returns 初始化后的表格导出服务实例。
     * @since 26.7.1
     */
    static of() {
      return new this()
    }

    /**
     * 将表格导出功能组合到指定组件。
     *
     * 该方法会为触发按钮注册节流处理后的点击回调。点击时会读取表格数据，
     * 生成 CSV 内容，并通过浏览器下载保存为 `{title}_{timestamp}.csv` 文件。
     *
     * 触发按钮既可以是宜搭组件（通过 `window.usePlus().env.context.$` 访问），
     * 也可以是普通 DOM 元素（通过 `.${clickableComponentFieldId}` 选择器访问）。
     *
     * @summary 将表格导出功能组合到指定组件。
     *
     * @param clickableComponentFieldId 触发导出功能的按钮组件字段标识或 DOM 类名。
     * @param tableComponentFieldId 需要被导出的表格组件字段标识。
     * @param title 导出文件标题，可为字符串或返回字符串的函数；默认为 `"table_export"`。
     * @since 26.7.1
     * @see {@link Utils.Throttle}
     */
    compose(
      clickableComponentFieldId: string,
      tableComponentFieldId: string,
      title: string | (() => string) = "table_export",
    ) {
      const _ = Throttle.of(() => {
        const t = new YidaTableComponent(tableComponentFieldId)
        const data = t.getValue()
        const headerMapper = t.getHeaderMapper()

        let csvContent = "﻿" + Array.from(headerMapper.values()).join(",") + "\n"
        data.forEach((row) => {
          const rowData = Array.from(headerMapper.keys()).map((key) => {
            let cell = String(row[key])
            if (cell.includes(",") || cell.includes('"')) {
              cell = `"${cell.replace(/"/g, '""')}"`
            }
            return cell
          })
          csvContent += rowData.join(",") + "\n"
        })

        Downloader.of(
          "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent),
          `${typeof title === "function" ? title() : title}_${Date.now()}.csv`,
        ).apply()
      })

      const target = document.querySelector(`.${clickableComponentFieldId}`)
      if (target) {
        target.addEventListener("click", _)
      } else {
        const old = window.usePlus().env.context.$(clickableComponentFieldId).get("onClick")
        window
          .usePlus()
          .env.context.$(clickableComponentFieldId)
          .set("onClick", () => {
            if (typeof old === "function") {
              old()
            }

            _()
          })
      }
    }
  }

  /**
   * 页面截图服务。
   *
   * 该服务通过在按钮组件绑定点击事件，捕获指定 DOM 元素并下载为 PNG 图片。
   * 截图过程经过 {@link Utils.Throttle} 节流处理，避免重复点击。
   * 截图能力依赖第三方库 `dom-to-image`，首次创建服务实例时会通过
   * {@link YidaPageContext.utils} 动态加载该库。
   *
   * @summary 页面截图服务。
   *
   * @since 26.7.1
   * @see {@link Utils.Throttle}
   * @see {@link YidaPageContext}
   * @see `Window.domtoimage`
   *
   * @example
   * ```js
   * Zeppelin.ViewCapturer.of().compose("button_screenshot", "view_container", "页面截图")
   * ```
   */
  export class ViewCapturer {
    /**
     * 创建一个新的页面截图服务实例。
     *
     * 创建过程中会通过 {@link YidaPageContext.utils} 动态加载
     * `dom-to-image` 库，因此截图功能首次使用前需要确保网络可达。
     *
     * @summary 创建一个新的页面截图服务实例。
     *
     * @returns 初始化后的页面截图服务实例。
     * @since 26.7.1
     * @see {@link YidaPageContext}
     */
    static of() {
      window
        .usePlus()
        .env.context.utils.loadScript(
          "https://cdn.jsdelivr.net/npm/dom-to-image@2.6.0/dist/dom-to-image.min.js",
        )
      return new this()
    }

    /**
     * 将页面截图功能组合到指定组件。
     *
     * 该方法会为触发按钮注册节流处理后的点击回调。点击时会使用
     * `window.domtoimage.toPng` 捕获指定 DOM 元素，生成 PNG 数据 URI，
     * 并通过浏览器下载保存为 `{title}_{timestamp}.png` 文件。
     *
     * 触发按钮既可以是宜搭组件（通过 `window.usePlus().env.context.$` 访问），
     * 也可以是普通 DOM 元素（通过 `.${clickableComponentFieldId}` 选择器访问）。
     *
     * @summary 将页面截图功能组合到指定组件。
     *
     * @param clickableComponentFieldId 触发截图功能的按钮组件字段标识或 DOM 类名。
     * @param viewDomId 需要被截图的 DOM 元素 ID。
     * @param title 导出文件标题，可为字符串或返回字符串的函数；默认为 `"view"`。
     * @since 26.7.1
     * @see {@link Utils.Throttle}
     * @see `Window.domtoimage`
     */
    compose(
      clickableComponentFieldId: string,
      viewDomId: string,
      title: string | (() => string) = "view",
    ) {
      const _ = Throttle.of(async () => {
        const pngUri = await window.domtoimage.toPng(document.querySelector("#" + viewDomId), {
          quality: 1.0,
          useCORS: true,
          bypassSecurity: true,
          cacheBust: false,
        })

        Downloader.of(
          pngUri,
          `${typeof title === "function" ? title() : title}_${Date.now()}.png`,
        ).apply()
      })

      const target = document.querySelector(`.${clickableComponentFieldId}`)
      if (target) {
        target.addEventListener("click", _)
      } else {
        const old = window.usePlus().env.context.$(clickableComponentFieldId).get("onClick")
        window
          .usePlus()
          .env.context.$(clickableComponentFieldId)
          .set("onClick", () => {
            if (typeof old === "function") {
              old()
            }

            _()
          })
      }
    }
  }
}
