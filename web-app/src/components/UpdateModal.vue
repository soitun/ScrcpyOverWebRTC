<template>
  <div v-if="visible" class="modal-backdrop" @click.self.stop="close" @click.stop>
    <div class="modal-container dark-theme glow-border update-modal-container" @click.stop>
      <div class="modal-header">
        <div class="header-title">
          <span class="header-icon">🚀</span>
          <h3 class="header-text">{{ updateInfo && updateInfo.has_update ? (updateInfo.title || $t('update.title')) : $t('update.upToDateTitle') }}</h3>
        </div>
        <button type="button" class="close-btn" @click.stop.prevent="close" :title="$t('update.close')">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body update-modal-body">
        <!-- 强制更新警告横幅 -->
        <div v-if="updateInfo && updateInfo.force" class="force-notice-banner">
          <span class="notice-icon">⚠️</span>
          <span class="notice-text">{{ $t('update.forceUpdateNotice') }}</span>
        </div>

        <!-- 版本对比卡片 -->
        <div class="version-compare-card">
          <div class="version-pill current">
            <span class="pill-label">{{ $t('update.currentVersion') }}</span>
            <span class="pill-value">{{ updateInfo?.current_version || currentVersion || 'v0.3.9' }}</span>
          </div>
          <div class="version-arrow">➜</div>
          <div class="version-pill latest" :class="{ 'has-new': updateInfo?.has_update }">
            <span class="pill-label">{{ $t('update.latestVersion') }}</span>
            <div class="latest-val-wrap">
              <span class="pill-value font-bold">{{ updateInfo?.latest_version || currentVersion || 'v0.4.0' }}</span>
              <span v-if="updateInfo?.has_update" class="rec-badge">{{ $t('update.recommended') }}</span>
            </div>
          </div>
        </div>

        <!-- 发布时间元信息 -->
        <div v-if="updateInfo?.published_at" class="release-meta-row">
          <span class="meta-label">📅 {{ $t('update.publishedAt') }}:</span>
          <span class="meta-value">{{ updateInfo.published_at }}</span>
        </div>

        <!-- 更新日志卡片 -->
        <div class="changelog-section">
          <div class="changelog-header">
            <span>📋 {{ $t('update.changelog') }}</span>
          </div>
          <div class="changelog-content">
            <div v-if="formattedChangelog.length > 0" class="changelog-list">
              <div 
                v-for="(item, idx) in formattedChangelog" 
                :key="idx" 
                class="changelog-item"
              >
                <span class="bullet">•</span>
                <span class="item-text">{{ item }}</span>
              </div>
            </div>
            <div v-else class="changelog-empty">
              <span>{{ updateInfo?.changelog || '暂无更新日志明细' }}</span>
            </div>
          </div>
        </div>

        <!-- 复制成功 Toast -->
        <transition name="fade">
          <div v-if="copiedToast" class="update-toast">
            ✓ {{ $t('update.linkCopied') }}
          </div>
        </transition>

        <!-- 底部操作按钮栏 -->
        <div class="update-action-bar">
          <div class="action-left">
            <button 
              type="button" 
              class="btn-ghost text-muted" 
              @click="dismissFor7Days"
              :title="$t('update.dismiss7Days')"
            >
              {{ $t('update.dismiss7Days') }}
            </button>
          </div>
          <div class="action-right">
            <button 
              v-if="updateInfo?.download_url" 
              type="button" 
              class="btn-secondary" 
              @click="copyDownloadUrl"
            >
              📋 {{ $t('update.copyLinkBtn') }}
            </button>
            <button 
              v-if="updateInfo?.download_url" 
              type="button" 
              class="btn-primary glow-btn" 
              @click="openDownloadUrl"
            >
              📥 {{ $t('update.downloadBtn') }}
            </button>
            <button 
              v-else 
              type="button" 
              class="btn-primary" 
              @click="close"
            >
              {{ $t('update.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: { type: Boolean, default: false },
  updateInfo: { type: Object, default: () => null },
  currentVersion: { type: String, default: '' }
})

const emit = defineEmits(['close', 'dismiss'])

const copiedToast = ref(false)

const formattedChangelog = computed(() => {
  if (!props.updateInfo || !props.updateInfo.changelog) return []
  return props.updateInfo.changelog
    .split('\n')
    .map(line => line.trim())
    .filter(line => !!line)
    .map(line => line.replace(/^[-*•]\s*/, ''))
})

function close() {
  emit('close')
}

function dismissFor7Days() {
  try {
    const ver = props.updateInfo?.latest_version || 'unknown'
    const expireTime = Date.now() + 7 * 24 * 3600 * 1000
    localStorage.setItem('cloudphone_dismissed_update', JSON.stringify({
      version: ver,
      until: expireTime
    }))
  } catch (e) {
    console.warn('Failed to save dismissed update preference:', e)
  }
  emit('dismiss')
  close()
}

function openDownloadUrl() {
  if (!props.updateInfo?.download_url) return
  window.open(props.updateInfo.download_url, '_blank')
}

async function copyDownloadUrl() {
  if (!props.updateInfo?.download_url) return
  try {
    await navigator.clipboard.writeText(props.updateInfo.download_url)
    copiedToast.value = true
    setTimeout(() => {
      copiedToast.value = false
    }, 2500)
  } catch (err) {
    const input = document.createElement('input')
    input.value = props.updateInfo.download_url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copiedToast.value = true
    setTimeout(() => {
      copiedToast.value = false
    }, 2500)
  }
}
</script>

<style scoped>
.update-modal-container {
  max-width: 540px;
  width: 92vw;
  background: #161b22;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.2);
  overflow: hidden;
  animation: modalScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 模态框顶部栏（严格横向单行对齐，彻底根治分行问题） */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  user-select: none;
}

.header-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 20px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text {
  margin: 0;
  padding: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f0f6fc;
  line-height: 1.2;
  white-space: nowrap;
}

/* 舒适的大尺寸关闭按钮（优化按键太小问题，大热区+精细反馈） */
.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  color: #8b949e;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
  margin: 0;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}

.update-modal-body {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 强制更新横幅 */
.force-notice-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
}

/* 版本对比胶囊 */
.version-compare-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 18px;
}

.version-pill {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pill-label {
  font-size: 11px;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pill-value {
  font-size: 15px;
  color: #c9d1d9;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-bold {
  font-weight: 700;
}

.version-arrow {
  color: #58a6ff;
  font-size: 16px;
  font-weight: bold;
}

.version-pill.latest.has-new .pill-value {
  color: #58a6ff;
}

.latest-val-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rec-badge {
  background: rgba(35, 134, 54, 0.3);
  color: #3fb950;
  border: 1px solid rgba(46, 160, 67, 0.4);
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 6px;
  font-weight: 500;
}

/* 元信息 */
.release-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8b949e;
}

/* 更新日志 */
.changelog-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.changelog-header {
  font-size: 13px;
  font-weight: 600;
  color: #e6edf3;
}

.changelog-content {
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 14px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
  color: #c9d1d9;
}

.changelog-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.changelog-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.5;
}

.changelog-item .bullet {
  color: #58a6ff;
  font-weight: bold;
}

.changelog-item .item-text {
  word-break: break-word;
}

.changelog-empty {
  color: #8b949e;
  font-size: 13px;
  text-align: center;
  padding: 12px 0;
}

/* Toast */
.update-toast {
  background: rgba(46, 160, 67, 0.2);
  border: 1px solid rgba(46, 160, 67, 0.5);
  color: #3fb950;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
}

/* 按钮栏 */
.update-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  gap: 12px;
  flex-wrap: wrap;
}

.action-left {
  display: flex;
  align-items: center;
}

.btn-ghost {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 12px;
  cursor: pointer;
  padding: 6px 4px;
  text-decoration: underline;
  transition: color 0.15s ease;
}

.btn-ghost:hover {
  color: #c9d1d9;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.btn-secondary {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-secondary:hover {
  background: #30363d;
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-primary {
  background: #238636;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 7px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.btn-primary:hover {
  background: #2ea043;
}

.btn-primary:active {
  transform: scale(0.98);
}

.glow-btn {
  box-shadow: 0 0 14px rgba(46, 160, 67, 0.4);
}
</style>
