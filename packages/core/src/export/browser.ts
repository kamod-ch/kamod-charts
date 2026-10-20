export const assertBrowser = (apiName: string): void => {
  if (
    typeof globalThis.document === "undefined" ||
    typeof globalThis.XMLSerializer === "undefined"
  ) {
    throw new Error(`[kamod-charts] ${apiName} requires a browser environment with DOM APIs.`);
  }
};
