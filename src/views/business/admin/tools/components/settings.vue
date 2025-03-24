<template>
  <aside class="flex flex-col gap-4">
    <a-card title="Duplicate removal" class="w-md">
      <a-switch v-model:checked="formState.duplicate"
                :checked-children="t('common.yes')"
                :un-checked-children="t('common.no')"
                @change="handleConvert" />
    </a-card>
    <a-card title="Case modification" class="w-md">
      <nav>
        <a-radio-group v-model:value="formState.case" button-style="solid" @change="handleConvert">
          <a-radio-button type="primary" :value="Case.raw">raw</a-radio-button>
          <a-radio-button type="primary" :value="Case.lower">lowercase</a-radio-button>
          <a-radio-button type="primary" :value="Case.upper">UPPERCASE</a-radio-button>
          <a-radio-button type="primary" :value="Case.camel">camelCase</a-radio-button>
          <a-radio-button type="primary" :value="Case.pascal">PascalCase</a-radio-button>
          <a-radio-button type="primary" :value="Case.snake">snake_case</a-radio-button>
          <a-radio-button type="primary" :value="Case.kebab">kebab-case</a-radio-button>
        </a-radio-group>
      </nav>
    </a-card>
    <a-card title="Wrapper settings" class="w-md">
      <a-form ref="formRef"
              :model="formState"
              layout="vertical"
              :rules="validatorRules"
      >
        <a-row>
          <a-col :span="24">
            <a-form-item v-bind="validateInfos.name" name="separator">
              <template #label>Separator</template>
              <a-input v-model:value="formState.separator" @change="handleConvert"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item v-bind="validateInfos.name" name="itemPrefix">
              <template #label>Item prefix</template>
              <a-input v-model:value="formState.itemPrefix" @change="handleConvert"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item v-bind="validateInfos.name" name="itemSuffix">
              <template #label>Item suffix</template>
              <a-input v-model:value="formState.itemSuffix" @change="handleConvert"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item v-bind="validateInfos.name" name="listPrefix">
              <template #label>List prefix</template>
              <a-input v-model:value="formState.listPrefix" @change="handleConvert"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item v-bind="validateInfos.name" name="listSuffix">
              <template #label>List suffix</template>
              <a-input v-model:value="formState.listSuffix" @change="handleConvert"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card title="Line settings" class="w-md">
      <nav>
        <ul class="flex flex-col gap-4 justify-center items-start">
          <li>
            <a-radio-group v-model:value="formState.line" button-style="solid" @change="handleConvert">
              <a-radio-button type="primary" :value="0">one line</a-radio-button>
              <a-radio-button type="primary" :value="1">multi lines</a-radio-button>
            </a-radio-group>
          </li>
          <li>
            <a-radio-group v-model:value="formState.order" button-style="solid" @change="handleConvert">
              <a-radio-button type="primary" value="RAW">raw</a-radio-button>
              <a-radio-button type="primary" value="ASC">A → Z</a-radio-button>
              <a-radio-button type="primary" value="DESC">Z ← A</a-radio-button>
            </a-radio-group>
          </li>
        </ul>
      </nav>
    </a-card>
  </aside>
</template>
<script lang="ts" setup>
import {Form} from "ant-design-vue";
import {inject, reactive, ref, watch} from "vue";
import {Case} from "@/views/business/admin/tools/data";
import {useI18n} from "vue-i18n";

const emit = defineEmits(['update']);
const { t } = useI18n();
const state = inject('state') as Record<string, string>;

watch(() => state.input, handleConvert);

const inputLineMode = ref(0); // 0 : one line, 1 : multi lines

const useForm = Form.useForm;
const formRef = ref();
const validatorRules = ref({
});
const formState = reactive<Record<string, string | boolean | number>>({
  case: 0,
  line: 0,
  order: 'RAW',
  duplicate: true,
  separator: '',
  itemPrefix: '',
  itemSuffix: '',
  listPrefix: '',
  listSuffix: '',
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: false });

function handleConvert() {
  getInputLineMode();
  const extractedStrings = handleExtractStrings(state.input);
  const orderChange = handleOrderChange(extractedStrings);
  const caseChange = handleCaseChange(orderChange);
  const prefixSuffixChange = handlePrefixSuffixChange(caseChange);
  const lineChange = handleLineChange(prefixSuffixChange);
  const wrapChange = handleWrapChange(lineChange);
  emit('update', {data: wrapChange, lineMode: formState.line, nbItems: extractedStrings.length});
}
function getInputLineMode() {
  inputLineMode.value = state.input.includes('\n') ? 1 : 0;
}
function handleExtractStrings(input:string): string[] {
  if(inputLineMode.value === 0) {
    const stringList = extractStrings(input);
    if(formState.duplicate)
      return removeDuplicateEntries(stringList);
    return stringList;
  }
  const stringList = multiLineTrim(input);
  if(formState.duplicate)
    return removeDuplicateEntries(stringList);
  return stringList;
}
function removeDuplicateEntries(input: string[]): string[] {
  return Array.from(new Set(input));
}
function extractStrings(entry: string): string[] {
  // Check if the string contains any single or double quotes.
  if (/['"]/.test(entry)) {
    const quotes = entry.match(/['"]/g);
    if (quotes && quotes.length % 2 === 0) {
      // Even number of quotes, extract content between quotes
      const regex = /(['"])(.*?)\1/g;
      const results: string[] = [];
      let match: RegExpExecArray | null;
      let lastIndex = 0;

      while ((match = regex.exec(entry)) !== null) {
        // Add text before the quote pair
        const textBefore = entry.slice(lastIndex, match.index).trim();
        if (textBefore) {
          results.push(...extractStringsWithoutQuotes(textBefore));
        }
        // Add content inside the quotes
        results.push(match[2].trim());
        lastIndex = regex.lastIndex;
      }

      // Add text after the last quote pair
      const textAfter = entry.slice(lastIndex).trim();
      if (textAfter) {
        results.push(...extractStringsWithoutQuotes(textAfter));
      }

      return results;
    } else {
      // Odd number of quotes, ignore the last quote
      const quoteIndices = [];
      for (let i = 0; i < entry.length; i++) {
        if (entry[i] === "'" || entry[i] === '"') {
          quoteIndices.push(i);
        }
      }
      // Find the index of the last even quote (second-to-last quote)
      const lastEvenQuoteIndex = quoteIndices[quoteIndices.length - 2];
      const textBeforeLastEvenQuote = entry.slice(0, lastEvenQuoteIndex + 1).trim();
      const textAfterLastEvenQuote = entry.slice(lastEvenQuoteIndex + 1).trim();

      // Process the text before the last even quote as if it has even quotes
      const resultsBeforeLastQuote = extractStrings(textBeforeLastEvenQuote);
      // Process the text after the last even quote as normal text
      const resultsAfterLastQuote = extractStringsWithoutQuotes(textAfterLastEvenQuote);

      return [...resultsBeforeLastQuote, ...resultsAfterLastQuote];
    }
  } else {
    return extractStringsWithoutQuotes(entry);
  }
}

function extractStringsWithoutQuotes(entry: string): string[] {
  if (/[,;]/.test(entry)) {
    // If the string contains a comma or semicolon, split on these characters.
    // Trim each element and filter out any empty strings.
    return entry
      .split(/[,;]/)
      .map(part => part.trim())
      .filter(part => part.length > 0);
  } else {
    // Otherwise, split by one or more whitespace characters.
    return entry.split(/\s+/).filter(part => part.length > 0);
  }
}
function multiLineTrim(input:string) {
  return input.split('\n').flatMap((line) => extractStrings(line));
}
function handleCaseChange(input:string[]):string[] {
  switch(formState.case) {
    case Case.lower:
      return input.map((item) => item.toLowerCase());
    case Case.upper:
      return input.map((item) => item.toUpperCase());
    case Case.camel:
      return input.map((item) => toCamelCase(item));
    case Case.pascal:
      return input.map((item) => toPascalCase(item));
    case Case.snake:
      return input.map((item) => toSnakeCase(item));
    case Case.kebab:
      return input.map((item) => toKebabCase(item));
    default:
      return input;
  }
}
function toCamelCase(input:string) {
  return input.replace(/(?:^\w|(?<![-_])\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    ).replace(/\s+/g, '');
}
function toPascalCase(input:string) {
  return input.replace(/(?:^\w|(?<![-_])\b\w)/g, (word, _index) => word.toUpperCase()).replace(/\s+/g, '');
}
function toSnakeCase(input:string) {
  return input.replace(/\s+/g, '_');
}
function toKebabCase(input:string) {
  return input.replace(/\s+/g, '-');
}
function handlePrefixSuffixChange(input: string[]) {
  return input.map((item) => formState.itemPrefix + item + formState.itemSuffix);
}
function handleLineChange(input:string[]) {
  return formState.line === 0 ? input.join(formState.separator as string) : input.join(formState.separator + '\n');
}
function handleWrapChange(input:string) {
  return formState.line === 0 ?
    formState.listPrefix + input + formState.listSuffix :
    (formState.listPrefix + '\n' + input + '\n' + formState.listSuffix).trim();
}
function handleOrderChange(input:string[]): string[] {
  switch(formState.order) {
    case 'ASC':
      return input.sort();
    case 'DESC':
      return input.sort().reverse();
    default:
      return input;
  }
}
</script>
