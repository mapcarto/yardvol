<template>
  <div class="visualization-container">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 3D场景容器 -->
      <div class="scene-container">
        <!-- 头部控制栏 - 移到地图内部 -->
        <div class="header-controls-overlay">
          <!-- 数据信息显示 -->
          <div v-if="dataInfo.dataId" class="data-info-display">
            <div class="data-info-item">
              <i class="fas fa-database"></i>
              <span class="info-label">数据:</span>
              <span class="info-value">{{ dataInfo.dataName }}</span>
            </div>
            <div class="data-info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span class="info-label">堆场:</span>
              <span class="info-value">{{ dataInfo.site }}</span>
            </div>
            <div class="data-info-item">
              <i class="fas fa-calendar-alt"></i>
              <span class="info-label">采集时间:</span>
              <span class="info-value">{{ dataInfo.date }}</span>
            </div>
            <div class="data-info-item">
              <i class="fas fa-hashtag"></i>
              <span class="info-label">第次:</span>
              <span class="info-value">第{{ dataInfo.sequence }}次</span>
            </div>
          </div>
          
          <div class="scene-selector">
            <select v-model="selectedYard" class="control-select">
              <option value="longkou">龙口煤场</option>
              <option value="qingdao">青岛煤场</option>
              <option value="shanghai">上海煤场</option>
              <option value="tianjin">天津煤场</option>
            </select>
            <select v-model="selectedDate" class="control-select">
              <option value="2025-08-17">2025-08-17</option>
              <option value="2025-08-16">2025-08-16</option>
              <option value="2025-08-15">2025-08-15</option>
            </select>
            <select v-model="selectedSession" class="control-select">
              <option value="1">第1次</option>
              <option value="2">第2次</option>
              <option value="3">第3次</option>
            </select>
            <button class="btn btn-primary" @click="loadScene">
              <i class="fas fa-sync-alt"></i>
              加载
            </button>
            <button class="btn btn-secondary" @click="showPileDisplay">
              <i class="fas fa-magic"></i>
              分堆显示
            </button>
            <button class="btn btn-secondary" @click="toggleManualCleanTools">
              <i class="fas fa-hand-pointer"></i>
              手动清表
            </button>
          </div>
        </div>

        <div ref="threeContainer" class="three-container"></div>
        
        <!-- 加载提示 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>正在加载三维模型...</p>
        </div>

        <!-- 右侧浮动控制按钮 -->
        <div class="floating-controls">
          <button class="control-btn" @click="resetView" title="重置视角">
            <i class="fas fa-home"></i>
          </button>
          <button class="control-btn" @click="toggleFullscreen" title="全屏">
            <i class="fas fa-expand"></i>
          </button>
          <button class="control-btn" @click="toggleInfoPanel" title="信息面板">
            <i class="fas fa-info-circle"></i>
          </button>
          <button class="control-btn" @click="resetAllPiles" title="重置煤堆">
            <i class="fas fa-redo-alt"></i>
          </button>
        </div>

        <!-- 信息面板 -->
        <div v-show="showInfoPanel" class="info-panel">
          <div class="panel-header">
            <h3><i class="fas fa-layer-group"></i> 分堆信息</h3>
            <button class="close-btn" @click="closeInfoPanel">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="pile-list">
            <div 
              v-for="pile in pileData" 
              :key="pile.id" 
              class="pile-item"
              :class="{ selected: selectedPile === pile.id }"
              @click="selectPile(pile.id)"
            >
              <div class="pile-id">{{ pile.name }}</div>
              <div class="pile-volume">{{ pile.volume.toLocaleString() }} m³</div>
              <div class="pile-change" :class="pile.change > 0 ? 'positive' : 'negative'">
                {{ pile.change > 0 ? '+' : '' }}{{ pile.change.toLocaleString() }} m³
              </div>
            </div>
          </div>

          <div class="summary-info">
            <div class="summary-item">
              <span class="summary-label">总体积</span>
              <span class="summary-value">{{ totalVolume.toLocaleString() }} m³</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">煤堆数量</span>
              <span class="summary-value">{{ pileData.length }} 个</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">变化量</span>
              <span class="summary-value">{{ totalChange > 0 ? '+' : '' }}{{ totalChange.toLocaleString() }} m³</span>
            </div>
          </div>

          <div class="action-buttons">
            <button class="clearing-btn flatten" @click="flattenOperation">
              <i class="fas fa-compress-alt"></i>
              压平
            </button>
            <button class="clearing-btn confirm" @click="confirmOperation">
              <i class="fas fa-check"></i>
              确定
            </button>
          </div>
        </div>

        <!-- 手动清表工具箱 -->
        <div v-show="showManualTools" class="manual-clean-tools">
          <div class="tools-header">
            <h3><i class="fas fa-tools"></i> 手动清表工具</h3>
            <button class="close-btn" @click="closeManualTools">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="tools-content">
            <div class="tool-section">
              <h4>绘制工具</h4>
              <div class="tool-buttons">
                <button 
                  class="clean-tool-btn" 
                  :class="{ active: currentCleanTool === 'rectangle' }"
                  @click="setCleanTool('rectangle')"
                >
                  <i class="far fa-square"></i>
                  框选标记
                </button>
                <button 
                  class="clean-tool-btn" 
                  :class="{ active: currentCleanTool === 'circle' }"
                  @click="setCleanTool('circle')"
                >
                  <i class="far fa-circle"></i>
                  画圆标记
                </button>
                <button 
                  class="clean-tool-btn" 
                  :class="{ active: currentCleanTool === 'polygon' }"
                  @click="setCleanTool('polygon')"
                >
                  <i class="fas fa-draw-polygon"></i>
                  多边形标记
                </button>
                <button 
                  class="clean-tool-btn" 
                  :class="{ active: currentCleanTool === 'lasso' }"
                  @click="setCleanTool('lasso')"
                >
                  <i class="fas fa-mouse-pointer"></i>
                  选择工具
                </button>
              </div>
            </div>

            <div class="tool-section">
              <h4>操作工具</h4>
              <div class="tool-buttons">
                <button class="clean-tool-btn action" @click="clearSelected">
                  <i class="fas fa-eraser"></i>
                  清除标记
                </button>
                <button class="clean-tool-btn action" @click="undoAction">
                  <i class="fas fa-save"></i>
                  保存标记
                </button>
                <button class="clean-tool-btn action start-clean" @click="startCleaning">
                  <i class="fas fa-play-circle"></i>
                  开始清表
                </button>
              </div>
            </div>

            <div class="tool-section mark-management">
              <h4>标记管理</h4>
              <div class="mark-list">
                <div v-for="mark in marks" :key="mark.id" class="mark-item">
                  <div class="mark-info">
                    <div class="mark-name">{{ mark.name }}</div>
                    <div class="mark-type">{{ mark.type }}</div>
                  </div>
                  <div class="mark-actions">
                    <button class="mark-action-btn edit" @click="editMark(mark)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="mark-action-btn delete" @click="deleteMark(mark)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="add-mark-section">
                <button class="btn btn-secondary add-mark-btn" @click="addNewMark">
                  <i class="fas fa-plus"></i>
                  新增标记
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const route = useRoute()

// 数据信息（从路由查询参数获取）
const dataInfo = reactive({
  dataId: '',
  dataName: '',
  dataType: '',
  site: '',
  date: '',
  sequence: ''
})

// 初始化数据信息
const initDataInfo = () => {
  const query = route.query
  if (query.dataId) {
    dataInfo.dataId = query.dataId as string
    dataInfo.dataName = query.dataName as string
    dataInfo.dataType = query.dataType as string
    dataInfo.site = query.site as string
    dataInfo.date = query.date as string
    dataInfo.sequence = query.sequence as string
    
    // 更新选择器的值
    selectedYard.value = getSiteCode(dataInfo.site)
    selectedDate.value = dataInfo.date
    selectedSession.value = dataInfo.sequence
    
    // 显示数据信息提示
    ElMessage.success(`已加载数据: ${dataInfo.dataName}`)
  }
}

// 将堆场名称转换为代码
const getSiteCode = (siteName: string) => {
  const siteMap: { [key: string]: string } = {
    '龙口煤场': 'longkou',
    '青岛港': 'qingdao',
    '上海港': 'shanghai',
    '天津港': 'tianjin',
    '秦皇岛煤场': 'qingdao', // 映射到青岛
    '黄骅港': 'tianjin', // 映射到天津
    '日照港': 'qingdao' // 映射到青岛
  }
  return siteMap[siteName] || 'longkou'
}

// 响应式数据
const selectedYard = ref('longkou')
const selectedDate = ref('2025-08-17')
const selectedSession = ref('1')
const loading = ref(false)
const showInfoPanel = ref(false)
const showManualTools = ref(false)
const selectedPile = ref<string | null>(null)
const currentTool = ref('rotate')
const currentCleanTool = ref('')
const showPileList = ref(false)

// Three.js 相关
const threeContainer = ref<HTMLElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let coalPileMeshes: { [key: string]: THREE.Mesh } = {}

// 煤堆数据
const pileData = ref([
  { id: 'pile1', name: '煤堆A', volume: 15420, change: 1250 },
  { id: 'pile2', name: '煤堆B', volume: 23680, change: -890 },
  { id: 'pile3', name: '煤堆C', volume: 18750, change: 2100 },
  { id: 'pile4', name: '煤堆D', volume: 12340, change: -450 },
  { id: 'pile5', name: '煤堆E', volume: 28900, change: 3200 }
])

// 标记数据
const marks = ref([
  { id: 1, name: '标记点1', type: '去除沙堆' },
  { id: 2, name: '标记点2', type: '去除土堆' },
  { id: 3, name: '标记点3', type: '临时堆放去除' }
])

// 计算属性
const totalVolume = computed(() => {
  return pileData.value.reduce((sum, pile) => sum + pile.volume, 0)
})

const totalChange = computed(() => {
  return pileData.value.reduce((sum, pile) => sum + pile.change, 0)
})

// 方法
const loadScene = () => {
  loading.value = true
  ElMessage.info(`正在加载 ${selectedYard.value} ${selectedDate.value} 第${selectedSession.value}次数据...`)
  
  setTimeout(() => {
    loading.value = false
    ElMessage.success('场景加载完成')
    initThreeJS()
  }, 2000)
}

const showPileDisplay = () => {
  ElMessage.success('分堆显示已开启')
  showInfoPanel.value = true
}

const toggleManualCleanTools = () => {
  showManualTools.value = !showManualTools.value
  if (showManualTools.value) {
    ElMessage.info('手动清表工具已打开')
  }
}

const closeManualTools = () => {
  showManualTools.value = false
  currentCleanTool.value = ''
}

const setCleanTool = (tool: string) => {
  currentCleanTool.value = tool
  console.log(`切换到工具：${tool}`)
}

const resetView = () => {
  if (controls) {
    controls.reset()
    ElMessage.success('视角已重置')
  }
}

const resetAllPiles = () => {
  // 保存当前煤堆数据
  const currentPileData = [...pileData.value]
  
  // 清除场景中的所有煤堆
  Object.values(coalPileMeshes).forEach(mesh => {
    scene.remove(mesh)
    mesh.geometry.dispose()
    if (mesh.material instanceof THREE.Material) {
      mesh.material.dispose()
    } else if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => material.dispose())
    }
  })
  
  // 重置煤堆网格对象
  coalPileMeshes = {}
  
  // 使用原始数据重新创建所有煤堆
  const colors = [0x8B4513, 0x654321, 0x5D4037, 0x3E2723, 0x795548]
  
  currentPileData.forEach((pile, index) => {
    // 为每个煤堆创建一个新的锥形几何体
    const geometry = new THREE.ConeGeometry(2 + Math.random(), 3 + Math.random() * 2, 8)
    const material = new THREE.MeshLambertMaterial({ 
      color: colors[index % colors.length],
      emissive: 0x000000,
      emissiveIntensity: 0.5
    })
    const mesh = new THREE.Mesh(geometry, material)
    
    mesh.position.set(
      (index - 2) * 5,
      geometry.parameters.height / 2,
      Math.random() * 4 - 2
    )
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { pileId: pile.id }
    
    // 存储煤堆网格引用
    coalPileMeshes[pile.id] = mesh
    
    scene.add(mesh)
  })
  
  // 取消选中状态
  selectedPile.value = null
  
  ElMessage.success('所有煤堆已恢复初始状态')
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    threeContainer.value?.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const toggleInfoPanel = () => {
  showInfoPanel.value = !showInfoPanel.value
}

const closeInfoPanel = () => {
  showInfoPanel.value = false
}

const selectPile = (pileId: string) => {
  // 如果已经选中，则取消选中
  if (selectedPile.value === pileId) {
    selectedPile.value = null
    // 恢复所有煤堆的原始颜色
    Object.values(coalPileMeshes).forEach(mesh => {
      (mesh.material as THREE.MeshLambertMaterial).emissive.set(0x000000)
    })
    ElMessage.info('已取消选中')
    return
  }
  
  selectedPile.value = pileId
  
  // 恢复所有煤堆的原始颜色
  Object.values(coalPileMeshes).forEach(mesh => {
    (mesh.material as THREE.MeshLambertMaterial).emissive.set(0x000000)
  })
  
  // 高亮选中的煤堆
  if (coalPileMeshes[pileId]) {
    // 使用更明显的高亮颜色
    (coalPileMeshes[pileId].material as THREE.MeshLambertMaterial).emissive.set(0xff9500)
    (coalPileMeshes[pileId].material as THREE.MeshLambertMaterial).emissiveIntensity = 0.8
    
    // 将相机聚焦到选中的煤堆
    const position = coalPileMeshes[pileId].position.clone()
    
    // 相机动画移动到煤堆位置上方
    const startPosition = camera.position.clone()
    const endPosition = new THREE.Vector3(position.x, position.y + 5, position.z + 5)
    
    // 简单的动画效果
    let progress = 0
    const animate = () => {
      progress += 0.02
      if (progress < 1) {
        camera.position.lerpVectors(startPosition, endPosition, progress)
        camera.lookAt(position)
        requestAnimationFrame(animate)
      }
    }
    animate()
    
    ElMessage.success(`已选中 ${pileData.value.find(p => p.id === pileId)?.name}`)
  }
}

const flattenOperation = () => {
  if (!selectedPile.value || !coalPileMeshes[selectedPile.value]) {
    ElMessage.warning('请先选择一个煤堆')
    return
  }
  
  const mesh = coalPileMeshes[selectedPile.value]
  const originalHeight = mesh.geometry.parameters.height
  
  // 创建动画效果，逐渐将煤堆压平
  let height = originalHeight
  const animate = () => {
    height -= originalHeight / 20
    if (height > 0.1) {
      // 创建新的几何体，高度逐渐减小
      const newGeometry = new THREE.ConeGeometry(
        mesh.geometry.parameters.radius,
        height,
        mesh.geometry.parameters.radialSegments
      )
      
      // 更新网格的几何体
      mesh.geometry.dispose()
      mesh.geometry = newGeometry
      
      requestAnimationFrame(animate)
    } else {
      // 最终将煤堆压平为一个薄圆盘
      const flatGeometry = new THREE.CylinderGeometry(
        mesh.geometry.parameters.radius,
        mesh.geometry.parameters.radius,
        0.1,
        32
      )
      mesh.geometry.dispose()
      mesh.geometry = flatGeometry
      
      // 更新位置，使其贴近地面
      mesh.position.y = 0.05
      
      ElMessage.success('煤堆已压平')
    }
  }
  
  animate()
}

const confirmOperation = () => {
  ElMessage.success('操作已确认')
  closeInfoPanel()
}

const clearSelected = () => {
  ElMessage.info('清除标记')
}

const undoAction = () => {
  ElMessage.success('标记已保存')
}

const startCleaning = () => {
  ElMessage.success('清表任务已创建，系统将自动处理选中区域')
  closeManualTools()
}

const editMark = (mark: any) => {
  ElMessage.info(`编辑标记：${mark.name}`)
}

const deleteMark = (mark: any) => {
  ElMessageBox.confirm(`确定删除标记 "${mark.name}"？`, '删除确认', { type: 'warning' })
    .then(() => {
      const index = marks.value.findIndex(m => m.id === mark.id)
      if (index > -1) {
        marks.value.splice(index, 1)
        ElMessage.success('标记已删除')
      }
    })
    .catch(() => {})
}

const addNewMark = () => {
  const newMark = {
    id: Date.now(),
    name: `标记点${marks.value.length + 1}`,
    type: '新标记'
  }
  marks.value.push(newMark)
  ElMessage.success('新标记已添加')
}

// Three.js 初始化
const initThreeJS = () => {
  if (!threeContainer.value) return

  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // 相机
  camera = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(10, 10, 10)

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  threeContainer.value.appendChild(renderer.domElement)

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // 光源
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 添加示例煤堆
  createCoalPiles()

  // 渲染循环
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
}

const createCoalPiles = () => {
  const colors = [0x8B4513, 0x654321, 0x5D4037, 0x3E2723, 0x795548]
  
  // 清空之前的煤堆网格
  Object.values(coalPileMeshes).forEach(mesh => {
    scene.remove(mesh)
    mesh.geometry.dispose()
    (mesh.material as THREE.Material).dispose()
  })
  coalPileMeshes = {}
  
  pileData.value.forEach((pile, index) => {
    const geometry = new THREE.ConeGeometry(2 + Math.random(), 3 + Math.random() * 2, 8)
    const material = new THREE.MeshLambertMaterial({ 
      color: colors[index % colors.length],
      emissive: 0x000000,
      emissiveIntensity: 0.5
    })
    const mesh = new THREE.Mesh(geometry, material)
    
    mesh.position.set(
      (index - 2) * 5,
      geometry.parameters.height / 2,
      Math.random() * 4 - 2
    )
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { pileId: pile.id }
    
    // 存储煤堆网格引用
    coalPileMeshes[pile.id] = mesh
    
    scene.add(mesh)
  })

  // 添加地面
  const groundGeometry = new THREE.PlaneGeometry(50, 50)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

const handleResize = () => {
  if (!threeContainer.value || !camera || !renderer) return
  
  camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
}

// 生命周期
onMounted(() => {
  // 初始化数据信息
  initDataInfo()
  
  nextTick(() => {
    loadScene()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style lang="scss" scoped>
.visualization-container {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.main-content {
  height: calc(100% - 2px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scene-container {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  max-height: 100%;
}

.header-controls-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.data-info-display {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.data-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-color-secondary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.data-info-item i {
  color: var(--primary-color);
  font-size: 0.875rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
}

.scene-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 120px;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--bg-color-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

.three-container {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 100;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.floating-controls {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 40;
}

.control-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.info-panel {
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 320px;
  height: auto;
  max-height: 95vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
  overflow: visible;
  z-index: 60;
}

.panel-header {
  padding: 1rem 1.5rem;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.pile-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
}

.pile-item {
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 12px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pile-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.pile-item.selected {
  background: var(--primary-color);
  color: white;
}

.pile-id {
  font-weight: 600;
  color: var(--text-primary);
}

.pile-item.selected .pile-id {
  color: white;
}

.pile-change {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.pile-change.positive {
  color: #22c55e;
}

.pile-change.negative {
  color: #ef4444;
}

.pile-volume {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--primary-color);
}

.pile-item.selected .pile-volume {
  color: white;
}

.summary-info {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.summary-value {
  color: var(--text-primary);
  font-weight: 600;
}

.action-buttons {
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.clearing-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.clearing-btn.flatten {
  background: #f59e0b;
  color: white;
}

.clearing-btn.flatten:hover {
  background: #d97706;
  transform: translateY(-2px);
}

.clearing-btn.confirm {
  background: #10b981;
  color: white;
}

.clearing-btn.confirm:hover {
  background: #059669;
  transform: translateY(-2px);
}

/* 手动清表工具箱 */
.manual-clean-tools {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  height: auto;
  max-height: 95vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
  z-index: 60;
  display: flex;
  flex-direction: column;
}

.tools-header {
  padding: 1rem 1.5rem;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tools-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tools-content {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(100vh - 200px);
}

.tool-section {
  flex-shrink: 0;
}

.tool-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.clean-tool-btn {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  text-align: center;
}

.clean-tool-btn:hover {
  background: var(--border-color);
  transform: translateY(-2px);
}

.clean-tool-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.clean-tool-btn.action {
  grid-column: span 2;
  flex-direction: row;
  justify-content: center;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.clean-tool-btn.start-clean {
  background: var(--success-color);
  color: white;
  font-weight: 600;
  padding: 0.75rem;
}

.clean-tool-btn.start-clean:hover {
  background: var(--task-3d-color);
  transform: translateY(-2px);
}

.clean-tool-btn i {
  font-size: 1.2rem;
}

.mark-management {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  flex: 0 1 auto;
  overflow: visible;
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.mark-list {
  flex: 1;
  overflow-y: auto;
  max-height: 200px;
}

.mark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
}

.mark-info {
  flex: 1;
}

.mark-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.mark-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.mark-actions {
  display: flex;
  gap: 0.25rem;
}

.mark-action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.mark-action-btn.edit {
  background: #3b82f6;
  color: white;
}

.mark-action-btn.edit:hover {
  background: #2563eb;
}

.mark-action-btn.delete {
  background: #ef4444;
  color: white;
}

.mark-action-btn.delete:hover {
  background: #dc2626;
}

.add-mark-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.add-mark-btn {
  width: 100%;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-controls-overlay {
    position: relative;
    margin-bottom: 1rem;
  }
  
  .scene-selector {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .control-select {
    min-width: auto;
  }
  
  .floating-controls {
    right: 0.5rem;
  }
  
  .info-panel,
  .manual-clean-tools {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .visualization-container {
    padding: 0.5rem;
  }
  
  .header-controls-overlay {
    padding: 1rem;
  }
  
  .info-panel,
  .manual-clean-tools {
    width: 260px;
    left: 0.5rem;
    right: 0.5rem;
    width: auto;
  }
  
  .floating-controls {
    right: 0.5rem;
    gap: 0.25rem;
  }
  
  .control-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .tool-buttons {
    grid-template-columns: 1fr;
  }
}

/* 深色模式适配 */
[data-theme="dark"] .visualization-container {
  .header-controls-overlay,
  .info-panel,
  .manual-clean-tools {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .control-btn {
    background: rgba(31, 41, 55, 0.9);
    color: #f9fafb;
  }
  
  .control-btn:hover {
    background: rgba(31, 41, 55, 1);
  }
  
  .control-select,
  .clean-tool-btn {
    background: rgba(55, 65, 81, 0.8);
    border-color: rgba(75, 85, 99, 0.5);
    color: #f9fafb;
  }
  
  .clean-tool-btn:hover {
    background: rgba(75, 85, 99, 0.8);
  }
  
  .pile-item {
    background: rgba(55, 65, 81, 0.8);
    border-color: rgba(75, 85, 99, 0.5);
  }
  
  .mark-item {
    background: rgba(55, 65, 81, 0.8);
    border-color: rgba(75, 85, 99, 0.5);
  }
}
</style>
