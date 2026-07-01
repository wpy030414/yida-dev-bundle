import { Logger } from "../utils"

/**
 * 钉钉机器人消息推送工具集。
 *
 * 本模块封装钉钉 Webhook 机器人的消息推送能力，支持文本、链接、Markdown、
 * 动作卡片与信息流卡片等标准消息类型。通过链式调用即可快速完成消息推送，
 * 并提供关键词校验、转发域名配置、异常捕获与日志输出等辅助机制。
 *
 * 所有消息类型均继承自 {@link EZPush.DingtalkMessagePushingBot}，
 * 并复用其 `of` 工厂方法与 `post` 推送逻辑。
 *
 * @summary 钉钉机器人消息推送工具集。
 *
 * @since 26.7.1
 * @see {@link https://open.dingtalk.com/document/development/robot-message-type}
 *
 * @example
 * ```js
 * EZPush.Text.of("your_access_token")
 *   .withPrecheckKeyword("重要")
 *   .withTransferDomain("to.example.com")
 *   .post("这是一条重要通知。")
 * ```
 */
export namespace EZPush {
  /**
   * 钉钉机器人消息类型官方参考文档地址。
   *
   * @summary 钉钉机器人消息类型官方参考文档地址。
   *
   * @since 26.7.1
   * @see {@link https://open.dingtalk.com/document/development/robot-message-type}
   */
  export const ref = "https://open.dingtalk.com/document/development/robot-message-type"

  /**
   * 钉钉消息推送机器人基类。
   *
   * 本抽象类定义钉钉 Webhook 机器人的通用配置与推送流程。子类仅需重写
   * `post` 方法以适配特定消息类型的参数结构，即可完成该类型的消息推送。
   *
   * 推送流程如下：
   * 1. 若已设置 {@link DingtalkMessagePushingBot.withPrecheckKeyword | 关键词校验}，
   *    则先检查消息内容是否包含指定关键词；若未包含则跳过推送并输出错误日志。
   * 2. 通过 `fetch` 向钉钉机器人接口发送 POST 请求。
   * 3. 若接口返回 `errcode` 非零，则抛出包含 `errmsg` 的错误。
   * 4. 推送成功或失败时均会输出对应日志。
   *
   * @summary 钉钉消息推送机器人基类。
   *
   * @since 26.7.1
   * @see {@link EZPush.Text}
   * @see {@link EZPush.Link}
   * @see {@link EZPush.Markdown}
   * @see {@link EZPush.ActionCard}
   * @see {@link EZPush.FeedCard}
   */
  export abstract class DingtalkMessagePushingBot {
    // 钉钉机器人 Webhook URL 中的 access_token 部分。
    private key = ""
    // 推送前的关键词校验字符串；为空时不进行校验。
    private precheckKeyword = ""
    // 转发域名；适用于内网或代理环境，默认为 "to.ahkdxx.cn"。
    private transferDomain = "to.ahkdxx.cn"

    /**
     * 创建并初始化一个新的钉钉机器人推送服务实例。
     *
     * 该方法为子类提供统一的工厂入口，返回的实例已保存 `access_token`。
     *
     * @summary 创建并初始化一个新的钉钉机器人推送服务实例。
     *
     * @typeParam T 具体的机器人子类类型。
     * @param key 钉钉机器人 Webhook URL 中的 `access_token` 部分。
     * @returns 初始化后的机器人实例。
     * @since 26.7.1
     * @example
     * ```js
     * const bot = EZPush.Text.of("your_access_token")
     * ```
     */
    static of<T extends DingtalkMessagePushingBot>(this: new () => T, key: string) {
      const _ = new this()
      _.key = key
      return _
    }

    /**
     * 设置推送前的关键词校验字符串。
     *
     * 设置后，只有当待推送消息内容（JSON 序列化后的字符串）包含该关键词时，
     * 才会真正执行推送；否则将跳过推送并记录错误日志。关键词校验可用于避免因
     * 未包含机器人安全设置关键词而导致的接口调用失败。
     *
     * @summary 设置推送前的关键词校验字符串。
     *
     * @param precheckKeyword 关键词字符串；传空字符串或不调用此方法则表示不校验。
     * @returns 当前实例，支持链式调用。
     * @since 26.7.1
     */
    withPrecheckKeyword(precheckKeyword: string) {
      this.precheckKeyword = precheckKeyword
      return this
    }

    /**
     * 设置钉钉机器人请求的转发域名。
     *
     * 当业务运行在内网环境或需要通过特定代理转发请求时，可通过此方法指定
     * 转发域名。最终请求 URL 格式为：
     * `https://{transferDomain}/https://oapi.dingtalk.com/robot/send?access_token={key}`。
     *
     * @summary 设置钉钉机器人请求的转发域名。
     *
     * @param transferDomain 转发域名字符串，例如 `"to.example.com"`。
     * @returns 当前实例，支持链式调用。
     * @since 26.7.1
     */
    withTransferDomain(transferDomain: string) {
      this.transferDomain = transferDomain
      return this
    }

    /**
     * 执行钉钉机器人消息推送。
     *
     * 该方法会先将参数对象序列化为 JSON 字符串，执行关键词校验（若已设置），
     * 然后通过 `fetch` 向钉钉机器人接口发送 POST 请求，并根据响应结果输出日志。
     * 任何网络异常或接口错误都会被捕获并记录为错误日志，不会向上抛出。
     *
     * @summary 执行钉钉机器人消息推送。
     *
     * @param param 消息内容参数对象，结构需符合钉钉机器人接口要求；默认为空对象。
     * @returns 异步操作完成后返回 `undefined`。
     * @since 26.7.1
     * @see {@link DingtalkMessagePushingBot.withPrecheckKeyword}
     * @see {@link DingtalkMessagePushingBot.withTransferDomain}
     */
    async post(param = {}) {
      try {
        const content = JSON.stringify(param)
        if (this.precheckKeyword && !content.includes(this.precheckKeyword)) {
          Logger.err("EZPush: The message does not contain the keyword, skipping push.", {
            param,
            keyword: this.precheckKeyword,
          })
          return
        }

        const res = await fetch(
          `${this.transferDomain ? `https://${this.transferDomain}/` : ""}https://oapi.dingtalk.com/robot/send?access_token=${this.key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: content,
          },
        )
        const json = await res.json()
        if (json.errcode) {
          throw new Error(json.errmsg)
        }

        Logger.ok("EZPush: Message has been pushed.")
      } catch (err) {
        Logger.err("EZPush: Failed to push message.", err)
      }
    }
  }

  /**
   * 文本消息推送服务。
   *
   * 用于向钉钉群组发送纯文本消息。文本内容支持普通字符串与换行等基础格式。
   *
   * @summary 文本消息推送服务。
   *
   * @since 26.7.1
   * @extends {EZPush.DingtalkMessagePushingBot}
   *
   * @example
   * ```js
   * EZPush.Text.of("your_access_token")
   *   .withPrecheckKeyword("重要")
   *   .post("这是一个重要的通知！\n请及时处理。")
   * ```
   */
  export class Text extends DingtalkMessagePushingBot {
    /**
     * 发送一条文本消息。
     *
     * @summary 发送一条文本消息。
     *
     * @param content 文本消息内容。
     * @returns 父类的 `post` 方法返回的异步结果。
     * @since 26.7.1
     */
    override post(content: string) {
      return super.post({
        msgtype: "text",
        text: {
          content,
        },
      })
    }
  }

  /**
   * 链接消息推送服务。
   *
   * 用于向钉钉群组发送包含标题、文本、跳转链接与图片的链接卡片消息。
   *
   * @summary 链接消息推送服务。
   *
   * @since 26.7.1
   * @extends {EZPush.DingtalkMessagePushingBot}
   *
   * @example
   * ```js
   * EZPush.Link.of("your_access_token").post({
   *   title: "新版本发布",
   *   text: "点击查看详情",
   *   messageUrl: "https://example.com/release-notes",
   *   picUrl: "https://example.com/release-image.png",
   * })
   * ```
   */
  export class Link extends DingtalkMessagePushingBot {
    /**
     * 发送一条链接卡片消息。
     *
     * @summary 发送一条链接卡片消息。
     *
     * @param data 链接消息数据，包含标题、文本、跳转链接与可选的图片链接。
     * @returns 父类的 `post` 方法返回的异步结果。
     * @since 26.7.1
     */
    override post(data: { title: string; text: string; messageUrl: string; picUrl?: string }) {
      return super.post({
        msgtype: "link",
        link: data,
      })
    }
  }

  /**
   * Markdown 消息推送服务。
   *
   * 用于向钉钉群组发送 Markdown 格式的消息。钉钉对 Markdown 语法存在一定限制，
   * 具体支持的语法与渲染效果请参考钉钉官方文档。
   *
   * @summary Markdown 消息推送服务。
   *
   * @since 26.7.1
   * @extends {EZPush.DingtalkMessagePushingBot}
   *
   * @example
   * ```js
   * EZPush.Markdown.of("your_access_token").post({
   *   title: "本周工作总结",
   *   text: "## 本周完成的任务\n- 任务一\n- 任务二\n\n## 下周计划\n- 计划一",
   * })
   * ```
   */
  export class Markdown extends DingtalkMessagePushingBot {
    /**
     * 发送一条 Markdown 消息。
     *
     * @summary 发送一条 Markdown 消息。
     *
     * @param data Markdown 消息数据，包含消息标题与 Markdown 文本内容。
     * @returns 父类的 `post` 方法返回的异步结果。
     * @since 26.7.1
     */
    override post(data: { title: string; text: string }) {
      return super.post({
        msgtype: "markdown",
        markdown: data,
      })
    }
  }

  /**
   * 动作卡片消息推送服务。
   *
   * 用于向钉钉群组发送包含交互按钮的动作卡片消息，支持单按钮与多按钮两种形态。
   * 单按钮形态通过 `singleTitle` 与 `singleURL` 指定；多按钮形态通过 `btns`
   * 数组指定多个按钮，并可设置按钮排列方向。
   *
   * @summary 动作卡片消息推送服务。
   *
   * @since 26.7.1
   * @extends {EZPush.DingtalkMessagePushingBot}
   *
   * @example
   * ```js
   * // 单按钮
   * EZPush.ActionCard.of("your_access_token").post({
   *   title: "审批通知",
   *   text: "您有一个新的审批请求需要处理。",
   *   singleTitle: "查看详情",
   *   singleURL: "https://example.com/approval/123",
   * })
   *
   * // 多按钮
   * EZPush.ActionCard.of("your_access_token").post({
   *   title: "会议邀请",
   *   text: "您被邀请参加一个会议，请选择您的回复。",
   *   btns: [
   *     { title: "接受", actionURL: "https://example.com/meeting/accept" },
   *     { title: "拒绝", actionURL: "https://example.com/meeting/reject" },
   *   ],
   *   btnOrientation: "1",
   * })
   * ```
   */
  export class ActionCard extends DingtalkMessagePushingBot {
    /**
     * 发送一条动作卡片消息。
     *
     * @summary 发送一条动作卡片消息。
     *
     * @param data 动作卡片消息数据，可为单按钮或多按钮形态。
     * @returns 父类的 `post` 方法返回的异步结果。
     * @since 26.7.1
     */
    override post(
      data:
        | {
            title: string
            text: string
            singleTitle: string
            singleURL: string
          }
        | {
            title: string
            text: string
            btns: { title: string; actionURL: string }[]
            btnOrientation?: "0" | "1"
          },
    ) {
      return super.post({
        msgtype: "actionCard",
        actionCard: data,
      })
    }
  }

  /**
   * 信息流卡片消息推送服务。
   *
   * 用于向钉钉群组发送包含多个链接项的信息流卡片，每个链接项可包含标题、
   * 消息链接与图片链接。
   *
   * @summary 信息流卡片消息推送服务。
   *
   * @since 26.7.1
   * @extends {EZPush.DingtalkMessagePushingBot}
   *
   * @example
   * ```js
   * EZPush.FeedCard.of("your_access_token").post({
   *   links: [
   *     {
   *       title: "新闻标题一",
   *       messageURL: "https://example.com/news/1",
   *       picURL: "https://example.com/news/1.jpg",
   *     },
   *     {
   *       title: "新闻标题二",
   *       messageURL: "https://example.com/news/2",
   *       picURL: "https://example.com/news/2.jpg",
   *     },
   *   ],
   * })
   * ```
   */
  export class FeedCard extends DingtalkMessagePushingBot {
    /**
     * 发送一条信息流卡片消息。
     *
     * @summary 发送一条信息流卡片消息。
     *
     * @param data 信息流卡片消息数据，包含链接项数组。
     * @returns 父类的 `post` 方法返回的异步结果。
     * @since 26.7.1
     */
    override post(data: { links: { title: string; messageURL: string; picURL: string }[] }) {
      return super.post({
        msgtype: "feedCard",
        feedCard: data,
      })
    }
  }
}
