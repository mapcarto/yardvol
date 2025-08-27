<template>
  <div class="chart-card fade-in-up" :style="{ animationDelay: delay }">
    <h3>{{ title }}</h3>
    <div ref="chartContainer" class="chart-container">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  delay?: string;
}>();
</script>

<style scoped>
.chart-card {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.chart-container {
  height: 300px;
  flex-grow: 1;
  background: var(--bg-color-tertiary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
