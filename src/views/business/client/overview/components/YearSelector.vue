<template>
  <div class="flex justify-center items-center w-min m-auto">
    <a-button
      preIcon="ant-design:caret-left-filled"
      @click="handlePreviousYear"
      :disabled="previousYearDisabled"
    />
    <a-select
      v-model:value="selectedYear"
      @change="handleYearChange"
      :options="yearOptions"
      class="m-auto"
    />
    <a-button
      preIcon="ant-design:caret-right-filled"
      @click="handleNextYear"
      :disabled="nextYearDisabled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
import { JSelectMultipleOptions } from '@/views/business/dto';

interface Props {
  modelValue?: string;
  yearOptions?: JSelectMultipleOptions[];
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'previous-year'): void;
  (e: 'next-year'): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => dayjs().year().toString(),
  yearOptions: () => [],
  disabled: false
});

const emits = defineEmits<Emits>();

const selectedYear = ref<string>(props.modelValue);

// Computed properties for button states
const previousYearDisabled = computed(() => {
  if (props.disabled || props.yearOptions.length === 0) return true;
  const currentIndex = props.yearOptions.findIndex(item => item.value === selectedYear.value);
  return currentIndex >= props.yearOptions.length - 1;
});

const nextYearDisabled = computed(() => {
  if (props.disabled || props.yearOptions.length === 0) return true;
  const currentIndex = props.yearOptions.findIndex(item => item.value === selectedYear.value);
  return currentIndex <= 0;
});

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== selectedYear.value) {
    selectedYear.value = newValue;
  }
});

// Watch for internal changes
watch(selectedYear, (newValue) => {
  emits('update:modelValue', newValue);
});

// Event handlers
function handleYearChange(year: string) {
  selectedYear.value = year;
  emits('change', year);
}

function handlePreviousYear() {
  const currentIndex = props.yearOptions.findIndex(item => item.value === selectedYear.value);
  if (currentIndex < props.yearOptions.length - 1) {
    const newYear = props.yearOptions[currentIndex + 1].value as string;
    selectedYear.value = newYear;
    emits('previous-year');
  }
}

function handleNextYear() {
  const currentIndex = props.yearOptions.findIndex(item => item.value === selectedYear.value);
  if (currentIndex > 0) {
    const newYear = props.yearOptions[currentIndex - 1].value as string;
    selectedYear.value = newYear;
    emits('next-year');
  }
}
</script>
