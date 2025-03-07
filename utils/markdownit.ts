import markdownit from "markdown-it";
import Shiki from "@shikijs/markdown-it";

export const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
});

md.use(
  await Shiki({
    langs: ["md"],
    themes: {
      light: "dracula",
      dark: "dracula",
    },
  })
);

export const mdToHtml = (markdown: string) => {
  return md.render(markdown);
};
