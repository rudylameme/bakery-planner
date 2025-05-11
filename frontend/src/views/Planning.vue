<template>
  <div class="planning-container">
    <div class="toolbar mb-4 flex justify-between">
      <button @click="toggleView" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {{ isWeekView ? 'Vue Journalière' : 'Vue Hebdomadaire' }}
      </button>
      <button @click="exportPDF" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Exporter PDF
      </button>
    </div>
    
    <PlanningWeek v-if="isWeekView" :data="planningData" />
    <PlanningDay v-else :data="planningData" :selectedDay="selectedDay" />
    
    <div class="settings-panel mt-8 bg-white p-4 rounded shadow">
      <h3 class="text-lg font-semibold mb-4">Paramètres de pondération</h3>
      <div class="weight-sliders space-y-4">
        <label class="block">
          Semaine -1:
          <div class="flex items-center">
            <input type="range" v-model="weights.sem1" min="0" max="1" step="0.1" 
                  class="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer" />
            <span class="ml-2 w-8">{{ weights.sem1 }}</span>
          </div>
        </label>
        <label class="block">
          Semaine -1 A-1:
          <div class="flex items-center">
            <input type="range" v-model="weights.sem1a1" min="0" max="1" step="0.1" 
                  class="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer" />
            <span class="ml-2 w-8">{{ weights.sem1a1 }}</span>
          </div>
        </label>
        <label class="block">
          Semaine -2:
          <div class="flex items-center">
            <input type="range" v-model="weights.sem2" min="0" max="1" step="0.1" 
                  class="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer" />
            <span class="ml-2 w-8">{{ weights.sem2 }}</span>
          </div>
        </label>
      </div>
      <button @click="recalculate" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Recalculer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePlanningStore } from '../stores/planning.store';
import { useSettingsStore } from '../stores/settings.store';
import PlanningWeek from '../components/planning/PlanningWeek.vue';
import PlanningDay from '../components/planning/PlanningDay.vue';
import { exportPlanningToPDF } from '../services/pdf.service';

const planningStore = usePlanningStore();
const settingsStore = useSettingsStore();

const isWeekView = ref(true);
const selectedDay = ref('Lundi');
const weights = ref({
  sem1: 0.5,
  sem1a1: 0.3,
  sem2: 0.2
});

// Récupérer les données du planning
onMounted(async () => {
  await planningStore.fetchFrequentation();
  await planningStore.fetchHistoriqueVentes();
  await settingsStore.fetchSettings();
});

const planningData = computed(() => {
  return planningStore.calculatePlanning(weights.value);
});

function toggleView() {
  isWeekView.value = !isWeekView.value;
}

function recalculate() {
  // La réaction est automatique grâce au computed
  planningStore.recalculatePlanning(weights.value);
}

function exportPDF() {
  exportPlanningToPDF(planningData.value, isWeekView.value, selectedDay.value);
}
</script>
