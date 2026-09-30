# CloudPhone WebRTC Web App (`web-app`)

基于 Vue 3 + Pinia + WebRTC / WebSocket 的云手机前端管理控制台与直控大盘。

---

## ⚠️ 核心开发规范与国际化强约束条件 (I18n Guidelines)

> [!IMPORTANT]
> **本子项目已实现全链路深度中英文双语适配。后续进行任何功能开发、页面优化、组件重构或文案调整时，必须严格遵守以下约束条件：**

### 1. 严格禁止模板与脚本硬编码中文
* **Vue 模板**：所有用户可见文本、按钮名称、输入框占位符（`placeholder`）、工具提示（`title`）、模态弹窗说明等，**严禁直接写中文**，必须使用 `$t('namespace.key')` 调用多语言词典。
* **Script 业务逻辑**：所有的 Toast 提示、操作失败回退、`alert` / `confirm` 弹窗、终端与调试日志（如 `term.writeln`）、时间与时长格式化输出，必须通过 `t('namespace.key')` 国际化函数输出。

### 2. 双语词典必须 100% 结构对称更新
* 凡在 [`src/locales/zh-CN.json`](./src/locales/zh-CN.json) 新增、修改或删除键值，**必须同步在 [`src/locales/en-US.json`](./src/locales/en-US.json) 中添加对应的高质量英文翻译**。
* 严禁出现“只加中文未加英文”或键名不对称的情况。
* 词典内应按功能模块维持清晰的一级命名空间划分（如 `common`, `nav`, `topBar`, `login`, `deviceCard`, `deviceClient`, `console`, `settings`, `dashboard`, `files`, `users`, `deploy`, `license`, `share`, `devicesAdmin`, `keymap`, `tags`, `multi`, `advanced`, `audit` 等）。

### 3. 自动化校验与构建阻断 (CI / Build Gate)
* 本项目已在 `package.json` 中配置了多语言对称性自动化检查脚本：
  ```bash
  npm run check:i18n
  ```
* 每次执行 `npm run build` 或 `npm run build:demo` 时，均会**自动前置触发 `check:i18n`**。若检测到任何键在 `zh-CN.json` 或 `en-US.json` 中单侧缺失，打包将直接失败并抛出具体缺失的键名列表，阻断异常代码合入。

### 4. 英文长字符弹性防挤压规范
* 英文单词长度普遍长于中文短语（如“设备管理” 4 字符 vs `Device Management` 17 字符，“快捷文本” vs `Quick Text Broadcast`）。
* 在编写 CSS 布局时：
  * **按键与标签**：避免使用死宽（如 `width: 80px`），应使用弹性宽度、`min-width` 并搭配 `white-space: nowrap`、`flex-shrink: 0`。
  * **文本超出**：关键名称与 ID 须配置 `text-overflow: ellipsis; overflow: hidden;`，并补充 `:title` 属性以便悬停查阅全称。
  * **操作工具栏**：支持 `flex-wrap: wrap` 或自适应滚动，杜绝因英文文本过长将后方关键操作按键挤出屏幕或遮挡。

---

## 🛠️ 本地常用开发命令

```bash
# 启动本地开发服务 (默认直连模式)
npm run dev

# 启动纯前端演示模拟模式
npm run dev:demo

# 执行多语言对称性核验
npm run check:i18n

# 生产环境打包 (包含 i18n 强制校验)
npm run build

# 演示环境打包
npm run build:demo
```
