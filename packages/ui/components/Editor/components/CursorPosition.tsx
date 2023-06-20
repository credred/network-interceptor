import React, { useCallback, useEffect, useState } from "react";
import * as monaco from "monaco-editor";
import { Button } from "../../..";

const CursorPosition: React.FC<{
  editor: monaco.editor.IStandaloneCodeEditor | undefined;
}> = ({ editor }) => {
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!editor) return;
    const disposer = editor.onDidChangeCursorPosition(({ position }) => {
      setPosition([position.lineNumber, position.column]);
    });

    return disposer.dispose.bind(disposer);
  }, [editor]);

  const openGotoLine = useCallback(() => {
    if (!editor) {
      import.meta.env.DEV &&
        console.warn("editor not init, cursorPosition failed to click");
      return;
    }
    editor.focus();
    void editor.getAction("editor.action.gotoLine")?.run();
  }, [editor]);

  return (
    <Button type="text" onClick={openGotoLine}>
      Ln {position[0]}, Col {position[1]}
    </Button>
  );
};

export default CursorPosition;
