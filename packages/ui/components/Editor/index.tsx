import * as monaco from "monaco-editor";
import MonacoEditor, { loader } from "@monaco-editor/react";
import type * as EditorType from "@monaco-editor/react";
import { FC, useRef } from "react";
import { useMemoizedFn } from "ahooks";
import classNames from "classnames";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import useElementWithStyle, { RenderNode } from "./style";
import { usePrefixCls } from "../_utils/usePrefixCls";
import Button from "../Button";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });

interface EditorProps extends EditorType.EditorProps {
  /**
   * the wrapper style should be flex-grow: 1; or height: 100%;
   */
  flex?: boolean;
  prefixCls?: string;
  /** show toolbar */
  toolbar?: boolean;
  /** An event is emitted when the content of the current model is changed by user input */
  onChange?: EditorType.OnChange;
  /** An event is emitted when the content of the current model is changed */
  onValueChange?: EditorType.OnChange;
}

const Editor: FC<EditorProps> = (props) => {
  const {
    toolbar = true,
    flex,
    prefixCls,
    onValueChange,
    ...editorProps
  } = props;
  const { prefixCls: componentCls, genCls } = usePrefixCls("editor", prefixCls);
  const { value } = props;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const formatCode = () => {
    void editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  const onEditorMount: EditorType.OnMount = (editor, monaco) => {
    editorRef.current = editor;
    props.onMount?.(editor, monaco);
  };

  const onChange: EditorType.OnChange = useMemoizedFn((newValue, ev) => {
    if (newValue !== value) {
      props.onChange?.(newValue, ev);
    }
    onValueChange?.(newValue, ev);
  });

  const renderNode: RenderNode = (classes) => (
    <div
      className={classNames(
        "flex flex-col min-h-0",
        flex ? "flex-1" : "h-full",
        classes,
        componentCls
      )}
    >
      <div className="min-h-0 flex-1">
        <MonacoEditor
          options={{
            formatOnPaste: true,
            formatOnType: true,
          }}
          {...editorProps}
          onMount={onEditorMount}
          onChange={onChange}
        />
      </div>
      {toolbar && (
        <div className={genCls("toolbar")}>
          <Button type="text" onClick={() => formatCode()}>
            {"{ }"}
          </Button>
        </div>
      )}
    </div>
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

export default Editor;
