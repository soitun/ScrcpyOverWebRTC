<template>
  <transition name="fade">
    <div v-if="visible" class="license-panel-overlay" @click="$emit('close')">
      <div class="license-panel-card" @click.stop>
        <button class="panel-close-btn" @click="$emit('close')" :title="$t('common.close') || '关闭'">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="panel-title">{{ $t('license.licenseManagement') }}</div>

        <!-- 当前计划徽标 -->
        <div class="plan-badge" :class="planBadgeClass">{{ planBadgeText }}</div>

        <div class="panel-body">
          <!-- 用量进度条（普通用户拿不到设备上限等详细字段时整体隐藏） -->
          <template v-if="deviceStore.licenseDetailsLoaded">
            <div class="usage-row">
              <span class="status-label">{{ $t('license.deviceUsage') }}</span>
              <span class="status-value highlight">{{ currentDevices }} / {{ deviceStore.licenseMaxDevices }} {{ $t('license.units') }}</span>
            </div>
            <div class="usage-bar-track">
              <div class="usage-bar-fill" :class="usageBarClass" :style="{ width: usagePercent + '%' }"></div>
            </div>
          </template>

          <!-- 授权状态明细（详细字段缺失时整块隐藏） -->
          <div class="license-status-display" v-if="deviceStore.licenseDetailsLoaded">
            <div class="status-item" v-if="deviceStore.licenseActivated">
              <span class="status-label">{{ $t('license.remainingValidity') }}</span>
              <span class="status-value highlight">{{ deviceStore.licenseDaysRemaining }} {{ $t('license.daysUnits') }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ $t('license.maxDeviceLimit') }}</span>
              <span class="status-value highlight">{{ deviceStore.licenseMaxDevices }} {{ $t('license.units') }}</span>
            </div>
            <div class="status-item" v-if="deviceStore.licenseExpiresAt">
              <span class="status-label">{{ $t('license.expireTime') }}</span>
              <span class="status-value">{{ deviceStore.licenseExpiresAt }}</span>
            </div>
          </div>

          <!-- 限时特惠说明 -->
          <div v-if="!deviceStore.licenseActivated && deviceStore.licensePromo" class="promo-tip">
            {{ $t('license.promoNotice', { date: deviceStore.licenseExpiresAt, max: deviceStore.licenseMaxDevices, post: deviceStore.licensePostPromoMaxDevices }) }}
          </div>

          <!-- 机器码 + 一键复制（仅详细粒度响应中才有，缺失时隐藏） -->
          <div class="license-info-row" v-if="deviceStore.globalMachineID">
            <span class="info-label">{{ $t('license.serverMachineId') }}</span>
            <div class="machine-id-container">
              <code>{{ deviceStore.globalMachineID }}</code>
              <button class="copy-btn" @click="copyMachineID" :disabled="!deviceStore.globalMachineID">
                {{ copySuccess ? $t('common.copied') : $t('common.copy') }}
              </button>
            </div>
          </div>

          <!-- 激活码输入 -->
          <div class="license-input-group">
            <label for="license-panel-input">{{ $t('license.licenseCodeLabel') }}</label>
            <textarea
              id="license-panel-input"
              v-model="activationKey"
              :placeholder="$t('license.codePlaceholder')"
              rows="3"
            ></textarea>
            <button class="activate-btn" :disabled="isActivating || !activationKey.trim()" @click="submitActivation">
              {{ isActivating ? $t('license.activating') : $t('license.submitActivate') }}
            </button>
          </div>
          <div v-if="activationError" class="activation-error-msg">
            ❌ {{ activationError }}
          </div>

          <!-- 购买激活码入口 -->
          <div class="purchase-row">
            <span class="purchase-tip">{{ $t('license.noCodeTip') }}</span>
            <a :href="purchaseURL" target="_blank" rel="noopener" class="purchase-link">{{ $t('license.buyLicenseLink') }}</a>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDeviceStore } from '@/stores/devices'

const { t } = useI18n()

const props = defineProps({
  visible: { type: Boolean, default: false }
})
defineEmits(['close'])

const deviceStore = useDeviceStore()

// 激活码购买链接（通过官网 webrtc-phone.com 统一中转与维护，防止闲鱼短链过期失效）
const purchaseURL = 'https://webrtc-phone.com/buy.html'

const activationKey = ref('')
const isActivating = ref(false)
const activationError = ref(null)
const copySuccess = ref(false)

// 打开面板时刷新一次授权状态
watch(() => props.visible, (val) => {
  if (val) {
    deviceStore.fetchLicenseStatus()
    activationError.value = null
  }
})

// 当前计划徽标文案与样式（支持国际化）
const planBadgeText = computed(() => {
  if (deviceStore.licenseActivated) {
    const customer = deviceStore.licenseCustomer || t('license.badgeOfficial')
    return t('license.badgeLicensed', { customer })
  }
  if (deviceStore.licensePromo) {
    return t('license.badgePromo')
  }
  return t('license.badgeFree')
})
const planBadgeClass = computed(() => {
  if (deviceStore.licenseActivated) return 'badge-activated'
  if (deviceStore.licensePromo) return 'badge-promo'
  return 'badge-free'
})

// 用量：优先取在线设备数，与列表页徽标口径一致
const currentDevices = computed(() => deviceStore.onlineDevices.length || deviceStore.licenseCurrentDevices)
const usagePercent = computed(() => {
  const max = deviceStore.licenseMaxDevices || 1
  return Math.min(100, Math.round((currentDevices.value / max) * 100))
})
const usageBarClass = computed(() => {
  if (usagePercent.value >= 100) return 'bar-danger'
  if (usagePercent.value >= 80) return 'bar-warn'
  return ''
})

function copyMachineID() {
  if (!deviceStore.globalMachineID) return
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(deviceStore.globalMachineID)
      .then(() => {
        copySuccess.value = true
        setTimeout(() => { copySuccess.value = false }, 2000)
      })
      .catch(err => {
        console.error('Failed to copy machine ID:', err)
      })
  }
}

async function submitActivation() {
  if (!activationKey.value.trim()) return
  isActivating.value = true
  activationError.value = null

  const res = await deviceStore.activateLicense(activationKey.value.trim())
  isActivating.value = false
  if (res.success) {
    activationKey.value = ''
    await deviceStore.fetchLicenseStatus()
    alert(t('license.activatedSuccess'))
  } else {
    activationError.value = res.error
  }
}
</script>

<style scoped>
.license-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.license-panel-card {
  background: #161b22;
  border: 1px solid var(--border);
  border-radius: 12px;
  width: min(460px, 92vw);
  max-height: 90vh;
  padding: 24px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.panel-close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #8b949e;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
}

.panel-close-btn:hover {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.35);
  transform: scale(1.05);
}

.panel-close-btn:active {
  transform: scale(0.95);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.plan-badge {
  display: inline-flex;
  align-self: flex-start;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 14px;
  border: 1px solid transparent;
}

.plan-badge.badge-activated {
  color: #3fb950;
  background: rgba(63, 185, 80, 0.1);
  border-color: rgba(63, 185, 80, 0.35);
}

.plan-badge.badge-promo {
  color: #d29922;
  background: rgba(210, 153, 34, 0.1);
  border-color: rgba(210, 153, 34, 0.4);
}

.plan-badge.badge-free {
  color: #8b949e;
  background: rgba(139, 148, 158, 0.1);
  border-color: #30363d;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.panel-body::-webkit-scrollbar {
  width: 4px;
}
.panel-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.usage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 6px;
}

.usage-bar-track {
  width: 100%;
  height: 8px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;
}

.usage-bar-fill {
  height: 100%;
  background: #58a6ff;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.usage-bar-fill.bar-warn {
  background: #d29922;
}

.usage-bar-fill.bar-danger {
  background: #f85149;
}

.license-status-display {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.status-label {
  color: #8b949e;
}

.status-value {
  color: #c9d1d9;
  font-weight: 500;
}

.status-value.highlight {
  color: #58a6ff;
}

.promo-tip {
  font-size: 12px;
  color: #d29922;
  background: rgba(210, 153, 34, 0.08);
  border: 1px solid rgba(210, 153, 34, 0.25);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.license-info-row {
  margin-bottom: 14px;
}

.info-label {
  display: block;
  font-size: 13px;
  color: #8b949e;
  margin-bottom: 6px;
}

.machine-id-container {
  display: flex;
  gap: 8px;
}

.machine-id-container code {
  flex: 1;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 12px;
  color: #c9d1d9;
  display: flex;
  align-items: center;
  overflow-x: auto;
}

.copy-btn {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  cursor: pointer;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #30363d;
  border-color: #8b949e;
}

.license-input-group {
  margin-bottom: 12px;
}

.license-input-group label {
  display: block;
  font-size: 13px;
  color: #8b949e;
  margin-bottom: 6px;
}

.license-input-group textarea {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-family: monospace;
  font-size: 12px;
  padding: 10px;
  box-sizing: border-box;
  resize: none;
  outline: none;
  margin-bottom: 10px;
}

.license-input-group textarea:focus {
  border-color: var(--accent);
}

.activate-btn {
  width: 100%;
  background: #238636;
  border: 1px solid #2ea44f;
  border-radius: 6px;
  color: #ffffff;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.activate-btn:hover:not(:disabled) {
  background: #2ea44f;
}

.activate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.activation-error-msg {
  color: #f85149;
  background: rgba(248, 81, 73, 0.05);
  border: 1px solid rgba(248, 81, 73, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 4px;
  text-align: center;
}

.purchase-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
  font-size: 12px;
}

.purchase-tip {
  color: #8b949e;
}

.purchase-link {
  color: #d29922;
  text-decoration: none;
  font-weight: 500;
}

.purchase-link:hover {
  text-decoration: underline;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
