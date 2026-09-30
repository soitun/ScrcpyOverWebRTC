# Contributing Translations / 多语言贡献指南

Welcome to the **ScrcpyOverWebRTC / CloudPhone** translation project! We love community contributions and want to make it as easy as possible for developers worldwide to use and enjoy this platform in their native languages.

欢迎参与 **ScrcpyOverWebRTC（穿云投屏）** 国际化翻译项目！我们热烈欢迎社区开发者贡献更多国家和地区的语言包。

---

## 🚀 How to Add a New Language in 4 Steps / 4 步快速添加新语言

### Step 1: Copy the English Template / 复制英文模板
Locate the `src/locales/` directory in `webrtc-operator/web-app`. Copy `en-US.json` and name it with your target IETF language tag (e.g., `ja-JP.json`, `es-ES.json`, `fr-FR.json`, `de-DE.json`, `ko-KR.json`, `ru-RU.json`).

在 `webrtc-operator/web-app/src/locales/` 目录下，复制 `en-US.json`，并重命名为标准语言代码（例如 `ja-JP.json`、`es-ES.json`、`fr-FR.json` 等）。

```bash
cd webrtc-operator/web-app/src/locales
cp en-US.json ja-JP.json
```

---

### Step 2: Translate the Values / 翻译词条内容
Open your new JSON file (e.g., `ja-JP.json`). Translate the **values** into your language.

⚠️ **Important Rules / 注意事项**:
1. **DO NOT change the JSON keys** or modify nesting structure. (保持 JSON 的键名与层级不变)
2. **Preserve placeholders** such as `{count}`, `{name}`, etc. (保留 `{count}`、`{name}` 等插值变量占位符)
3. Keep emoji and icons as they are unless culturally inappropriate. (保留现有图标与 Emoji)

Example / 示例:
```json
{
  "common": {
    "ok": "OK",         // -> "確定"
    "cancel": "Cancel"  // -> "キャンセル"
  },
  "topBar": {
    "onlineDevices": "{count} Online" // -> "{count} 台オンライン"
  }
}
```

---

### Step 3: Register in `src/locales/index.js` / 在入口中注册

Open `src/locales/index.js` and register your new locale:

打开 `src/locales/index.js`，引入您的语言包并追加至支持列表中：

```javascript
import zhCN from './zh-CN.json'
import enUS from './en-US.json'
import jaJP from './ja-JP.json' // 1. Import your file / 导入新文件

export const SUPPORTED_LOCALES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' } // 2. Add to supported list / 加入列表
]

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP // 3. Register messages / 注册词条映射
  }
})
```

---

### Step 4: Test & Submit a Pull Request / 本地测试并提交 PR

1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Open the browser and switch to your newly added language from the top navigation bar or settings dialog.
3. Check the UI to make sure texts fit well without overflowing.
4. Commit your changes and submit a Pull Request to [ScrcpyOverWebRTC GitHub](https://github.com/hqw700/ScrcpyOverWebRTC).

Thank you for helping make ScrcpyOverWebRTC accessible to everyone around the globe! 🌍❤️
