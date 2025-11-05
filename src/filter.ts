import { saveConf } from "./config";
import { IMGFetcher } from "./img-fetcher";
import { ADAPTER } from "./platform/adapt";

export class Filter {
  values: FilterNode[] = [];
  allTags: Set<Tag> = new Set();
  onChange?: (filter: Filter) => void;
  constructor() {
    if (ADAPTER.conf.filterTags && ADAPTER.conf.filterTags.length > 0) {
      this.values = ADAPTER.conf.filterTags.map(ft => {
        const exclude = ft.startsWith("!");
        const tag = exclude ? ft.slice(1) : ft;
        return { exclude, tag };
      })
    }
  }
  filterNodes(imfs: IMGFetcher[], clearAllTags: boolean): IMGFetcher[] {
    if (!ADAPTER.conf.enableFilter) return imfs;
    let list = imfs;
    for (const val of this.values) {
      list = list.filter(imf => {
        for (const t of imf.node.tags) {
          if (t === val.tag) {
            return !val.exclude && true;
          }
        }
        return val.exclude;
      });
    }
    if (clearAllTags) {
      this.allTags.clear();
    }
    list.forEach(imf => imf.node.tags.forEach(tag => this.allTags.add(tag)));
    return list;
  }
  push(exclude: boolean, tag: Tag) {
    const exists = this.values.find(v => v.tag === tag);
    if (exists) return;
    this.values.push({ exclude, tag });
    this.onChange?.(this);
    saveConf({ filterTags: this.values.map(t => t.exclude ? "!" + t.tag : t.tag) }, ADAPTER.matcher!.name);
  }
  remove(tag: Tag) {
    const index = this.values.findIndex(v => v.tag === tag);
    if (index > -1) {
      this.values.splice(index, 1);
      this.onChange?.(this);
      saveConf({ filterTags: this.values.map(t => t.exclude ? "!" + t.tag : t.tag) }, ADAPTER.matcher!.name);
    }
  }
  clear() {
    this.values = [];
    this.onChange?.(this);
    saveConf({ filterTags: this.values.map(t => t.exclude ? "!" + t.tag : t.tag) }, ADAPTER.matcher!.name);
  }
}

class FilterNode {
  exclude: boolean;
  tag: Tag;
  constructor(tag: Tag, exclude: boolean) {
    this.exclude = exclude;
    this.tag = tag;
  }
}

// export type TagCategory = "mime-type" | "misc" | "author" | "language" | string;

export type Tag = string;
