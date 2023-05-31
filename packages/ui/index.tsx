import "antd/dist/reset.css";
import "./theme";

export * from "antd";
import Button from "./components/Button";
export { default as Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";
export { default as Collapse } from "./components/Collapse";
export { default as Splitter } from "./components/Splitter";
export { default as TableVirtual } from "./components/TableVirtual";
export * from "./components/ContextMenu";
export type { SplitterProps } from "./components/Splitter";
import Table from "./components/Table";
import Tabs from "./components/Tabs";
import Modal from "./components/Modal";
import Editor from "./components/Editor";
import List from "./components/List";
import { theme } from "antd";

// typescript limitation https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1519138189
const useToken: (typeof theme)["useToken"] = theme.useToken;
// const { useToken } = theme;

export { Button, Table, Tabs, Modal, Editor, List, useToken };
