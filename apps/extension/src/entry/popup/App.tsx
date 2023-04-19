import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Layout, useToken } from "ui";
import { useLocalStorageState } from "../../hooks/useExtensionStorageState";

function App() {
  const [allSiteEnabled, setAllSiteEnabled] = useLocalStorageState(
    "allSiteEnabled",
    true
  );
  const { token } = useToken();

  return (
    <div>
      <Layout.Content>
        <div className="flex flex-col gap-2 bg-gray-700">
          <div className="flex flex-col">
            <Button
              type="text"
              style={{
                color: allSiteEnabled
                  ? token.colorText
                  : token.colorTextDisabled,
              }}
              icon={
                allSiteEnabled ? (
                  <CheckOutlined style={{ color: token.colorSuccess }} />
                ) : (
                  <CloseOutlined style={{ color: token.colorError }} />
                )
              }
              onClick={() => setAllSiteEnabled(!allSiteEnabled)}
            >
              Enabled
            </Button>
          </div>
        </div>
      </Layout.Content>
    </div>
  );
}

export default App;
