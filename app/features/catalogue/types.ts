export type ResourceKind = "tool" | "game";
export interface Resource {
  id: string;
  kind: ResourceKind;
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  route: string;
  sourcePath: string;
  artwork?: string;
  processing: string;
  tags: string[];
  aliases: string[];
}
