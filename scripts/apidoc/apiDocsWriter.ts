import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Method } from '../../docs/.vitepress/components/api-docs/method';
import type { PageIndex } from './utils';
import {
  formatMarkdown,
  formatTypescript,
  pathDocsDir,
  pathOutputDir,
} from './utils';

const pathDocsApiPages = resolve(pathDocsDir, '.vitepress', 'api-pages.ts');

const scriptCommand = 'pnpm run generate:api-docs';

// Moved here because this must not be formatted by prettier
const vitePressInFileOptions = `---
editLink: false
---

`;

/**
 * Writes the api page for the given module to the correct location.
 *
 * @param moduleName The name of the module to write the docs for.
 * @param lowerModuleName The lowercase name of the module.
 * @param comment The module comments.
 */
export function writeApiDocsModulePage(
  moduleName: string,
  lowerModuleName: string,
  comment: string
): void {
  // Write api docs page
  let content = `
  <script setup>
  import ApiDocsMethod from '../.vitepress/components/api-docs/method.vue'
  import { ${lowerModuleName} } from './${lowerModuleName}'
  import { ref } from 'vue';

  const methods = ref(${lowerModuleName});
  </script>

  # ${moduleName}

  <!-- This file is automatically generated. -->
  <!-- Run '${scriptCommand}' to update -->

  ::: v-pre

  ${comment}

  :::

  <ul>
    <li v-for="method of methods" :key="method.name">
      <a :href="'#' + method.name">{{ method.title }}</a>
    </li>
  </ul>

  <ApiDocsMethod v-for="method of methods" :key="method.name" :method="method" v-once />
  `.replace(/\n +/g, '\n');

  content = vitePressInFileOptions + formatMarkdown(content);

  writeFileSync(resolve(pathOutputDir, lowerModuleName + '.md'), content);
}

/**
 * Writes the api page for the given method to the correct location.
 *
 * @param methodName The name of the method to write the docs for.
 */
export function writeApiDocsDirectPage(methodName: string): void {
  let content = `
  <script setup>
  import ApiDocsMethod from '../.vitepress/components/api-docs/method.vue'
  import { ${methodName} } from './${methodName}'
  import { ref } from 'vue';

  const methods = ref(${methodName});
  </script>

  <ApiDocsMethod v-for="method of methods" :key="method.name" :method="method" v-once />
  `.replace(/\n +/g, '\n');

  content = vitePressInFileOptions + formatMarkdown(content);

  writeFileSync(resolve(pathOutputDir, methodName + '.md'), content);
}

/**
 * Writes the api docs data to correct location.
 *
 * @param lowerModuleName The lowercase name of the module.
 * @param methods The methods data to save.
 */
export function writeApiDocsData(
  lowerModuleName: string,
  methods: Method[]
): void {
  let contentTs = `
import type { Method } from '../.vitepress/components/api-docs/method';

export const ${lowerModuleName}: Method[] = ${JSON.stringify(
    methods,
    null,
    2
  )}`;

  contentTs = formatTypescript(contentTs);

  writeFileSync(resolve(pathOutputDir, lowerModuleName + '.ts'), contentTs);
}

/**
 * Writes the api docs index to correct location.
 *
 * @param pages The pages to write into the index.
 */
export function writeApiPagesIndex(pages: PageIndex): void {
  // Write api-pages.ts
  console.log('Updating api-pages.ts');
  pages.sort((a, b) => a.text.localeCompare(b.text));
  let apiPagesContent = `
    // This file is automatically generated.
    // Run '${scriptCommand}' to update
    export const apiPages = ${JSON.stringify(pages)};
    `.replace(/\n +/, '\n');

  apiPagesContent = formatTypescript(apiPagesContent);

  writeFileSync(pathDocsApiPages, apiPagesContent);
}
