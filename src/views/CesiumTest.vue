<template>
  <div class="cesium-container">
    <div id="cesiumContainer" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import * as Cesium from 'cesium';

onMounted(async () => {
  // 初始化Cesium查看器
  const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: await Cesium.createWorldTerrainAsync(),
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
  });

  // 设置初始视图
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4074, 39.9042, 10000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0
    }
  });
});
</script>

<style scoped>
.cesium-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>