import * as monaco from "monaco-editor";
import MonacoEditor, { loader } from "@monaco-editor/react";
import type * as EditorType from "@monaco-editor/react";
import { FC, useRef } from "react";
import { Button } from "antd";
import { usePrevious } from "ahooks";

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
  const { value } = props
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const isUserInputRef = useRef(true)

  const previousValue = usePrevious(value)

  if (value !== previousValue) {
    isUserInputRef.current = false
  }

  const formatCode = () => {
    void editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  const onEditorMount: EditorType.OnMount = (editor, monaco) => {
    editorRef.current = editor;
    props.onMount?.(editor, monaco);
  };

  const onChange: EditorType.OnChange = (newValue, ev) => {
    if (isUserInputRef.current) {
      props.onChange?.(newValue, ev);
    } else {
      isUserInputRef.current = true
    }
    onValueChange?.(newValue, ev);
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
