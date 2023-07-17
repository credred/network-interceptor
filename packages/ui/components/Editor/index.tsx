import * as monaco from "monaco-editor";
import MonacoEditor, { loader } from "@monaco-editor/react";
import type * as EditorType from "@monaco-editor/react";
import React, { FC, useRef, useState } from "react";
import { useMemoizedFn, useUpdateEffect } from "ahooks";
import classNames from "classnames";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import useElementWithStyle, { RenderNode } from "./style";
import { usePrefixCls } from "../_utils/usePrefixCls";
import Button from "../Button";
import CursorPosition from "./components/CursorPosition";

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
   * Editor will init value again if seed change
   */
  seed?: React.Key;
  /**
   * auto format when editor mounted or seed changed
   */
  autoFormat?: boolean;
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

const useAutoFormat = (
  autoFormat: boolean,
  seed: React.Key | undefined,
  formatCode: () => Promise<void> | undefined
) => {
  const isAutoFormattingRef = useRef(false);

  const tryFormatCode = async () => {
    if (autoFormat) {
      isAutoFormattingRef.current = true;
      await formatCode();
      isAutoFormattingRef.current = false;
    }
  };

  const wrapperOnChange = <T extends unknown[], R>(
    onChange: (...args: T) => R
  ) => {
    return (...args: T): R | void => {
      if (isAutoFormattingRef.current) {
        // formatCode().then will reset isAutoFormattingRef
        // isAutoFormattingRef.current = false
        return;
      }
      return onChange(...args);
    };
  };

  useUpdateEffect(() => {
    void tryFormatCode();
  }, [seed]);

  return { tryFormatCode, wrapperOnChange };
};

const Editor: FC<EditorProps> = (props) => {
  const {
    seed,
    toolbar = true,
    autoFormat = false,
    flex,
    prefixCls,
    onValueChange,
    ...editorProps
  } = props;
  const { prefixCls: componentCls, genCls } = usePrefixCls("editor", prefixCls);
  const { value } = props;

  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const formatCode = () => {
    return editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  const { tryFormatCode, wrapperOnChange } = useAutoFormat(
    autoFormat,
    seed,
    formatCode
  );

  const onEditorMount: EditorType.OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditor(editor);

    const disposer = editor.onDidChangeModelLanguageConfiguration(() => {
      // hack for ready event
      // https://github.com/microsoft/monaco-editor/issues/115
      void tryFormatCode();
      disposer.dispose();
    });
    props.onMount?.(editor, monaco);
  };

  const onChange: EditorType.OnChange = useMemoizedFn(
    wrapperOnChange((newValue, ev) => {
      if (newValue !== value) {
        props.onChange?.(newValue, ev);
      }
      onValueChange?.(newValue, ev);
    })
  );

  const renderNode: RenderNode = (classes) => (
    <div className={classNames(classes, componentCls, flex && genCls("flex"))}>
      <div className={genCls("core")}>
        <MonacoEditor
          {...editorProps}
          options={{
            formatOnPaste: true,
            formatOnType: true,
            fixedOverflowWidgets: true,
            ...editorProps.options,
          }}
          onMount={onEditorMount}
          onChange={onChange}
        />
      </div>
      {toolbar && (
        <div className={genCls("toolbar")}>
          <Button type="text" onClick={() => void formatCode()}>
            {"{ }"}
          </Button>
          <CursorPosition editor={editor} />
        </div>
      )}
    </div>
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

export default Editor;
