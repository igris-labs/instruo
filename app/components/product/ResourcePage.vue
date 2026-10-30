<script setup lang="ts">
import type { ResourceKind } from "../../features/catalogue/types";
import { categoryPresentation } from "../../features/catalogue/presentation";
import { featureViews } from "../../features/catalogue/views";
import { Accordion } from "../ui/accordion";
import { Button } from "../ui/button";
const props = defineProps<{ kind: ResourceKind }>();
const route = useRoute();
const { data: catalogue } = await useCatalogue();
const resource = computed(() =>
  (catalogue.value ?? []).find(
    (item) => item.kind === props.kind && item.slug === route.params.slug,
  ),
);
if (!resource.value) throw createError({ statusCode: 404, statusMessage: "Resource not found" });
const view = computed(() => featureViews[resource.value!.id as keyof typeof featureViews]);
if (!view.value) throw createError({ statusCode: 500, statusMessage: "Workspace unavailable" });
const { data: document } = await useAsyncData(
  () => `resource-help:${resource.value?.id}`,
  () =>
    queryCollection(props.kind === "game" ? "games" : "tools")
      .path(resource.value!.sourcePath)
      .first(),
);
useHead({ title: computed(() => resource.value?.title ?? "Instruo") });
</script>
<template>
  <article v-if="resource">
    <header class="mb-10 max-w-3xl">
      <nav
        aria-label="Breadcrumb"
        class="text-muted-foreground mb-5 flex flex-wrap items-center gap-2 text-xs lg:hidden"
      >
        <NuxtLink
          :to="kind === 'game' ? '/games' : '/tools'"
          class="hover:text-foreground focus-visible:outline-ring inline-flex items-center gap-1.5 rounded-sm py-1 focus-visible:outline-1"
          ><Icon
            name="tabler:arrow-left"
            mode="svg"
            class="size-3.5"
            aria-hidden="true"
          />{{ kind === "game" ? "Games" : "Tools" }}</NuxtLink
        >
        <span aria-hidden="true">/</span>
        <NuxtLink
          :to="{
            path: kind === 'game' ? '/games' : '/tools',
            query: { category: resource.category },
          }"
          class="hover:text-foreground focus-visible:outline-ring rounded-sm py-1 focus-visible:outline-1"
          >{{
            kind === "tool"
              ? (categoryPresentation[resource.category]?.label ?? resource.category)
              : resource.category
          }}</NuxtLink
        >
      </nav>
      <div class="flex items-center gap-3.5">
        <div
          class="bg-muted text-highlighted grid size-12 shrink-0 place-items-center rounded-lg lg:hidden"
        >
          <Icon
            :name="resource.icon"
            mode="svg"
            class="size-7"
            aria-hidden="true"
          />
        </div>
        <h1
          class="text-highlighted text-2xl font-semibold tracking-tight lg:text-[2rem] lg:leading-10"
        >
          {{ resource.title }}
        </h1>
      </div>
      <p class="text-muted-foreground mt-3 text-[15px] leading-7">{{ resource.description }}</p>
    </header>
    <section
      id="workspace"
      class="scroll-mt-24"
      :aria-label="kind === 'tool' ? 'Tool workspace' : 'Game workspace'"
    >
      <NuxtErrorBoundary :key="resource.id">
        <component :is="view" />
        <template #error="{ clearError }">
          <section
            role="alert"
            class="bg-muted rounded-lg p-5"
          >
            <h2 class="font-medium">This workspace could not load</h2>
            <p class="text-muted-foreground mt-2 text-sm">
              Try loading it again. Your files have not been uploaded.
            </p>
            <Button
              class="mt-4"
              color="secondary"
              variant="outline"
              @click="clearError"
              >Try again</Button
            >
          </section>
        </template>
      </NuxtErrorBoundary>
    </section>
    <Accordion
      v-if="document?.body?.value?.length"
      id="details"
      class="mt-10"
      :items="[
        { value: 'help', label: kind === 'game' ? 'Rules and details' : 'How this tool works' },
      ]"
      collapsible
    >
      <template #content
        ><ContentRenderer
          :value="document"
          class="[&_p]:text-muted-foreground max-w-3xl text-sm leading-7 [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-medium [&_ol]:list-decimal [&_ol]:pl-5"
      /></template>
    </Accordion>
  </article>
</template>
