import {
  Button,
  Card,
  List,
  Select,
  SortableList,
  Space,
  Table,
  useToken,
} from "ui";
import { Global } from "@emotion/react";

function App() {
  const { token } = useToken();
  return (
    <>
      <Global
        styles={{
          ["body"]: {
            background: token.colorBgContainer,
          },
        }}
      />
      <Card title="Button">
        <Space>
          <Button>normal</Button>
          <Button type="primary">primary</Button>
          <Button type="text">text</Button>
          <Button type="link">link</Button>
        </Space>
      </Card>
      <Card title="Select">
        <Space>
          <Select
            style={{ width: 200 }}
            value={"hello"}
            open
            options={[
              {
                label: "hello",
                value: "hello",
              },
              {
                label: "hello1",
                value: "hello1",
              },
            ]}
          ></Select>
        </Space>
      </Card>
      <Card title="Table">
        <Table
          columns={[
            {
              title: "name",
              dataIndex: "name",
            },
            {
              title: "age",
              dataIndex: "age",
            },
          ]}
          rowKey={"name"}
          rowSelection={{
            selectedRowKeys: ["cole"],
            hideSelectionColumn: true,
          }}
          dataSource={[
            { name: "cole", age: "18" },
            { name: "cole1", age: "18" },
            { name: "col2", age: "18" },
          ]}
        />
      </Card>
      <Card title="List">
        <Card title="List">
          <List
            activeKey={"cole"}
            rowKey={"name"}
            selectable
            dataSource={[
              { name: "cole", age: "18" },
              { name: "cole1", age: "18" },
              { name: "col2", age: "18" },
            ]}
            renderItem={({ name, age }) => (
              <List.Item>
                <span>
                  {name}: {age}
                </span>
              </List.Item>
            )}
          ></List>
        </Card>
        <Card title="sortable list">
          <SortableList
            activeKey={"cole"}
            rowKey={"name"}
            dataSource={[
              { name: "cole", age: "18" },
              { name: "cole1", age: "18" },
              { name: "col2", age: "18" },
            ]}
            renderItem={({ name, age }) => (
              <SortableList.Item>
                <span>
                  {name}: {age}
                </span>
              </SortableList.Item>
            )}
          ></SortableList>
        </Card>
      </Card>
    </>
  );
}

export default App;
