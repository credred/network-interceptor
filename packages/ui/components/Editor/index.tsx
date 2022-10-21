import * as monaco from "monaco-editor";
import MonacoEditor, { loader } from "@monaco-editor/react";
import type * as EditorType from "@monaco-editor/react";
import { FC, useRef } from "react";
import { Button } from "antd";

loader.config({ monaco });

interface EditorProps extends EditorType.EditorProps {
  /** show toolbar */
  toolbar?: boolean;
}

const Editor: FC<EditorProps> = (props) => {
  const { toolbar = true, ...restProps } = props;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const formatCode = () => {
    void editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  const onEditorMount: EditorType.OnMount = (editor, monaco) => {
    editorRef.current = editor;
    props.onMount?.(editor, monaco);
  };

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
