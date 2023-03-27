import { memo, useEffect, useMemo, useRef, useState } from "react";
import { initRule, NetworkRule } from "common/network-rule";
import {
  METHOD_OPTIONS,
  STATUS_CODE_OPTIONS,
} from "common/constants/options.constant";
import lang from "common/lang";
import {
  Button,
  Checkbox,
  ContextMenu,
  ContextMenuItem,
  Editor,
  Empty,
  Input,
  List,
  Select,
  Tabs,
  useContextMenu,
} from "ui";
import { useForm, Controller } from "react-hook-form";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { request } from "../utils/request";

interface LinkRule {
  value: NetworkRule;
  pre?: LinkRule;
  next?: LinkRule;
}

const generateLinkRules = (rules: NetworkRule[]): Record<string, LinkRule> => {
  const linkRule: Record<string, LinkRule> = {};
  let preLinkRule: LinkRule | undefined = undefined;
  for (const currentRule of rules) {
    const ruleId = currentRule.id;
    const currentLinkRule: LinkRule = (linkRule[ruleId] = {
      value: currentRule,
      pre: preLinkRule,
    });
    if (preLinkRule) {
      preLinkRule.next = currentLinkRule;
    }
    preLinkRule = currentLinkRule;
  }

  return linkRule;
};

const useRuleContextMenu = (handleDeleteRule: (ruleId?: string) => void) => {
  const activeRuleRef = useRef<NetworkRule>();
  const MENU_ID = "NetworkRulesItem";

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const showContextMenu = (
    rule: NetworkRule,
    params: Parameters<typeof show>[0]
  ) => {
    show(params);
    activeRuleRef.current = rule;
  };

  const contextMenuNode = (
    <ContextMenu id={MENU_ID}>
      <ContextMenuItem
        icon={<DeleteOutlined />}
        onClick={() => handleDeleteRule(activeRuleRef.current?.id)}
      >
        <span>Delete</span>
      </ContextMenuItem>
    </ContextMenu>
  );

  return { showContextMenu, contextMenuNode };
};

const NetworkRules: React.FC = () => {
  const [rules, setRules] = useState<NetworkRule[]>([]);
  const linkRules = useMemo(() => generateLinkRules(rules), [rules]);
  const [activeRule, setActiveRule] = useState<NetworkRule>();

  useEffect(() => {
    const subscription = request.rules$.subscribe((rules) => {
      setRules(rules);
    });

    return () => subscription.unsubscribe();
  });

  useEffect(() => {
    if (!activeRule) {
      setActiveRule(rules[0]);
    } else {
      // rules updated. update activeRule data
      const newActiveRule = rules.find((rule) => rule.id === activeRule.id);
      if (newActiveRule) {
        setActiveRule(newActiveRule);
      } else {
        handleDeleteRule(activeRule.id);
      }
    }
  }, [rules]);

  const { control, reset, watch } = useForm<NetworkRule>();

  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type !== "change" || !value) return;
      void request.updateRule(value as NetworkRule);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleDeleteRule = (ruleId?: string) => {
    if (ruleId) {
      void request.deleteRule(ruleId);
      const linkRule = linkRules[ruleId];
      setActiveRule(linkRule.next?.value || linkRule.pre?.value);
    }
  };

  const handleNewRule = () => {
    const rule = initRule();
    void request.createRule(rule).then(() => {
      setActiveRule(rule);
    });
  };

  useEffect(() => {
    // defaultValue will be modified if keepDefaultValues is not true
    reset(activeRule, { keepDefaultValues: true });
  }, [activeRule]);

  const { showContextMenu, contextMenuNode } =
    useRuleContextMenu(handleDeleteRule);

  return (
    <div className="flex h-full min-h-[200px]">
      <List
        rowKey="id"
        header={
          <Button type="text" icon={<PlusOutlined />} onClick={handleNewRule}>
            New Rule
          </Button>
        }
        className="w-[260px] h-full"
        selectable
        compact
        bordered
        activeKey={activeRule?.id}
        dataSource={rules}
        onChange={(_, rule) => {
          setActiveRule(rule);
        }}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            onContextMenu={(event) => showContextMenu(item, { event })}
          >
            <div className="truncate">{item.baseMatchRule.path}</div>
            <div>{item.baseMatchRule.method}</div>
          </List.Item>
        )}
      ></List>
      {contextMenuNode}
      <section className="flex-1 min-w-0 mx-2">
        {activeRule ? (
          <div className="flex gap-2 flex-col h-full">
            <div className="flex gap-2">
              <Controller
                control={control}
                name="baseMatchRule.method"
                render={({ field }) => (
                  <Select
                    {...field}
                    className="w-[100px]"
                    options={METHOD_OPTIONS}
                  />
                )}
              />
              <Controller
                control={control}
                name="baseMatchRule.path"
                render={({ field }) => (
                  <Input
                    {...field}
                    className="flex-1"
                    placeholder={lang.rule.pathPlaceHolder}
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="modifyInfo.continueRequest"
              render={({ field }) => (
                <Checkbox className="self-start" {...field}>
                  Continue Request
                </Checkbox>
              )}
            />
            <Tabs
              className="flex-1 min-h-0"
              fullHeight={true}
              items={[
                {
                  label: "Response",
                  key: "response",
                  children: (
                    <div className="flex flex-col gap-2 h-full">
                      <Controller
                        control={control}
                        name="modifyInfo.response.status"
                        render={({ field }) => (
                          <Select {...field} className="w-[250px]" showSearch>
                            {STATUS_CODE_OPTIONS.map((group) => (
                              <Select.OptGroup
                                key={group.label}
                                label={group.label}
                              >
                                {group.children.map((item) => (
                                  <Select.Option
                                    key={`${group.label}-${item.value}`}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </Select.Option>
                                ))}
                              </Select.OptGroup>
                            ))}
                          </Select>
                        )}
                      />
                      <Controller
                        control={control}
                        name="modifyInfo.response.responseBody"
                        render={({ field: { ref, ...field } }) => (
                          <Editor
                            {...field}
                            flex
                            theme="vs-dark"
                            language="json"
                          ></Editor>
                        )}
                      />
                    </div>
                  ),
                },
                {
                  label: "Response Headers",
                  key: "response headers",
                },
                {
                  label: "Request",
                  key: "request",
                },
                {
                  label: "Request Headers",
                  key: "request headers",
                },
              ]}
            ></Tabs>
          </div>
        ) : (
          <Empty
            description={"No rule defined"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </section>
    </div>
  );
};

export default memo(NetworkRules);
