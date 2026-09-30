import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import enUS from './en-US.json'

export const SUPPORTED_LOCALES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
]

const STORAGE_KEY = 'cloudphone_locale'

/**
 * 确定初始语言环境：
 * 1. 优先使用用户已选择并保存在 localStorage 的值
 * 2. 否则检测浏览器首选语言 (若为中文环境则设为 zh-CN，否则推荐 en-US)
 */
export function getInitialLocale() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
    return saved
  }
  
  if (typeof navigator !== 'undefined' && navigator.language) {
    const navLang = navigator.language.toLowerCase()
    if (navLang.startsWith('zh')) {
      return 'zh-CN'
    }
    return 'en-US'
  }
  
  return 'zh-CN'
}

export const i18n = createI18n({
  legacy: false, // 启用 Vue 3 Composition API 模式
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

/**
 * 切换系统语言并保存持久化状态
 * @param {string} lang 语言代码 ('zh-CN' | 'en-US')
 */
export function setLanguage(lang) {
  if (!SUPPORTED_LOCALES.some(l => l.code === lang)) {
    console.warn(`[i18n] Unsupported locale: ${lang}`)
    return
  }
  i18n.global.locale.value = lang
  localStorage.setItem(STORAGE_KEY, lang)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang
  }
}

/**
 * 获取当前激活的语言
 */
export function getCurrentLanguage() {
  return i18n.global.locale.value
}

export default i18n
