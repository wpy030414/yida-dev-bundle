/**
 * 宜搭页面运行时的全局类型声明。
 *
 * 本模块扩展了浏览器 Window 接口，为 usePlus 挂载点、
 * Modules.Zeppelin 截图能力所需的外部库 `domtoimage`，
 * 以及宜搭低代码平台的核心页面上下文与组件 API 提供类型定义。
 *
 * 这些类型是 Modules 与 Utils 各模块在宜搭页面中正常工作的前提；
 * 当脚本在标准宜搭自定义页面或普通表单页面中执行时，
 * 页面通常会通过 YidaPageWindow.LeGao 暴露必要的运行时上下文。
 *
 * @summary 宜搭页面运行时的全局类型声明。
 *
 * @since 26.7.1
 * @see {@link Modules}
 * @see {@link Utils}
 */
declare global {
  /**
   * 浏览器全局窗口接口的扩展。
   *
   * 新增 Window.usePlus 全局访问点，以及 `domtoimage` 占位声明。
   */
  interface Window {
    /**
     * 获取当前已挂载的 Yida Plus 运行时上下文。
     *
     * 该函数由入口文件在脚本加载时自动注入到
     * `window.top` 与 `window`。调用方可以传入一个宜搭页面窗口对象；
     * 若省略参数，则默认使用当前 `window`。
     *
     * 返回值是一个被 Object.freeze 冻结的对象，包含项目主页、版本号
     * 以及从页面上下文中提取的环境信息（CSRF Token、应用 ID、表单 UUID、
     * 宜搭组件访问上下文等）。
     *
     * @summary 获取当前已挂载的 Yida Plus 运行时上下文。
     *
     * @param yidaPageWindow 可选的宜搭页面窗口对象。默认为当前 `window`。
     * @returns 冻结的运行时上下文对象。
     * @throws {TypeError} 当页面未暴露 YidaPageWindow.g_config、
     *         YidaPageWindow.pageContext 或 YidaPageWindow.LeGao
     *         时，访问内部字段可能抛出。
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
    usePlus: (yidaPageWindow?: YidaPageWindow) => {
      /** 项目主页地址。 */
      homepage: string
      /** 当前版本号，格式为 `major.minor.patch.build`。 */
      version: string
      /** 运行时环境信息。 */
      env: {
        /** 当前页面的 CSRF Token，取自 YidaPageWindow.g_config._csrf_token。 */
        csrfToken: string
        /** 当前宜搭应用 ID，取自 YidaPageWindow.pageContext.appType。 */
        appId: string
        /** 当前表单 UUID，取自 YidaPageWindow.pageContext.formUuid。 */
        formUuid: string
        /** 宜搭页面上下文，用于访问组件、状态与工具方法。 */
        context: YidaPageContext
      }
    }

    /**
     * `dom-to-image` 库的占位声明。
     *
     * 该属性并非由本库自身提供，而是在 Modules.Zeppelin.ViewCapturer
     * 首次触发截图时通过 YidaPageContext.utils.loadScript 动态加载。
     * 因此其类型标注为 `any`，调用方应确保截图功能使用前该库已就绪。
     *
     * @summary `dom-to-image` 库的占位声明。
     *
     * @since 26.7.1
     * @see {@link Modules.Zeppelin.ViewCapturer}
     */
    domtoimage: any
  }
}

/**
 * 宜搭页面窗口对象。
 *
 * 该接口封装宜搭低代码平台暴露的全局配置、页面上下文以及乐高超运行时入口。
 * 它不代表完整的浏览器 `Window`，仅包含本库运行所需的最小字段集合；
 * 模块内部通过 `window as unknown as YidaPageWindow` 的方式访问这些字段。
 *
 * 在自定义页面或普通表单页面的 `didMount` 生命周期中，
 * 这些字段应当已经可用。
 *
 * @summary 宜搭页面窗口对象。
 *
 * @since 26.7.1
 * @see {@link YidaPageContext}
 */
export interface YidaPageWindow {
  /**
   * 宜搭全局配置对象。
   *
   * 包含当前会话的 CSRF Token，用于构建需要身份校验的数据请求。
   */
  g_config: {
    /** 当前页面请求的 CSRF Token。 */
    _csrf_token: string
  }

  /**
   * 宜搭页面上下文配置。
   *
   * 包含应用类型与表单 UUID，常用于初始化 Modules.QuickMap 等
   * 数据访问模块的默认参数。
   */
  pageContext: {
    /** 应用类型标识，通常作为应用 ID 使用。 */
    appType: string
    /** 当前表单的 UUID。 */
    formUuid: string
  }

  /**
   * 乐高（LeGao）运行时入口。
   *
   * 提供获取宜搭页面上下文的能力，是 {@link usePlus}
   * 提取 YidaPageContext 的底层来源。
   */
  LeGao: {
    /**
     * 获取乐高上下文对象。
     *
     * @summary 获取乐高上下文对象。
     *
     * @returns 包含实际页面上下文 YidaPageContext 的对象。
     */
    getContext: () => {
      /** 真正的宜搭页面上下文实例。 */
      __debugThis__: YidaPageContext
    }
  }
}

/**
 * 宜搭页面运行时上下文。
 *
 * 该上下文由 YidaPageWindow.LeGao 提供，是各模块与宜搭页面
 * 交互的核心入口。它提供了组件访问器 `$`、页面状态 `state`
 * 以及工具方法 `utils.loadScript`。
 *
 * @summary 宜搭页面运行时上下文。
 *
 * @since 26.7.1
 * @see {@link YidaComponent}
 */
export interface YidaPageContext {
  /**
   * 根据字段标识获取宜搭组件实例。
   *
   * @summary 根据字段标识获取宜搭组件实例。
   *
   * @param fieldId 组件字段标识，例如 `"textField_xxx"`。
   * @returns 对应字段的 YidaComponent 实例。
   */
  $(fieldId: string): YidaComponent

  /** 当前页面的状态对象，可用于跨组件共享数据。 */
  state: Record<string, unknown>

  /** 宜搭提供的工具方法集合。 */
  utils: {
    /**
     * 动态加载外部脚本。
     *
     * 该方法常用于在运行时引入第三方库，例如
     * Modules.Zeppelin.ViewCapturer 加载 `dom-to-image`。
     *
     * @summary 动态加载外部脚本。
     *
     * @param url 脚本资源的 URL 地址。
     */
    loadScript: (url: string) => void
  }
}

/**
 * 宜搭组件的标准操作接口。
 *
 * 该接口封装了宜搭表单/自定义页面中组件的通用行为，
 * 包括读写值、重置、行为控制以及校验规则配置。
 * 所有 YidaPageContext.$ 返回的组件对象均应遵循此接口。
 *
 * @summary 宜搭组件的标准操作接口。
 *
 * @since 26.7.1
 * @see {@link YidaPageContext}
 */
export interface YidaComponent {
  /**
   * 获取组件的某个内部属性值。
   *
   * @summary 获取组件的某个内部属性值。
   *
   * @typeParam T 返回值类型。
   * @param key 属性键名。
   * @returns 属性对应的值。
   */
  get<T>(key: string): T

  /**
   * 设置组件的某个内部属性值。
   *
   * @summary 设置组件的某个内部属性值。
   *
   * @param key 属性键名。
   * @param value 要设置的属性值。
   */
  set(key: string, value: unknown): void

  /**
   * 获取组件当前的业务值。
   *
   * @summary 获取组件当前的业务值。
   *
   * @typeParam T 业务值类型。
   * @returns 组件当前值。
   */
  getValue<T>(): T

  /**
   * 设置组件当前的业务值。
   *
   * @summary 设置组件当前的业务值。
   *
   * @param value 要设置的业务值。
   */
  setValue(value: unknown): void

  /** @summary 重置组件值到初始状态。 */
  reset(): void

  /** @summary 获取组件当前的行为类型。 */
  getBehavior(): string

  /**
   * 设置组件的行为类型。
   *
   * @summary 设置组件的行为类型。
   *
   * @param behavior 行为类型字符串。
   */
  setBehavior(behavior: string): void

  /** @summary 重置组件行为到默认状态。 */
  resetBehavior(): void

  /**
   * 触发组件校验。
   *
   * 校验完成后，回调函数会收到错误信息数组与当前值记录。
   * 若校验通过，`errors` 通常为 `undefined` 或空数组。
   *
   * @summary 触发组件校验。
   *
   * @param callback 校验完成后的回调函数。
   *        参数 `errors` 为错误信息列表，`values` 为当前值快照。
   */
  validate(callback?: (errors?: string[], values?: Record<string, unknown>) => void): void

  /** @summary 禁用组件校验。 */
  disableValid(): void

  /**
   * 启用组件校验。
   *
   * @summary 启用组件校验。
   *
   * @param validateAtOnce 是否在启用后立即触发一次校验。默认为 `false`。
   */
  enableValid(validateAtOnce?: boolean): void

  /**
   * 设置自定义校验规则。
   *
   * @summary 设置自定义校验规则。
   *
   * @param rules 自定义校验规则数组。每条规则包含类型、校验函数与错误提示信息。
   * @param validateAtOnce 是否在设置后立即触发一次校验。默认为 `false`。
   */
  setValidation(
    rules: {
      /** 规则类型，当前仅支持 `"customValidate"`。 */
      type: "customValidate"
      /**
       * 校验函数。
       *
       * @summary 校验函数。
       *
       * @param value 当前组件值。
       * @param rule 当前校验规则对象。
       * @returns 校验是否通过。
       */
      param: (value: unknown, rule: unknown) => boolean
      /** 校验失败时向用户展示的提示文本。 */
      message: string
    }[],
    validateAtOnce?: boolean,
  ): void

  /**
   * 重置组件校验规则。
   *
   * @summary 重置组件校验规则。
   *
   * @param validateAtOnce 是否在重置后立即触发一次校验。默认为 `false`。
   */
  resetValidation(validateAtOnce?: boolean): void
}
