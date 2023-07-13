/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from "react";
import hash from "@emotion/hash";
import { CSSInterpolation } from "@ant-design/cssinjs";
import {
  Theme,
  CSSInterpolation as EsCSSInterpolation,
} from "@ant-design/cssinjs/es";
import StyleContext, {
  ATTR_DEV_CACHE_PATH,
  ATTR_MARK,
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
} from "@ant-design/cssinjs/es/StyleContext";
import useGlobalCache from "@ant-design/cssinjs/es/hooks/useGlobalCache";
import {
  normalizeStyle,
  parseStyle,
} from "@ant-design/cssinjs/es/hooks/useStyleRegister";
import {
  updateCSS,
  removeCSS,
  Prepend,
  ContainerType,
} from "rc-util/lib/Dom/dynamicCSS";
import canUseDom from "rc-util/lib/Dom/canUseDom";

const isClientSide = canUseDom();

// ============================================================================
// ==                                Register                                ==
// ============================================================================
function uniqueHash(path: (string | number)[], styleStr: string) {
  return hash(`${path.join("%")}${styleStr}`);
}

function Empty() {
  return null;
}

/**
 * Find style which inject by rc-util
 */
function findStyles(container: ContainerType) {
  return Array.from(container.children).filter(function (node) {
    return node.tagName === "STYLE";
  });
}

function getContainer(option: Parameters<typeof updateCSS>[2] = {}) {
  if (option.attachTo) {
    return option.attachTo;
  }
  const head = document.querySelector("head");
  return head || document.body;
}

const APPEND_ORDER = "data-rc-order";
const APPEND_ATND_ORDER = "data-append-antd-order";
const appendToAntdType = (
  node: HTMLStyleElement,
  option: Parameters<typeof updateCSS>[2] = {}
) => {
  // prevent antd style priority higher than custom style
  node.removeAttribute(APPEND_ORDER);

  node.setAttribute(APPEND_ATND_ORDER, "");
  const container = getContainer(option);
  let firstAntdNode: Element | null = null;
  let firstAppendAntdNode: Element | null = null;
  for (const node of findStyles(container)) {
    if (!firstAntdNode && node.hasAttribute(APPEND_ORDER)) {
      firstAntdNode = node;
    }
    if (!firstAppendAntdNode && node.hasAttribute(APPEND_ATND_ORDER)) {
      firstAppendAntdNode = node;
      break;
    }
  }
  // const existStyle = findStyles(container).findLast(function (node) {
  // });
  if (firstAppendAntdNode) {
    container.insertBefore(node, firstAppendAntdNode);
    return node;
  }
  if (firstAntdNode) {
    container.insertBefore(node, firstAntdNode.nextSibling);
    return node;
  }
  const firstChild = container.firstChild;
  container?.insertBefore(node, firstChild);
};

/**
 * Register a style to the global style sheet.
 */
export default function useStyleRegister(
  info: {
    theme: Theme<any, any>;
    token: any;
    path: string[];
    hashId?: string;
    layer?: string;
    prepend?: Prepend;
    reverseQueue?: boolean;
    nonce?: string | (() => string);
  },
  styleFn: () => CSSInterpolation
) {
  const {
    token,
    path,
    hashId,
    layer,
    prepend = "queue",
    reverseQueue = true,
    nonce,
  } = info;
  const {
    autoClear,
    mock,
    defaultCache,
    hashPriority,
    container,
    ssrInline,
    transformers,
    linters,
    cache,
  } = React.useContext(StyleContext);
  const tokenKey = token._tokenKey as string;

  const fullPath = [tokenKey, ...path];

  // Check if need insert style
  let isMergedClientSide = isClientSide;
  if (!import.meta.env.PROD && mock !== undefined) {
    isMergedClientSide = mock === "client";
  }

  const [cachedStyleStr, cachedTokenKey, cachedStyleId] = useGlobalCache(
    "style",
    fullPath,
    // Create cache if needed
    () => {
      const styleObj = styleFn();
      const [parsedStyle, effectStyle] = parseStyle(
        styleObj as EsCSSInterpolation,
        {
          hashId,
          hashPriority,
          layer,
          path: path.join("-"),
          transformers,
          linters,
        }
      );
      const styleStr = normalizeStyle(parsedStyle);
      const styleId = uniqueHash(fullPath, styleStr);

      if (isMergedClientSide) {
        const mergedCSSConfig: Parameters<typeof updateCSS>[2] = {
          mark: ATTR_MARK,
          prepend,
          attachTo: container,
        };

        const nonceStr = typeof nonce === "function" ? nonce() : nonce;

        if (nonceStr) {
          mergedCSSConfig.csp = { nonce: nonceStr };
        }

        const style = updateCSS(styleStr, styleId, mergedCSSConfig);
        if (reverseQueue) {
          appendToAntdType(style);
        }
        (style as any)[CSS_IN_JS_INSTANCE] = cache.instanceId;

        // Used for `useCacheToken` to remove on batch when token removed
        style.setAttribute(ATTR_TOKEN, tokenKey);

        // Dev usage to find which cache path made this easily
        if (!import.meta.env.PROD) {
          style.setAttribute(ATTR_DEV_CACHE_PATH, fullPath.join("|"));
        }

        // Inject client side effect style
        Object.keys(effectStyle).forEach((effectKey) => {
          updateCSS(
            normalizeStyle(effectStyle[effectKey]),
            `_effect-${effectKey}`,
            mergedCSSConfig
          );
        });
      }

      return [styleStr, tokenKey, styleId];
    },
    // Remove cache if no need
    ([, , styleId], fromHMR) => {
      if ((fromHMR || autoClear) && isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK });
      }
    }
  );

  const renderNodeWithStyleIfNeed = (node: React.ReactNode) => {
    let styleNode: React.ReactElement;

    if (!ssrInline || isMergedClientSide || !false) {
      styleNode = <Empty />;
    } else {
      styleNode = (
        <style
          {...{
            [ATTR_TOKEN]: cachedTokenKey,
            [ATTR_MARK]: cachedStyleId,
          }}
          dangerouslySetInnerHTML={{ __html: cachedStyleStr }}
        />
      );
    }

    return (
      <>
        {styleNode}
        {node}
      </>
    );
  };

  return renderNodeWithStyleIfNeed;
}
