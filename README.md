# 宜搭+（Yida Plus）

宜搭+ 是一套面向宜搭（AliWork）低代码平台的增强外挂库，由[帕鲁](mailto:krkr@xrl.im)开发并维护。它以 IIFE 格式打包，深度适配钉钉教育等实际业务场景，能够在不修改宜搭应用原有架构的前提下，为自定义页面注入消息推送、组件语义化、数据模拟、ORM 式查询以及组件组合增强等能力。

所有模块与工具类均挂载到页面全局作用域，开发者只需在页面 `didMount()` 生命周期中远程引入脚本，即可在后续代码中通过 `window.usePlus()` 或直接使用 `EZPush`、`Mock`、`QuickMap` 等全局名称访问。

---

## 目录

- [快速开始](#快速开始)
- [业务模块](#业务模块)
- [通用工具](#通用工具)
- [类型声明](#类型声明)
- [构建与文档](#构建与文档)
- [设计与约束](#设计与约束)
- [最佳实践](#最佳实践)

---

## 快速开始

在宜搭自定义页面的 `didMount()` 中加载远程脚本：

```js
// @ts-check

export async function didMount() {
  // 稳定版本
  await utils.loadScript("https://cdn.ahkdxx.cn/yida-plus/dist/latest.js")

  // 或预览实验特性（金丝雀频道）
  // await utils.loadScript("https://cdn.ahkdxx.cn/yida-plus/dist/canary.js")

  // 也可以使用 GitHub Pages 源
  // await utils.loadScript("https://yida-plus.xrl.im/latest.js")
  // await utils.loadScript("https://yida-plus.xrl.im/canary.js")
}
```

脚本加载完成后，会立即向 `window.top` 与 `window` 注入以下内容：

- `window.usePlus()`：获取当前运行时上下文，包括版本号、应用 ID、表单 UUID、宜搭页面上下文等。
- 全部业务模块：`EZPush`、`Infection`、`Mock`、`QuickMap`、`Zeppelin`。
- 全部通用工具类：`CountMap`、`CSSBuilder`、`DateX`、`Debounce`、`DeepFreeze`、`Logger`、`Member`、`Memo`、`SchoolDays`、`Tasks`、`Throttle`、`Tube`。

详细的 API 说明请参阅 [TypeDoc 生成的 API 文档](https://yida-plus.xrl.im/docs/index.html)。

---

## 业务模块

| 模块          | 定位                                                                                         | 典型场景                                       | 参考                             |
| ------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------- |
| **EZPush**    | 钉钉机器人消息推送工具集，封装文本、链接、Markdown、动作卡片、信息流卡片等标准消息类型。     | 向多个群组定期推送公众号文章或通知。           | [源码](src/modules/ez-push.ts)   |
| **Infection** | 宜搭组件侵入式改造与教育时间语义化工具集，动态生成学年、学期、周次、星期、年级、班级等选项。 | 将普通下拉框转换为“学年-学期-周次”联动组件。   | [源码](src/modules/infection.ts) |
| **Mock**      | 业务模拟数据生成工具集，支持中文姓名、教学楼名称、身份证号、手机号等真实规则数据。           | 演示环境快速填充 2000 条学生记录。             | [源码](src/modules/mock.ts)      |
| **QuickMap**  | 宜搭应用与表单数据 ORM 工具集，提供极简 API 完成查询、新增、更新、删除及子表数据加载。       | 将子表单的一对多关系转换为多个一对一关系处理。 | [源码](src/modules/quick-map.ts) |
| **Zeppelin**  | 宜搭组件组合业务增强工具集，通过 `compose` 将搜索、导出 CSV、截图等功能绑定到指定组件。      | 为表格组件添加前端搜索、导出 CSV 或 PNG 截图。 | [源码](src/modules/zeppelin.ts)  |

---

## 通用工具

| 工具           | 定位                                                               | 参考                             |
| -------------- | ------------------------------------------------------------------ | -------------------------------- |
| **CountMap**   | 字符串键出现次数的计数映射，支持关联对象。                         | [源码](src/utils/count-map.ts)   |
| **CSSBuilder** | 链式构建内联 CSS 字符串的构建器。                                  | [源码](src/utils/css-builder.ts) |
| **DateX**      | 具有 Temporal 风格的日期对象，支持加减、格式化、周次计算。         | [源码](src/utils/date-x.ts)      |
| **Debounce**   | 防抖函数包装器，降低高频调用频率。                                 | [源码](src/utils/debounce.ts)    |
| **DeepFreeze** | 递归冻结对象及其嵌套属性的工具类，通过 `DeepFreeze.of(obj)` 使用。 | [源码](src/utils/deep-freeze.ts) |
| **Logger**     | 带统一样式的浏览器控制台日志输出工具。                             | [源码](src/utils/logger.ts)      |
| **Member**     | 选择器或表单成员项的标准化封装。                                   | [源码](src/utils/member.ts)      |
| **Memo**       | 基于 `sessionStorage` 的对象状态记忆与差异比较。                   | [源码](src/utils/memo.ts)        |
| **SchoolDays** | 校历计算工具，用于推导学年、学期、周次、上下午等教育时间。         | [源码](src/utils/school-days.ts) |
| **Tasks**      | 并发异步任务管理器，支持并发控制、超时与指数退避重试。             | [源码](src/utils/tasks.ts)       |
| **Throttle**   | 节流函数包装器，限制函数触发频率。                                 | [源码](src/utils/throttle.ts)    |
| **Tube**       | 管道工具，将初始值依次传递给一系列同步或异步函数处理。             | [源码](src/utils/tube.ts)        |

---

## 类型声明

项目在 `types/index.d.ts` 中声明了宜搭页面运行所需的核心类型：

- **`YidaPageWindow`**：宜搭页面窗口对象，封装 `g_config`、`pageContext`、`LeGao` 等本库运行所需的最小字段集合。
- **`YidaPageContext`**：宜搭页面运行时上下文，提供组件访问器 `$`、页面状态 `state` 以及 `utils.loadScript` 等工具方法。
- **`YidaComponent`**：宜搭组件的标准操作接口，支持读写值、行为控制、校验规则配置等。
- **全局 `Window` 扩展**：注入 `Window.usePlus` 访问点与 `Window.domtoimage` 占位声明。

这些类型与模块 JSDoc 共同被 TypeDoc 解析，生成完整的 HTML API 文档。

---

## 构建与文档

本项目使用 [Vite](https://vitejs.dev/) 构建，使用 [TypeDoc](https://typedoc.org/) 生成 API 文档。

```bash
# 安装依赖
pnpm install

# 格式化全部源码
pnpm run f

# 生成 API 文档
pnpm run docs

# 构建生产包（包含版本号产物 + latest.js + 文档）
pnpm run build

# 构建金丝雀版本（canary.js）
pnpm run build:canary
```

构建产物位于 `dist/` 目录：

- `dist/<version>.js`：带有当前版本号的正式构建产物。
- `dist/latest.js`：始终指向最新稳定版本的构建产物。
- `dist/canary.js`：金丝雀实验构建产物。
- `dist/docs/`：TypeDoc 生成的 HTML 文档站点。

构建目标为 `es2022`，输出格式为 IIFE，便于在宜搭页面脚本中直接引用。

---

## 设计与约束

- **全局挂载**：作为外挂 IIFE 库，脚本加载后会主动污染 `window.top` 与 `window`，这是为了让宜搭页面脚本可以在任意位置直接调用，属于预期行为。
- **零侵入接入**：不需要修改宜搭应用的元数据或后端配置，仅需在 `didMount()` 中加载一条脚本。
- **教育场景优先**：模块命名与默认行为（如 `SchoolDays`、`Infection` 中的学年学期）主要面向钉钉教育业务。
- **类型驱动**：所有公共 API 均配备中文 JSDoc，类型声明与运行时实现保持一致，便于 TypeDoc 生成可维护的文档。
- **浏览器依赖**：`Zeppelin.ViewCapturer` 等能力依赖运行时动态加载第三方库（如 `dom-to-image`），使用前请确保网络可达。

---

## 最佳实践

### 将子表单数据转为信息流卡片并推送到多个群组

```js
const tableData = usePlus().env.context.$("<table_field_id>").getValue()
await Tasks.of(
  ["<bot_secret_1>", "<bot_secret_2>", "<bot_secret_3>"].map(
    (s) => () =>
      EZPush.FeedCard.of(s).post({
        links: tableData.map((row) => ({
          title: row["<text_field_id_1>"],
          messageURL: row["<text_field_id_2>"],
          picURL: row["<picture_field_id>"][0].url,
        })),
      }),
  ),
)
```

### 生成“学年-学期-周次”联动并赋值到组件

```js
Infection.SchoolYear.of()
  .compose(Infection.Semester.of())
  .compose(Infection.Week.of())
  .infect("<text_field_id>")
  .setDefaultValue()
```

### 生成 50 条学生基本信息并填充子表单

```js
const idG = Mock.ID.of()
const telG = Mock.Tel.of()
usePlus()
  .env.context.$("<table_field_id>")
  .setValue(
    Mock.PersonalName.of()
      .want(50)
      .map((e) => ({
        "<text_field_id_1>": e,
        "<text_field_id_2>": idG.wantOne(),
        "<text_field_id_3>": telG.wantOne(),
      })),
  )
```

### 查询当前用户已提交记录数并赋值

```js
const history = await QuickMap.use().select({}, void 0, void 0, {
  originatorId: usePlus().env.context.utils.getLoginUserId(),
})
usePlus().env.context.$("<number_field_id>").setValue(history.length)
```

### 为表格添加导出 CSV 与截图能力

> 在自定义页面中可以在同一表格上多次使用 `Zeppelin`；在普通表单页面中，同一表格上最多只能使用一次 `Zeppelin`。

```js
const titleCompute = () =>
  `${usePlus().env.context.utils.getLoginUserName()}的${usePlus().env.context.$("<text_field_id>").getValue()}数据`

Zeppelin.TableExporter.of().compose("<button_field_id_1>", "<table_field_id>", titleCompute)
Zeppelin.ViewCapturer.of().compose("<button_field_id_2>", "<table_field_id>", titleCompute)
```
