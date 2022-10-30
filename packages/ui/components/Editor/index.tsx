import * as monaco from "monaco-editor";
import MonacoEditor, { loader } from "@monaco-editor/react";
import type * as EditorType from "@monaco-editor/react";
import { FC, useRef } from "react";
import { Button } from "antd";
import { useMemoizedFn } from "ahooks";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

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
  /** show toolbar */
  toolbar?: boolean;
  /** An event is emitted when the content of the current model is changed by user input */
  onChange?: EditorType.OnChange;
  /** An event is emitted when the content of the current model is changed */
  onValueChange?: EditorType.OnChange;
}

const Editor: FC<EditorProps> = (props) => {
  const { toolbar = true, onValueChange, ...restProps } = props;
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

  return (
    <div className="h-full flex flex-col">
      <div className="min-h-0 flex-1">
        <MonacoEditor
          options={{
            formatOnPaste: true,
            formatOnType: true,
          }}
          {...restProps}
          onMount={onEditorMount}
          onChange={onChange}
        />
      </div>
      {toolbar && (
        <div>
          <Button onClick={() => formatCode()}>{"{ }"}</Button>
        </div>
      )}
    </div>
  );
};

export default Editor;
