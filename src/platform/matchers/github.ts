import ImageNode from "../../img-node";
import { Chapter } from "../../page-fetcher";
import { ADAPTER } from "../adapt";
import { BaseMatcher, OriginMeta, Result } from "../platform";

type GHImage = {
  name: string,
  url: string,
}

class GithubMatcher extends BaseMatcher<GHImage[]> {
  async *fetchChapters(): AsyncGenerator<Chapter[]> {
    yield [new Chapter(1, "README", window.location.href)];
  }
  async *fetchPagesSource(chapter: Chapter): AsyncGenerator<Result<GHImage[]>> {
    if (chapter.title === "README") {
      const images = Array.from(document.querySelectorAll<HTMLImageElement>("article.markdown-body img"));
      const ret = images.map((img, i) => {
        const src = img.src;
        if (!src) return undefined;
        const name = src.split("/").pop() ?? (i + 1) + ".jpg";
        return { name, url: src };
      }).filter(img => img !== undefined);
      yield Result.ok(ret);
    } else {
      yield Result.ok([]);
    }
  }
  async parseImgNodes(images: GHImage[]): Promise<ImageNode[]> {
    return images.map((img) => new ImageNode("", img.url, img.name, undefined, img.url));
  }
  async fetchOriginMeta(node: ImageNode): Promise<OriginMeta> {
    return { url: node.originSrc! };
  }
}

ADAPTER.addSetup({
  match: ["github.com"],
  name: "Github",
  workURLs: [
    /github.com\/MapoMagpie\/comic-looms$/,
    // /github.com\/[\w_.-]+\/[\w_.-]+\/?$/,
  ],
  constructor: () => new GithubMatcher(),
});
