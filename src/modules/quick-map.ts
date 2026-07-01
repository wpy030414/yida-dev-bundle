import { Logger, Tasks, Tube } from "../utils"

/**
 * 宜搭表单数据查询响应类型。
 *
 * 该类型描述宜搭 `searchFormDatas` / `getInstances` / `listTableDataByFormInstIdAndTableId`
 * 等接口返回的内容结构，包含表单实例数组与总记录数。
 *
 * @summary 宜搭表单数据查询响应类型。
 *
 * @since 26.7.1
 */
type YidaSelectOperationResponse = {
  data: {
    formInstId: string

    formData: Record<string, unknown>
    data: Record<string, unknown>
  }[]

  totalCount: number
}

/**
 * 宜搭应用与表单数据 ORM 工具集。
 *
 * 本模块提供极简 API 以完成宜搭表单及流程实例的查询、新增、删除、更新等操作。
 * {@link QuickMap.AppMapper} 负责维护应用上下文（应用 ID、CSRF Token），
 * {@link QuickMap.FormMapper} 负责针对具体表单 UUID 执行数据操作，
 * 并自动处理分页、子表数据加载、元信息注入等复杂逻辑。
 *
 * @summary 宜搭应用与表单数据 ORM 工具集。
 *
 * @since 26.7.1
 * @see {@link https://docs.aliwork.com/docs/developer/api/openAPI}
 * @see {@link YidaPageContext}
 * @see {@link YidaPageWindow}
 *
 * @example
 * ```js
 * // 查询单条记录
 * const records = await QuickMap.use("formUuid_xxx").select("formInstId_xxx")
 *
 * // 按条件分页查询
 * const list = await QuickMap.use("formUuid_xxx").select({ textField_xxx: "条件" }, 5)
 *
 * // 新增数据
 * await QuickMap.use("formUuid_xxx").insert({ textField_xxx: "值" })
 * ```
 */
export namespace QuickMap {
  /**
   * 宜搭开放 API 官方参考文档地址。
   *
   * @summary 宜搭开放 API 官方参考文档地址。
   *
   * @since 26.7.1
   * @see {@link https://docs.aliwork.com/docs/developer/api/openAPI}
   */
  export const ref = "https://docs.aliwork.com/docs/developer/api/openAPI"

  /**
   * 宜搭应用上下文映射器。
   *
   * 该类封装宜搭应用级别的上下文信息，包括应用 ID 与 CSRF Token，
   * 用于为 {@link QuickMap.FormMapper} 提供请求所需的环境参数。
   *
   * @summary 宜搭应用上下文映射器。
   *
   * @since 26.7.1
   * @see {@link QuickMap.FormMapper}
   * @see {@link QuickMap.use}
   */
  export class AppMapper {
    /**
     * 宜搭应用 ID。
     *
     * 通常对应 {@link YidaPageWindow.pageContext} 的 `appType` 字段。
     *
     * @summary 宜搭应用 ID。
     *
     * @since 26.7.1
     */
    appId = ""

    /**
     * 当前会话的 CSRF Token。
     *
     * 通常对应 {@link YidaPageWindow.g_config} 的 `_csrf_token` 字段，用于构建需要
     * 身份校验的数据请求。
     *
     * @summary 当前会话的 CSRF Token。
     *
     * @since 26.7.1
     */
    csrfToken = ""

    /**
     * 创建一个新的应用上下文映射器实例。
     *
     * @summary 创建一个新的应用上下文映射器实例。
     *
     * @param appId 宜搭应用 ID，默认为 `window.usePlus().env.appId`。
     * @param csrfToken CSRF Token，默认为 `window.usePlus().env.csrfToken`。
     * @returns 初始化后的应用上下文映射器实例。
     * @since 26.7.1
     * @see {@link YidaPageWindow}
     */
    static of(appId = window.usePlus().env.appId, csrfToken = window.usePlus().env.csrfToken) {
      const _ = new this()
      _.appId = appId
      _.csrfToken = csrfToken
      return _
    }

    /**
     * 使用指定表单 UUID 创建表单数据操作器实例。
     *
     * @summary 使用指定表单 UUID 创建表单数据操作器实例。
     *
     * @param formUuid 表单 UUID。
     * @returns 绑定到当前应用上下文的 {@link QuickMap.FormMapper} 实例。
     * @since 26.7.1
     * @see {@link QuickMap.FormMapper}
     */
    use(formUuid: string) {
      return FormMapper.of(this, formUuid)
    }
  }

  /**
   * 表单数据操作器。
   *
   * 该类提供针对具体宜搭表单或流程实例的数据操作能力，包括查询、新增、删除、
   * 更新。查询操作会自动处理分页、子表数据加载（超过 50 条时自动拉取剩余数据）
   * 以及元信息注入。
   *
   * 通过 {@link FormMapper.asProcess} 方法可将操作器切换为流程实例模式，
   * 此时所有操作将针对流程实例而非普通表单。
   *
   * @summary 表单数据操作器。
   *
   * @since 26.7.1
   * @see {@link QuickMap.AppMapper}
   * @see {@link QuickMap.use}
   */
  export class FormMapper {
    /**
     * 应用上下文映射器实例。
     *
     * 提供当前操作所需的 {@link AppMapper.appId} 与
     * {@link AppMapper.csrfToken} 等环境参数。
     *
     * @summary 应用上下文映射器实例。
     *
     * @since 26.7.1
     */
    appMapper = new AppMapper()

    /**
     * 当前操作的目标表单 UUID。
     *
     * @summary 当前操作的目标表单 UUID。
     *
     * @since 26.7.1
     */
    formUuid = ""

    /**
     * 当前操作的数据类型。
     *
     * - `"form"`：普通表单数据。
     * - `"process"`：流程实例数据。
     *
     * 默认值为 `"form"`。
     *
     * @summary 当前操作的数据类型。
     *
     * @since 26.7.1
     */
    type: "form" | "process" = "form"

    /**
     * 流程编码。
     *
     * 仅在 {@link FormMapper.type} 为 `"process"` 时有效，用于流程实例的新增操作。
     *
     * @summary 流程编码。
     *
     * @since 26.7.1
     */
    processCode = ""

    /**
     * 创建一个新的表单数据操作器实例。
     *
     * @summary 创建一个新的表单数据操作器实例。
     *
     * @param appMapper 应用上下文映射器实例，默认为调用 {@link AppMapper.of} 的返回值。
     * @param formUuid 表单 UUID，默认为 `window.usePlus().env.formUuid`。
     * @returns 初始化后的表单数据操作器实例。
     * @since 26.7.1
     * @see {@link QuickMap.AppMapper}
     */
    static of(appMapper = AppMapper.of(), formUuid = window.usePlus().env.formUuid) {
      const _ = new this()
      _.appMapper = appMapper
      _.formUuid = formUuid
      return _
    }

    /**
     * 切换到流程实例模式。
     *
     * 切换后，所有数据操作将针对流程实例而非普通表单，并自动适配相关接口与
     * 数据结构。
     *
     * @summary 切换到流程实例模式。
     *
     * @param processCode 流程编码，需与表单绑定的流程一致。
     * @returns 当前实例，支持链式调用。
     * @since 26.7.1
     */
    asProcess(processCode: string) {
      this.type = "process"
      this.processCode = processCode
      return this
    }

    /**
     * 查询表单或流程实例数据。
     *
     * 该方法支持两种查询模式：
     * - 当 `query` 为对象时，按条件查询多条记录，并自动处理分页与子表数据加载。
     * - 当 `query` 为字符串时，视为记录 ID（普通表单的 `formInstId` 或流程实例的
     *   `processInstanceId`），查询单条记录。
     *
     * 返回的记录对象已包含 `meta` 字段，其中保存了 `formInstId` 等元信息。
     * 对于 `tableField_xxx` 类型的子表字段，若条数超过 50，会自动拉取剩余数据。
     *
     * @summary 查询表单或流程实例数据。
     *
     * @param query 查询条件对象或单条记录 ID，默认为空对象（查询全部）。
     * @param pageAmount 需要查询的页数，默认为 `Number.MAX_SAFE_INTEGER`（查询所有页）。
     * @param pageOffset 页码偏移量，默认为 `0`（从第一页开始）。
     * @param rawParams 附加的原始接口请求参数，默认为空对象。
     * @returns 异步返回查询结果数组；查询失败时返回 `undefined`。
     * @since 26.7.1
     * @see {@link Utils.Tube}
     * @see {@link Utils.Tasks}
     */
    async select(
      query: object | string = {},
      pageAmount = Number.MAX_SAFE_INTEGER,
      pageOffset = 0,
      rawParams = {},
    ) {
      const handleMountMeta = (data: YidaSelectOperationResponse["data"]) =>
        data.map((raw) => {
          const { formData, data, ...meta } = raw
          const record = this.type === "form" ? formData : data
          return { ...record, meta }
        }) as Record<string, unknown>[]

      const handleSubtable = async (data: Record<string, unknown>[]) => {
        for (const e of data) {
          for (const [key] of Object.entries(e)) {
            if (key.startsWith("tableField")) {
              if ((e[key] as unknown[]).length < 50) {
                continue
              }

              const baseUrl = `/dingtalk/web/${this.appMapper.appId}/v1/form/listTableDataByFormInstIdAndTableId.json?`
              const fetchFn = (page: number) =>
                fetch(
                  baseUrl +
                    new URLSearchParams({
                      formUuid: this.formUuid,
                      formInstanceId: (e.meta as Record<string, unknown>).formInstId as string,
                      tableFieldId: key,
                      currentPage: String(page),
                      pageSize: String(50),

                      _csrf_token: this.appMapper.csrfToken,
                    }).toString(),
                  { method: "GET" },
                )

              const records = []

              const resp = await (await fetchFn(1)).json()

              if (resp.success) {
                const { data, totalCount } = resp.content as YidaSelectOperationResponse
                records.push(...data)

                if (totalCount > 50) {
                  records.push(...(await handleMultiPage(fetchFn, totalCount)))
                }
              }

              e[key] = records
            }
          }
        }

        return data
      }

      const handleMultiPage = async (
        fetchFn: (page: number) => Promise<Response>,
        totalCount: number,
      ) => {
        const pageAmountMax = Math.ceil(totalCount / 100)
        const tasks = []
        for (
          let page = 2 + pageOffset;
          page <= Math.min(pageAmount + pageOffset, pageAmountMax);
          page++
        ) {
          tasks.push(() =>
            Tube.from(
              page,
              fetchFn,
              async (resp) => {
                const json = await resp.json()

                if (json.success) {
                  return json.content.data as YidaSelectOperationResponse["data"]
                } else {
                  return []
                }
              },
              handleMountMeta,
              handleSubtable,
            ),
          )
        }

        return (await Tasks.of(tasks)).flat()
      }

      const records = []

      if (typeof query != "string") {
        const baseUrl = `/dingtalk/web/${this.appMapper.appId}/v1/${
          this.type
        }/${this.type === "form" ? "searchFormDatas" : "getInstances"}.json?`
        const fetchFn = (page: number) =>
          fetch(
            baseUrl +
              new URLSearchParams(
                Object.assign(
                  {
                    formUuid: this.formUuid,
                    searchFieldJson: JSON.stringify(query),
                    currentPage: String(page),
                    pageSize: String(100),

                    _csrf_token: this.appMapper.csrfToken,
                  },
                  rawParams,
                ),
              ).toString(),
            { method: "GET" },
          )

        const resp = await (await fetchFn(1 + pageOffset)).json()

        if (resp.success) {
          const { data, totalCount } = resp.content

          records.push(
            ...(await Tube.from<Record<string, unknown>[]>(data, handleMountMeta, handleSubtable)),
          )

          if (pageAmount + pageOffset > 1 && totalCount > 100) {
            records.push(...(await handleMultiPage(fetchFn, totalCount)))
          }
          Logger.ok("QuickMap: Search successful", records)

          return records
        } else {
          Logger.err("QuickMap: Search failed", resp)
        }
      } else {
        const baseUrl = `/dingtalk/web/${this.appMapper.appId}/v1/${
          this.type
        }/${this.type === "form" ? "getFormDataById" : "getInstanceById"}.json?`

        const resp = await (
          await fetch(
            baseUrl +
              new URLSearchParams({
                formInstId: query,
                processInstanceId: query,

                _csrf_token: this.appMapper.csrfToken,
              }).toString(),
            { method: "GET" },
          )
        ).json()

        if (resp.success) {
          const data = [resp.content]

          records.push(
            ...(await Tube.from<Record<string, unknown>[]>(data, handleMountMeta, handleSubtable)),
          )
          Logger.ok("QuickMap: Query successful", records)

          return records
        } else {
          Logger.err("QuickMap: Query failed", resp)
        }
      }
    }

    /**
     * 新增一条表单或流程实例数据。
     *
     * 根据 {@link FormMapper.type} 自动选择普通表单的 `saveFormData` 接口
     * 或流程实例的 `startInstance` 接口。
     *
     * @summary 新增一条表单或流程实例数据。
     *
     * @param data 需要新增的数据对象，结构需符合目标表单字段定义。
     * @returns 异步操作完成后返回 `undefined`。
     * @since 26.7.1
     */
    async insert(data = {}) {
      const baseUrl = `/dingtalk/web/${this.appMapper.appId}/v1/${this.type}/${
        this.type === "form" ? "saveFormData" : "startInstance"
      }.json?`

      const resp = await (
        await fetch(
          baseUrl +
            new URLSearchParams({
              appType: this.appMapper.appId,
              formUuid: this.formUuid,
              processCode: String(this.processCode),
              formDataJson: JSON.stringify(data),

              _csrf_token: this.appMapper.csrfToken,
            }).toString(),
          { method: "POST" },
        )
      ).json()

      if (resp.success) {
        Logger.ok("QuickMap: Insert successful", resp)
      } else {
        Logger.err("QuickMap: Insert failed", resp)
      }
    }

    /**
     * 删除一条表单或流程实例数据。
     *
     * 根据 {@link FormMapper.type} 自动选择普通表单的 `deleteFormData` 接口
     * 或流程实例的 `deleteInstance` 接口。
     *
     * @summary 删除一条表单或流程实例数据。
     *
     * @param id 记录 ID，可为普通表单的 `formInstId` 或流程实例的 `processInstanceId`。
     * @returns 异步操作完成后返回 `undefined`。
     * @since 26.7.1
     */
    async delete_(id: string) {
      const baseUrl = `/dingtalk/web/${this.appMapper.appId}/v1/${this.type}/${
        this.type === "form" ? "deleteFormData" : "deleteInstance"
      }.json?`

      const resp = await (
        await fetch(
          baseUrl +
            new URLSearchParams({
              formInstId: id,
              processInstanceId: id,

              _csrf_token: this.appMapper.csrfToken,
            }).toString(),
          { method: "POST" },
        )
      ).json()

      if (resp.success) {
        Logger.ok("QuickMap: Delete successful", resp)
      } else {
        Logger.err("QuickMap: Delete failed", resp)
      }
    }

    /**
     * 更新一条表单或流程实例数据。
     *
     * 根据 {@link FormMapper.type} 自动选择普通表单的 `updateFormData` 接口
     * 或流程实例的 `updateInstance` 接口。
     *
     * @summary 更新一条表单或流程实例数据。
     *
     * @param id 记录 ID，可为普通表单的 `formInstId` 或流程实例的 `processInstanceId`。
     * @param data 需要更新的数据对象，结构需符合目标表单字段定义。
     * @returns 异步操作完成后返回 `undefined`。
     * @since 26.7.1
     */
    async update(id: string, data = {}) {
      const baseUrl = `/dingtalk/web/${this.appMapper.appId}/v1/${this.type}/${
        this.type === "form" ? "updateFormData" : "updateInstance"
      }.json?`

      const resp = await (
        await fetch(
          baseUrl +
            new URLSearchParams({
              formInstId: id,
              processInstanceId: id,
              updateFormDataJson: JSON.stringify(data),

              _csrf_token: this.appMapper.csrfToken,
            }).toString(),
          { method: "POST" },
        )
      ).json()

      if (resp.success) {
        Logger.ok("QuickMap: Update successful", resp)
      } else {
        Logger.err("QuickMap: Update failed", resp)
      }
    }
  }

  /**
   * 快速创建一个表单数据操作器实例。
   *
   * 该方法使用全局配置的应用 ID、CSRF Token 与表单 UUID 创建
   * {@link QuickMap.FormMapper} 实例，适用于单应用场景的快速查询与操作。
   *
   * @summary 快速创建一个表单数据操作器实例。
   *
   * @param formUuid 表单 UUID，默认为 `window.usePlus().env.formUuid`。
   * @returns 初始化后的表单数据操作器实例。
   * @since 26.7.1
   * @see {@link QuickMap.FormMapper}
   * @see {@link QuickMap.AppMapper}
   */
  export function use(formUuid = window.usePlus().env.formUuid) {
    return AppMapper.of().use(formUuid)
  }
}
