<template>
  <Teleport to="body">
    <div class="settings-modal">
      <div class="modal-content animate-fade-in">
        <div class="modal-header">
          <div class="header-title">
            <span class="header-icon">⚙️</span>
            <h3>{{ $t('settings.title') }}</h3>
          </div>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <!-- 标签页卡片导航 -->
        <div class="modal-tabs">
          <button :class="['tab-btn', { active: activeTab === 'video' }]" @click="activeTab = 'video'">
            <svg class="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            <span class="tab-label">{{ $t('settings.tabs.video') }}</span>
          </button>
          <button v-if="showPreviewTab" :class="['tab-btn', { active: activeTab === 'preview' }]" @click="activeTab = 'preview'">
            <svg class="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>
            <span class="tab-label">{{ $t('settings.tabs.preview') }}</span>
          </button>
          <button :class="['tab-btn', { active: activeTab === 'audio' }]" @click="activeTab = 'audio'">
            <svg class="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span class="tab-label">{{ $t('settings.tabs.audio') }}</span>
          </button>
          <button :class="['tab-btn', { active: activeTab === 'general' }]" @click="activeTab = 'general'">
            <svg class="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span class="tab-label">{{ $t('settings.tabs.general') }}</span>
          </button>
          <button :class="['tab-btn', { active: activeTab === 'advanced' }]" @click="activeTab = 'advanced'">
            <svg class="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span class="tab-label">{{ $t('settings.tabs.advanced') }}</span>
          </button>
        </div>

        <div class="modal-body custom-scrollbar">
          <!-- 🎥 视频面板 -->
          <div v-if="activeTab === 'video'" class="tab-pane">
            <div class="form-group">
              <label>{{ $t('settings.maxSize') }} <span v-if="isLocked('size')" class="lock-tag">{{ $t('settings.lockedBySharer') }}</span></label>
              <input type="number" v-model.number="localSettings.size" min="0" step="100" :disabled="isLocked('size')" />
              <small class="hint">{{ $t('settings.maxSizeHint') }}</small>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.maxFps') }} <span v-if="isLocked('fps')" class="lock-tag">{{ $t('settings.lockedBySharer') }}</span></label>
              <input type="number" v-model.number="localSettings.fps" min="0" max="120" :disabled="isLocked('fps')" />
              <small class="hint">{{ $t('settings.maxFpsHint') }}</small>
            </div>

            <div class="form-group form-group-row">
              <div class="group-info">
                <label>{{ $t('settings.bwe') }} <span v-if="isLocked('bitrate')" class="lock-tag">{{ $t('settings.lockedBySharer') }}</span></label>
                <small class="hint">{{ $t('settings.bweHint') }}</small>
              </div>
              <div class="toggle-switch">
                <input type="checkbox" id="bwe-toggle" v-model="localSettings.bwe" :disabled="isLocked('bitrate')" />
                <label for="bwe-toggle"></label>
              </div>
            </div>

            <!-- BWE 开启：码率阈值设定 (WebRTC 动态自适应) -->
            <div v-if="localSettings.bwe" class="sub-section">
              <div class="form-group">
                <label>{{ $t('settings.minBitrate') }}</label>
                <input type="number" v-model.number="localSettings.minBitrate" min="1" step="1" :disabled="isLocked('bitrate')" />
                <small class="hint">{{ $t('settings.minBitrateHint') }}</small>
              </div>
              <div class="form-group">
                <label>{{ $t('settings.maxBitrate') }}</label>
                <input type="number" v-model.number="localSettings.maxBitrate" min="1" step="1" :disabled="isLocked('bitrate')" />
                <small class="hint">{{ $t('settings.maxBitrateHint') }}</small>
              </div>
            </div>

            <!-- 固定画面码率：始终展示，明确标注在 WebSocket 投屏模式下生效（及 WebRTC 关闭 BWE 时生效） -->
            <div class="form-group">
              <label>{{ $t('settings.bitrate') }} <span v-if="isLocked('bitrate')" class="lock-tag">{{ $t('settings.lockedBySharer') }}</span></label>
              <input type="number" v-model.number="localSettings.bitrate" min="0.1" step="0.1" :disabled="isLocked('bitrate')" />
              <small class="hint" v-html="$t('settings.bitrateHint')"></small>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.renderEngine') }}</label>
              <select v-model="localSettings.renderEngine" class="select-input">
                <option value="video">{{ $t('settings.renderEngineVideo') }}</option>
                <option value="webcodecs">{{ $t('settings.renderEngineWebCodecs') }}</option>
              </select>
              <small class="hint">{{ $t('settings.renderEngineHint') }}</small>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.videoCodecOptions') }}</label>
              <input type="text" v-model="localSettings.videoCodecOptions" :placeholder="$t('settings.videoCodecOptionsPlaceholder')" />
              <small class="hint">{{ $t('settings.videoCodecOptionsHint') }}</small>
            </div>
          </div>

          <!-- 📊 大盘预览面板（普通用户与分享访客隐藏：预览与缩略图频率都影响虚机负载） -->
          <div v-if="activeTab === 'preview' && showPreviewTab" class="tab-pane">
            <div class="form-group-divider">{{ $t('settings.highFreqSection') }}</div>

            <div class="form-group">
              <label>{{ $t('settings.previewMaxSize') }}</label>
              <input type="number" v-model.number="localSettings.previewSize" min="0" step="10" />
              <small class="hint">{{ $t('settings.previewMaxSizeHint') }}</small>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.previewMaxFps') }}</label>
              <input type="number" v-model.number="localSettings.previewFps" min="1" max="60" />
              <small class="hint">{{ $t('settings.previewMaxFpsHint') }}</small>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.previewDecoder') }}</label>
              <select v-model="localSettings.previewDecoder" class="select-input">
                <option value="wasm">{{ $t('settings.previewDecoderWasm') }}</option>
                <option value="webcodecs">{{ $t('settings.previewDecoderWebCodecs') }}</option>
              </select>
              <small class="hint">{{ $t('settings.previewDecoderHint') }}</small>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.previewBitrate') }}</label>
              <input type="number" v-model.number="localSettings.previewBitrate" min="0.1" step="0.1" />
              <small class="hint">{{ $t('settings.previewBitrateHint') }}</small>
            </div>

            <div class="form-group-divider">{{ $t('settings.standbyThumbnailSection') }}</div>

            <div class="form-group">
              <label>{{ $t('settings.thumbnailInterval') }}</label>
              <input type="number" v-model.number="localSettings.snapshotInterval" min="-1" step="1" />
              <small class="hint">{{ $t('settings.thumbnailIntervalHint') }}</small>
            </div>
          </div>

          <!-- 🔊 音频面板 -->
          <div v-if="activeTab === 'audio'" class="tab-pane">
            <div class="form-group form-group-row">
              <div class="group-info">
                <label>{{ $t('settings.audioOpus') }} <span v-if="isLocked('audio')" class="lock-tag">{{ $t('settings.lockedBySharer') }}</span></label>
                <small class="hint">{{ $t('settings.audioOpusHint') }}</small>
              </div>
              <div class="toggle-switch">
                <input type="checkbox" id="audio-toggle" v-model="localSettings.audio" :disabled="isLocked('audio')" />
                <label for="audio-toggle"></label>
              </div>
            </div>

            <div v-if="localSettings.audio" class="sub-section animate-slide-down">
              <div class="form-group">
                <label>{{ $t('settings.audioSource') }}</label>
                <select v-model="localSettings.audioSource" class="select-input" :disabled="isLocked('audio')">
                  <option value="output">{{ $t('settings.audioSourceOutput') }}</option>
                  <option value="playback">{{ $t('settings.audioSourcePlayback') }}</option>
                  <option value="mic">{{ $t('settings.audioSourceMic') }}</option>
                </select>
                <small class="hint" v-if="localSettings.audioSource === 'mic'">{{ $t('settings.audioSourceHintMic') }}</small>
                <small class="hint" v-else-if="localSettings.audioSource === 'playback'">{{ $t('settings.audioSourceHintPlayback') }}</small>
                <small class="hint" v-else>{{ $t('settings.audioSourceHintOutput') }}</small>
              </div>

              <div class="form-group form-group-row" v-if="localSettings.audioSource === 'playback'">
                <div class="group-info">
                  <label>{{ $t('settings.audioPreserveSpeaker') }}</label>
                  <small class="hint">{{ $t('settings.audioPreserveSpeakerHint') }}</small>
                </div>
                <div class="toggle-switch">
                  <input type="checkbox" id="audio-dup-toggle" v-model="localSettings.audioDup" :disabled="isLocked('audio')" />
                  <label for="audio-dup-toggle"></label>
                </div>
              </div>

              <div class="form-group">
                <label>{{ $t('settings.audioVolumeGain') }}</label>
                <input type="number" v-model.number="localSettings.audioGain" min="0.5" max="3" step="0.25" :disabled="isLocked('audio')" />
                <small class="hint">{{ $t('settings.audioVolumeGainHint') }}</small>
              </div>

              <div class="form-group form-group-row">
                <div class="group-info">
                  <label>{{ $t('settings.audioDefaultMuted') }}</label>
                  <small class="hint">{{ $t('settings.audioDefaultMutedHint') }}</small>
                </div>
                <div class="toggle-switch">
                  <input type="checkbox" id="page-audio-muted-toggle" v-model="localSettings.pageAudioMuted" />
                  <label for="page-audio-muted-toggle"></label>
                </div>
              </div>
            </div>
          </div>

          <!-- 🌐 通用与语言面板 -->
          <div v-if="activeTab === 'general'" class="tab-pane">
            <div class="form-group">
              <label>{{ $t('settings.general.language') }}</label>
              <select :value="locale" @change="setLanguage($event.target.value)" class="select-input">
                <option value="zh-CN">{{ $t('settings.general.zhCN') }}</option>
                <option value="en-US">{{ $t('settings.general.enUS') }}</option>
              </select>
              <small class="hint">{{ $t('settings.general.languageHint') }}</small>
            </div>
          </div>

          <!-- ⚙️ 高级与运维面板 -->
          <div v-if="activeTab === 'advanced'" class="tab-pane">
            <div class="form-group">
              <label>{{ $t('settings.channelPref') }}</label>
              <select v-model="localSettings.connectionPath" class="select-input">
                <option value="auto">{{ $t('settings.channelAuto') }}</option>
                <option value="direct">{{ $t('settings.channelDirect') }}</option>
                <option value="relay">{{ $t('settings.channelRelay') }}</option>
              </select>
              <small class="hint">{{ $t('settings.channelHint') }}</small>
            </div>

            <div class="form-group">
              <label>{{ $t('settings.ipPref') }}</label>
              <select v-model="localSettings.ipPreference" class="select-input">
                <option value="auto">{{ $t('settings.ipAuto') }}</option>
                <option value="ipv4">{{ $t('settings.ipV4') }}</option>
                <option value="ipv6">{{ $t('settings.ipV6') }}</option>
              </select>
              <small class="hint">{{ $t('settings.ipHint') }}</small>
            </div>

            <div class="form-group form-group-row">
              <div class="group-info">
                <label>{{ $t('settings.turnOffScreen') }}</label>
                <small class="hint">{{ $t('settings.turnOffScreenHint') }}</small>
              </div>
              <div class="toggle-switch">
                <input type="checkbox" id="poweroff-toggle" v-model="localSettings.powerOff" />
                <label for="poweroff-toggle"></label>
              </div>
            </div>

            <div class="form-group form-group-row">
              <div class="group-info">
                <label>{{ $t('settings.stayAwake') }}</label>
                <small class="hint">{{ $t('settings.stayAwakeHint') }}</small>
              </div>
              <div class="toggle-switch">
                <input type="checkbox" id="stayawake-toggle" v-model="localSettings.stayAwake" />
                <label for="stayawake-toggle"></label>
              </div>
            </div>

            <div class="form-group form-group-row">
              <div class="group-info">
                <label>{{ $t('settings.verboseLog') }}</label>
                <small class="hint">{{ $t('settings.verboseLogHint') }}</small>
              </div>
              <div class="toggle-switch">
                <input type="checkbox" id="debug-toggle" v-model="localSettings.debug" />
                <label for="debug-toggle"></label>
              </div>
            </div>

            <div class="form-group form-group-row">
              <div class="group-info">
                <label>{{ $t('settings.showStatusBar') }}</label>
                <small class="hint">{{ $t('settings.showStatusBarHint') }}</small>
              </div>
              <div class="toggle-switch">
                <input type="checkbox" id="show-stats-toggle" v-model="localSettings.showStats" />
                <label for="show-stats-toggle"></label>
              </div>
            </div>

            <div class="form-group form-group-row">
              <div class="group-info">
                <label>{{ $t('settings.enableCameraInject') }}</label>
                <small class="hint" v-if="cameraSupport">{{ $t('settings.cameraInjectSupported') }}</small>
                <small class="hint" v-else style="color: #f85149;">{{ $t('settings.cameraInjectNotSupported') }}</small>
              </div>
              <div class="toggle-switch">
                <input type="checkbox" id="camera-toggle" v-model="localSettings.camera" :disabled="!cameraSupport" />
                <label for="camera-toggle"></label>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-danger" v-if="isCustom" @click="resetToGlobal">{{ $t('settings.resetDefaults') }}</button>
          <div style="flex: 1"></div>
          <button class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
          <button class="btn btn-primary" @click="saveAndReconnect">
            {{ isGlobal ? $t('settings.saveGlobalSettings') : (isConnected ? $t('settings.saveAndReconnect') : $t('settings.saveAndConnect')) }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLanguage } from '@/locales'

const { t, locale } = useI18n()

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  cameraSupport: {
    type: Boolean,
    default: true
  },
  // 被锁定的设置分区（'bitrate' | 'fps' | 'size' | 'audio'），
  // 用于分享访客场景：对应控件置灰，值以分享者配置为准
  lockedSections: {
    type: Array,
    default: () => []
  },
  // 是否显示“缩略预览”页签（高频预览/缩略图频率影响虚机负载，普通用户与访客隐藏）
  showPreviewTab: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'save', 'reset'])

const localSettings = ref({ ...props.settings })
const activeTab = ref('video')

function isLocked(section) {
  return props.lockedSections.includes(section)
}

// 监听开启音频，当勾选 audio 时，如果 audioSource 没有设置，自动赋予默认值 'output'
watch(() => localSettings.value.audio, (newVal) => {
  if (newVal) {
    if (!localSettings.value.audioSource) {
      localSettings.value.audioSource = 'output'
    }
  }
})

// 监听工作模式切换，切换为监控模式时补齐默认镜头
watch(() => localSettings.value.videoSource, (newSource) => {
  if (newSource === 'camera') {
    if (!localSettings.value.cameraFacing) {
      localSettings.value.cameraFacing = 'back'
    }
  }
})

function saveAndReconnect() {
  emit('save', { ...localSettings.value })
  emit('close')
}

function resetToGlobal() {
  emit('reset')
  emit('close')
}
</script>

<style scoped>
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 12, 16, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(12px);
  padding: 16px;
  box-sizing: border-box;
}

.modal-content {
  background: #161b22;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-fade-in {
  animation: modalEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.01);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 18px;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f0f6fc;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #8b949e;
  font-size: 24px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f0f6fc;
}

/* 标签导航栏 */
.modal-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.15);
  padding: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 8px 4px;
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tab-icon-svg {
  width: 18px;
  height: 18px;
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}

.tab-btn:hover {
  color: #f0f6fc;
  background: rgba(255, 255, 255, 0.02);
}

.tab-btn.active {
  color: #58a6ff;
  background: rgba(88, 166, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(88, 166, 255, 0.15);
}

/* 面板主体，加入自定义滚动与防溢出 */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #0d1117;
  max-height: 50vh;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.24);
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: paneEnter 0.2s ease forwards;
}

.form-group-divider {
  font-size: 11px;
  font-weight: 700;
  color: #58a6ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 16px 0 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(88, 166, 255, 0.15);
}

@keyframes paneEnter {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.sub-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-left: 2px dashed rgba(88, 166, 255, 0.2);
  padding-left: 12px;
  margin-top: -4px;
  margin-bottom: 4px;
}

.animate-slide-down {
  animation: slideDown 0.2s ease forwards;
}

@keyframes slideDown {
  from { height: 0; opacity: 0; overflow: hidden; }
  to { height: auto; opacity: 1; }
}

/* 精美卡片式表单元素 */
.form-group {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 14px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s ease;
}

.form-group:focus-within {
  border-color: rgba(88, 166, 255, 0.25);
  background: rgba(255, 255, 255, 0.03);
}

.form-group-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #c9d1d9;
}

.form-group-row label {
  font-size: 13px;
  font-weight: 600;
}

.hint {
  font-size: 11px;
  color: #8b949e;
  line-height: 1.4;
}

/* 分享访客锁定项：置灰 + 锁标记 */
.lock-tag {
  font-size: 11px;
  font-weight: 400;
  color: #fbbf24;
  margin-left: 6px;
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.toggle-switch input:disabled + label {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 输入框与选择菜单美化 */
.form-group input[type="number"], 
.form-group input[type="text"], 
.form-group select.select-input {
  background: #21262d;
  border: 1px solid #30363d;
  padding: 8px 12px;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
}

/* 开关控制美化 */
.toggle-switch {
  display: flex;
  align-items: center;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-switch label {
  cursor: pointer;
  width: 44px;
  height: 22px;
  background: #30363d;
  border-radius: 11px;
  position: relative;
  transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.toggle-switch label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #f0f6fc;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input[type="checkbox"]:checked + label {
  background: #238636;
}

.toggle-switch input[type="checkbox"]:checked + label::after {
  transform: translateX(22px);
  background: #ffffff;
}

/* 页脚按钮 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
}

.btn-secondary {
  background: transparent;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #8b949e;
}

.btn-primary {
  background: #1f6feb;
  color: #ffffff;
}

.btn-primary:hover {
  background: #388bfd;
  box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.25);
}

.btn-danger {
  background: transparent;
  color: #f85149;
  border: 1px solid rgba(248, 81, 73, 0.3);
}

.btn-danger:hover {
  background: rgba(248, 81, 73, 0.1);
  border-color: #f85149;
}

/* 适配手机端与小屏幕 */
@media (max-width: 480px) {
  .settings-modal {
    padding: 0;
    align-items: flex-end; /* 在手机上从底部弹出 */
  }

  .modal-content {
    max-width: 100%;
    border-radius: 20px 20px 0 0; /* 底部无圆角 */
    max-height: 85vh;
    animation: mobileSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes mobileSlideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .modal-tabs {
    padding: 6px;
  }

  .tab-btn {
    padding: 6px 2px;
  }

  .tab-label {
    font-size: 10px;
  }

  .modal-body {
    padding: 12px 16px;
    max-height: 48vh; /* 压低体部，防止物理键盘弹起时溢出 */
  }

  .form-group {
    padding: 10px 12px;
  }

  .modal-footer {
    padding: 12px 16px;
    flex-wrap: wrap; /* 支持换行 */
    gap: 8px;
  }

  .modal-footer .btn {
    flex: 1; /* 按钮横向平摊 */
    min-width: 80px;
    text-align: center;
  }
}
</style>
