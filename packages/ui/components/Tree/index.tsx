import { Tree as AntdTree, TreeProps as AntdTreeProps } from "antd";
import { DataNode } from "antd/es/tree";
import classNames from "classnames";
import React from "react";
import { usePrefixCls } from "../_utils/usePrefixCls";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

interface TreeProps<T extends DataNode = DataNode> extends AntdTreeProps<T> {
  /**
   * compact layout
   * @default false
   */
  compact?: boolean;
}

export type TreeRef = NonNullable<
  Parameters<typeof AntdTree>[0]["ref"]
> extends React.Ref<infer R>
  ? R
  : never;

const InternalTree = <T extends DataNode = DataNode>(
  props: React.PropsWithChildren<TreeProps<T>>,
  ref: React.ForwardedRef<TreeRef>
) => {
  const { compact, className, ...restProps } = props;
  const { genCls } = usePrefixCls("tree");

  const renderNode: RenderNode = (classes) => (
    <AntdTree
      ref={ref}
      className={classNames(classes, className, compact && genCls("compact"))}
      {...restProps}
    />
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

type CompoundedComponent = (<T extends DataNode = DataNode>(
  props: React.PropsWithChildren<TreeProps<T>> & { ref?: React.Ref<TreeRef> }
) => React.ReactElement) & {
  TreeNode: typeof AntdTree.TreeNode;
  DirectoryTree: typeof AntdTree.DirectoryTree;
};

const Tree = React.forwardRef(InternalTree) as unknown as CompoundedComponent;
Tree.DirectoryTree = AntdTree.DirectoryTree;
Tree.TreeNode = AntdTree.TreeNode;

export default Tree;
