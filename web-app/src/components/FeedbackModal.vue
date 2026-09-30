<template>
  <div v-if="visible" class="modal-backdrop" @click.self.stop="close" @click.stop>
    <div class="modal-container dark-theme glow-border feedback-modal-container" @click.stop>
      <div class="modal-header">
        <div class="header-title">
          <span class="header-icon">💬</span>
          <h3 class="header-text">{{ $t('feedback.title') }}</h3>
        </div>
        <button type="button" class="close-btn" @click.stop.prevent="close" :title="$t('feedback.cancel')">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body feedback-modal-body">
        <!-- 提交成功状态展示 -->
        <transition name="fade">
          <div v-if="isSuccess" class="success-state-wrap">
            <div class="success-check-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h4 class="success-title">{{ $t('feedback.successTitle') }}</h4>
            <p class="success-desc">{{ $t('feedback.successDesc') }}</p>
          </div>
        </transition>

        <!-- 表单录入区域 -->
        <div v-if="!isSuccess" class="feedback-form">
          <!-- 1. 分类选择器 -->
          <div class="form-item">
            <label class="form-label">{{ $t('feedback.typeLabel') }}</label>
            <div class="type-pill-group">
              <button 
                type="button"
                v-for="item in feedbackTypes" 
                :key="item.value"
                class="type-pill-btn"
                :class="{ active: form.type === item.value }"
                @click="form.type = item.value"
              >
                <span class="pill-emoji">{{ item.emoji }}</span>
                <span>{{ $t(item.labelKey) }}</span>
              </button>
            </div>
          </div>

          <!-- 2. 反馈详情文本框 -->
          <div class="form-item">
            <div class="label-with-count">
              <label class="form-label required">{{ $t('feedback.contentLabel') }}</label>
              <span class="word-count" :class="{ 'text-danger': form.content.length > 1000 }">
                {{ form.content.length }} / 1000
              </span>
            </div>
            <div class="textarea-wrap">
              <textarea
                v-model="form.content"
                class="feedback-textarea"
                rows="4"
                maxlength="1000"
                :placeholder="$t('feedback.contentPlaceholder')"
                :disabled="isSubmitting"
              ></textarea>
            </div>
          </div>

          <!-- 3. 联系方式（选填） -->
          <div class="form-item">
            <label class="form-label">
              {{ $t('feedback.contactLabel') }}
              <span class="optional-tag">({{ $t('feedback.optional') }})</span>
            </label>
            <input
              type="text"
              v-model="form.contact"
              class="feedback-input"
              maxlength="100"
              :placeholder="$t('feedback.contactPlaceholder')"
              :disabled="isSubmitting"
            />
          </div>

          <!-- 4. 附带诊断信息选项 -->
          <div class="diagnostics-section">
            <label class="diag-checkbox-label">
              <input 
                type="checkbox" 
                v-model="form.includeDiagnostics" 
                class="diag-checkbox"
                :disabled="isSubmitting"
              />
              <span class="diag-label-text">{{ $t('feedback.includeDiagnostics') }}</span>
              <button 
                type="button" 
                class="diag-toggle-btn"
                @click.prevent="showDiagDetail = !showDiagDetail"
              >
                {{ showDiagDetail ? $t('feedback.hideDiag') : $t('feedback.viewDiag') }}
              </button>
            </label>

            <!-- 诊断信息预览详情 -->
            <transition name="expand">
              <div v-if="showDiagDetail" class="diag-detail-card">
                <div class="diag-grid">
                  <div class="diag-row">
                    <span class="diag-k">{{ $t('feedback.diagVersion') }}:</span>
                    <span class="diag-v">{{ systemVersion || 'v0.4.0' }}</span>
                  </div>
                  <div class="diag-row">
                    <span class="diag-k">{{ $t('feedback.diagUser') }}:</span>
                    <span class="diag-v">{{ authStore.username || 'guest' }} ({{ authStore.role || 'user' }})</span>
                  </div>
                  <div class="diag-row">
                    <span class="diag-k">{{ $t('feedback.diagDevices') }}:</span>
                    <span class="diag-v">{{ deviceCount }}</span>
                  </div>
                  <div class="diag-row">
                    <span class="diag-k">{{ $t('feedback.diagScreen') }}:</span>
                    <span class="diag-v">{{ screenResolution }}</span>
                  </div>
                  <div class="diag-row diag-full">
                    <span class="diag-k">{{ $t('feedback.diagUA') }}:</span>
                    <span class="diag-v truncate" :title="userAgent">{{ userAgent }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- 隐藏防爬蜜罐字段 -->
          <input 
            type="text" 
            name="feedback_hp" 
            v-model="form.honeypot" 
            style="display:none;" 
            tabindex="-1" 
            autocomplete="off" 
          />

          <!-- 错误 Toast 提示 -->
          <transition name="fade">
            <div v-if="errorMessage" class="error-toast">
              <span class="error-icon">⚠️</span>
              <span class="error-msg">{{ errorMessage }}</span>
            </div>
          </transition>

          <!-- 底部操作按钮栏 -->
          <div class="modal-actions">
            <button 
              type="button" 
              class="btn-secondary" 
              @click="close"
              :disabled="isSubmitting"
            >
              {{ $t('feedback.cancel') }}
            </button>
            <button 
              type="button" 
              class="btn-primary glow-btn submit-btn" 
              @click="handleSubmit"
              :disabled="isSubmitting || form.content.trim().length < 5"
            >
              <span v-if="isSubmitting" class="spinner"></span>
              <span>{{ isSubmitting ? $t('feedback.submitting') : $t('feedback.submit') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDeviceStore } from '@/stores/devices'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  systemVersion: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const authStore = useAuthStore()
const deviceStore = useDeviceStore()

const feedbackTypes = [
  { value: 'bug', emoji: '🐞', labelKey: 'feedback.typeBug' },
  { value: 'feature', emoji: '💡', labelKey: 'feedback.typeFeature' },
  { value: 'consult', emoji: '💬', labelKey: 'feedback.typeConsult' },
  { value: 'other', emoji: '📌', labelKey: 'feedback.typeOther' }
]

const form = reactive({
  type: 'bug',
  content: '',
  contact: '',
  includeDiagnostics: true,
  honeypot: ''
})

const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const showDiagDetail = ref(false)

const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const screenResolution = typeof window !== 'undefined' ? `${window.screen?.width || 0}x${window.screen?.height || 0}` : ''
const deviceCount = computed(() => {
  return deviceStore.devices ? deviceStore.devices.length : 0
})

watch(() => props.visible, (val) => {
  if (val) {
    isSuccess.value = false
    errorMessage.value = ''
    showDiagDetail.value = false
  }
})

function close() {
  if (isSubmitting.value) return
  emit('close')
}

async function handleSubmit() {
  const content = form.content.trim()
  if (!content || content.length < 5) {
    errorMessage.value = t('feedback.errTooShort')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  let meta = null
  if (form.includeDiagnostics) {
    meta = {
      version: props.systemVersion || 'v0.4.0',
      username: authStore.username || '',
      role: authStore.role || 'user',
      activeDevices: deviceCount.value,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent,
      screen: screenResolution,
      language: typeof navigator !== 'undefined' ? navigator.language : ''
    }
  }

  const payload = {
    type: form.type,
    content,
    contact: form.contact.trim(),
    meta,
    honeypot: form.honeypot
  }

  try {
    const res = await fetch('https://license.webrtc-phone.com/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const json = await res.json().catch(() => ({}))

    if (res.ok && json.success) {
      isSuccess.value = true
      form.content = ''
      form.contact = ''
      form.honeypot = ''
      setTimeout(() => {
        close()
      }, 1800)
    } else {
      errorMessage.value = json.message || t('feedback.errFailed')
    }
  } catch (err) {
    console.error('Feedback submit failed:', err)
    errorMessage.value = t('feedback.errNetwork')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.feedback-modal-container {
  max-width: 520px;
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

.feedback-modal-body {
  padding: 18px 20px 20px;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #c9d1d9;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-label.required::after {
  content: "*";
  color: #f85149;
  margin-left: 2px;
}

.optional-tag {
  font-size: 11px;
  color: #8b949e;
  font-weight: normal;
}

.label-with-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-count {
  font-size: 11px;
  color: #8b949e;
}

.text-danger {
  color: #f85149;
}

/* 分类胶囊按钮 */
.type-pill-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.type-pill-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #8b949e;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.type-pill-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #c9d1d9;
  border-color: rgba(255, 255, 255, 0.16);
}

.type-pill-btn.active {
  background: rgba(99, 102, 241, 0.18);
  border-color: #6366f1;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
  font-weight: 500;
}

.pill-emoji {
  font-size: 14px;
}

/* 输入框与文本域 */
.feedback-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 10px 12px;
  color: #c9d1d9;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  min-height: 90px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.feedback-textarea:focus,
.feedback-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.feedback-input {
  width: 100%;
  box-sizing: border-box;
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px 12px;
  color: #c9d1d9;
  font-size: 13px;
  transition: border-color 0.2s;
}

/* 诊断信息区域 */
.diagnostics-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 9px 12px;
}

.diag-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #8b949e;
  user-select: none;
}

.diag-checkbox {
  accent-color: #6366f1;
  cursor: pointer;
}

.diag-label-text {
  flex: 1;
}

.diag-toggle-btn {
  background: transparent;
  border: none;
  color: #58a6ff;
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.diag-detail-card {
  background: #0d1117;
  border-radius: 6px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.diag-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
  font-size: 11px;
}

.diag-row {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.diag-full {
  grid-column: span 2;
}

.diag-k {
  color: #8b949e;
  flex-shrink: 0;
}

.diag-v {
  color: #c9d1d9;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 错误 Toast */
.error-toast {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(248, 81, 73, 0.15);
  border: 1px solid rgba(248, 81, 73, 0.4);
  color: #ff7b72;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
}

/* 按钮操作栏 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.btn-secondary {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.btn-primary {
  padding: 8px 20px;
  background: #6366f1;
  border: 1px solid #4f46e5;
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 旋转 Loading */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 提交成功界面 */
.success-state-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 10px;
  text-align: center;
  gap: 12px;
}

.success-check-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(35, 134, 54, 0.2);
  border: 2px solid #238636;
  color: #3fb950;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.success-check-circle svg {
  width: 28px;
  height: 28px;
}

@keyframes popIn {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  margin: 0;
  font-size: 17px;
  color: #f0f6fc;
  font-weight: 600;
}

.success-desc {
  margin: 0;
  font-size: 13px;
  color: #8b949e;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .type-pill-group {
    grid-template-columns: repeat(2, 1fr);
  }
  .diag-grid {
    grid-template-columns: 1fr;
  }
  .diag-full {
    grid-column: span 1;
  }
}
</style>
