import { defineMarkdocConfig, nodes, Markdoc } from '@astrojs/markdoc/config';
import GithubSlugger from 'github-slugger';

// Reproduce Astro's previous markdown output for the events + discover collections so the
// migration to Markdoc is content-identical:
//  - typographer:true (astro.config.mjs) restores the smart quotes / ellipsis.
//  - the custom `heading` node below restores rehype-slug's `id` on every heading. Every
//    heading is unique within each document (verified), so a fresh slugger per heading
//    produces exactly the same slug rehype-slug did (no cross-heading collision counters).

function headingText(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(headingText).join('');
  if (children && typeof children === 'object' && 'children' in children) return headingText(children.children);
  return '';
}

export default defineMarkdocConfig({
  nodes: {
    // Markdoc's default `document` node wraps the body in <article>; the old markdown pipeline
    // emitted the block sequence bare (the page template provides its own wrapper). Render the
    // children directly so the DOM — and the .article-body CSS — is unchanged.
    document: {
      ...nodes.document,
      transform(node, config) {
        return node.transformChildren(config);
      },
    },
    heading: {
      ...nodes.heading,
      transform(node, config) {
        // `level` is consumed to pick the tag name (h1–h6) — it must NOT be spread onto the
        // element, or Markdoc emits a stray level="N" attribute the old markdown pipeline never
        // produced. Drop it and keep any genuine attributes, then add rehype-slug's id.
        const { level, ...attributes } = node.transformAttributes(config);
        const children = node.transformChildren(config);
        const id = new GithubSlugger().slug(headingText(children));
        return new Markdoc.Tag(`h${node.attributes.level}`, { ...attributes, id }, children);
      },
    },
  },
});
