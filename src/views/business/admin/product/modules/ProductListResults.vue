<template>
  <section v-if="Object.keys(results).length > 0">
    <a-collapse :bordered="false" class="w-full mb-6">
      <a-collapse-panel key="1">
        <template #header>
          <h2>Sku Weigth Edit response details</h2>
        </template>
        <div class="bg-white">
          <div class="grid grid-cols-2">
            <div class="p-6">
              <h3>Successes</h3>
              <ul class="columns-3">
                <li v-if="results.successes.length > 0" v-for="(value, index) in results.successes">
                  {{ value }}
                </li>
                <li v-else>
                  None
                </li>
              </ul>
            </div>
            <div class="border-l p-6">
              <h3>Failures</h3>
              <ul class="columns-2">
                <li v-if="results.failures.length > 0" v-for="(value, index) in results.failures">
                  {{ value }}
                </li>
                <li v-else>
                  None
                </li>
              </ul>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </section>
</template>
<script lang="ts" setup>

import {inject, Ref} from "vue";

const results = inject('results') as Ref<Recordable>;

</script>
