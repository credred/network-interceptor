import { runtime } from "webextension-polyfill";

const insertScript = (path: string) => {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", runtime.getURL(path));
  document.documentElement.appendChild(script);

  return new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject());
  });
};

export default insertScript;
