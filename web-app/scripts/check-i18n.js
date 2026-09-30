import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const zhPath = path.resolve(__dirname, '../src/locales/zh-CN.json')
const enPath = path.resolve(__dirname, '../src/locales/en-US.json')

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (err) {
    console.error(`❌ [i18n-check] 读取或解析 JSON 失败: ${filePath}`, err.message)
    process.exit(1)
  }
}

function getKeys(obj, prefix = '') {
  let keys = []
  for (const k in obj) {
    const full = prefix ? `${prefix}.${k}` : k
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], full))
    } else {
      keys.push(full)
    }
  }
  return keys
}

const zh = loadJson(zhPath)
const en = loadJson(enPath)

const zhKeys = getKeys(zh)
const enKeys = getKeys(en)

const missingInEn = zhKeys.filter(k => !enKeys.includes(k))
const missingInZh = enKeys.filter(k => !zhKeys.includes(k))

console.log(`🌐 [i18n-check] 校验多语言词典: zh-CN (${zhKeys.length} 词条) | en-US (${enKeys.length} 词条)`)

let hasError = false

if (missingInEn.length > 0) {
  console.error(`\n❌ [i18n-check] 以下 ${missingInEn.length} 个词条在 en-US.json 中缺失:`)
  missingInEn.forEach(k => console.error(`  - ${k}`))
  hasError = true
}

if (missingInZh.length > 0) {
  console.error(`\n❌ [i18n-check] 以下 ${missingInZh.length} 个词条在 zh-CN.json 中缺失:`)
  missingInZh.forEach(k => console.error(`  - ${k}`))
  hasError = true
}

function checkUnescapedAt(obj, prefix = '', file = '') {
  let issues = []
  for (const k in obj) {
    const full = prefix ? `${prefix}.${k}` : k
    const val = obj[k]
    if (typeof val === 'string') {
      // 排除合法转义 {'@'} 和合法的 linked message (@:path)
      const clean = val.replace(/\{'@'\}/g, '')
      if (clean.includes('@') && !/@:[a-zA-Z0-9_\.]+/g.test(clean)) {
        issues.push(`${file} -> ${full}: 包含未转义的 '@' 字符 ("${val}")，vue-i18n 将误判为 Linked Message 导致 SyntaxError。请转义为 {'@'}`)
      }
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      issues = issues.concat(checkUnescapedAt(val, full, file))
    }
  }
  return issues
}

const atIssues = [...checkUnescapedAt(zh, '', 'zh-CN.json'), ...checkUnescapedAt(en, '', 'en-US.json')]
if (atIssues.length > 0) {
  console.error(`\n❌ [i18n-check] 检测到 ${atIssues.length} 处未转义的 '@' 字符:`)
  atIssues.forEach(i => console.error(`  - ${i}`))
  hasError = true
}

// 静态扫描：确保所有使用 useI18n 的源码文件均正确 import 并符合时序，且模板中无漏写 $t 的表达式
function checkCodeSyntax(srcDir) {
  let issues = []
  function walk(dir) {
    const list = fs.readdirSync(dir)
    for (const f of list) {
      const full = path.join(dir, f)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        walk(full)
      } else if (f.endsWith('.vue') || f.endsWith('.js')) {
        const content = fs.readFileSync(full, 'utf-8')
        
        // 1. useI18n 导入与时序
        if (content.includes('useI18n(')) {
          const hasImport = /import\s+[^;]*\buseI18n\b[^;]*from\s+['"]vue-i18n['"]/m.test(content)
          if (!hasImport) {
            issues.push(`${full}: 调用了 useI18n() 但未从 'vue-i18n' 显式 import`)
          } else {
            const callIdx = content.indexOf('useI18n(')
            const importIdx = content.indexOf('vue-i18n')
            if (callIdx < importIdx) {
              issues.push(`${full}: useI18n() 必须在 import 语句之后调用`)
            }
          }
        }

        // 2. Vue 模板中漏写 $t 的表达式：例如 {{ ('xxx'
        if (f.endsWith('.vue')) {
          const missingTMatches = content.match(/\{\{\s*\('[a-zA-Z0-9_\.]+'/g)
          if (missingTMatches) {
            issues.push(`${full}: 模板中疑似遗漏了 $t，检测到非法表达式: ${missingTMatches.join(', ')}`)
          }
        }
      }
    }
  }

  walk(srcDir)
  return issues
}

const codeIssues = checkCodeSyntax(path.resolve(__dirname, '../src'))
if (codeIssues.length > 0) {
  console.error(`\n❌ [i18n-check] 检测到 ${codeIssues.length} 处国际化语法/导入缺陷:`)
  codeIssues.forEach(i => console.error(`  - ${i}`))
  hasError = true
}

if (hasError) {
  console.error('\n🚫 [i18n-check] 检查失败: 中英文词典结构不一致或存在语法导入缺陷，请修复后再提交打包！\n')
  process.exit(1)
} else {
  console.log('✅ [i18n-check] 验证通过: 中英文词典 100% 结构对称，代码语法与导入守卫全量通过！\n')
  process.exit(0)
}
