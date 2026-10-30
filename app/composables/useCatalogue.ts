import type { Resource, ResourceKind } from "../features/catalogue/types";

export function useCatalogue() {
  return useAsyncData("instruo-catalogue", async () => {
    const [tools, games] = await Promise.all([
      queryCollection("tools")
        .select(
          "resourceId",
          "path",
          "title",
          "description",
          "category",
          "icon",
          "tags",
          "aliases",
          "processing",
        )
        .all(),
      queryCollection("games")
        .select(
          "resourceId",
          "path",
          "title",
          "description",
          "category",
          "icon",
          "tags",
          "aliases",
          "processing",
        )
        .all(),
    ]);
    const map = (items: typeof tools, kind: ResourceKind): Resource[] =>
      items.map((item) => {
        const slug = item.path.split("/").at(-1)!;
        return {
          id: item.resourceId,
          kind,
          slug,
          title: item.title,
          description: item.description ?? "",
          category: item.category,
          icon:
            item.icon?.replace(/^i-tabler-/, "tabler:") ??
            (kind === "tool" ? "tabler:tool" : "tabler:device-gamepad-2"),
          route: `/${kind === "tool" ? "tools" : "games"}/${slug}`,
          sourcePath: item.path,
          artwork: kind === "game" ? `/game-arts/${slug}.jpg` : undefined,
          processing: item.processing ?? "local",
          tags: item.tags,
          aliases: item.aliases ?? [],
        };
      });
    return [...map(tools, "tool"), ...map(games, "game")].sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  });
}
