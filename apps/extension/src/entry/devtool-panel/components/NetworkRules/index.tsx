import { Fragment, memo, useEffect, useMemo, useRef, useState } from "react";
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
  InputNumber,
  List,
  Select,
  Space,
  Tabs,
  useContextMenu,
  useToken,
} from "ui";
import { useForm, Controller, FormProvider, useWatch } from "react-hook-form";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { createRequest } from "../utils/request";
import HttpBadge from "./HttpBadge";
import ArrayField from "./components/ArrayField";
import uid from "tiny-uid";

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

const useStateWithUpdateRef = <S,>(
  initialState: S | (() => S)
): [
  React.MutableRefObject<boolean>,
  S,
  React.Dispatch<React.SetStateAction<S>>,
  React.Dispatch<React.SetStateAction<S>>
] => {
  const shouldUpdateRef = useRef(false);
  const [state, setState] = useState(initialState);

  const setStateWithUpdate: React.Dispatch<React.SetStateAction<S>> = (s) => {
    shouldUpdateRef.current = true;
    setState(s);
  };

  const setStateWithoutUpdate: React.Dispatch<React.SetStateAction<S>> = (
    s
  ) => {
    shouldUpdateRef.current = false;
    setState(s);
  };

  return [shouldUpdateRef, state, setStateWithUpdate, setStateWithoutUpdate];
};

const request = createRequest(uid());
const NetworkRules: React.FC = () => {
  const [
    shouldUpdateRuleRef,
    rules,
    setRulesWithUpdate,
    setRulesWithoutUpdate,
  ] = useStateWithUpdateRef<NetworkRule[]>([]);
  const linkRules = useMemo(() => generateLinkRules(rules), [rules]);
  const [activeRule, setActiveRule] = useState<NetworkRule>();
  const { token } = useToken();
  useEffect(() => {
    const subscription = request.rules$.subscribe((rules) => {
      setRulesWithUpdate(rules);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const methods = useForm<NetworkRule>();
  const { reset, watch } = methods;
  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type !== "change" || !value) return;
      void request.updateRule(value as NetworkRule, true);
      setRulesWithoutUpdate((rules) =>
        rules.map((oldRule) =>
          oldRule.id === value.id ? (value as NetworkRule) : oldRule
        )
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const continueRequest = useWatch({
    control: methods.control,
    name: "modifyInfo.continueRequest",
    exact: true,
  });

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
    if (shouldUpdateRuleRef.current) {
      // defaultValue will be modified if keepDefaultValues is not true
      reset(activeRule, { keepDefaultValues: true });
    } else {
      shouldUpdateRuleRef.current = true;
    }
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
            <div className="flex-1 w-full">
              <div className="flex justify-between">
                <div className="truncate">{item.baseMatchRule.path}</div>
                <HttpBadge value={item.baseMatchRule.method} />
              </div>
              {item.ruleName && (
                <div
                  className="truncate text-xs"
                  style={{ color: token.colorTextSecondary }}
                >
                  {item.ruleName}
                </div>
              )}
            </div>
          </List.Item>
        )}
      ></List>
      {contextMenuNode}
      <section className="flex-1 min-w-0 mx-2">
        {activeRule ? (
          <FormProvider {...methods}>
            <div className="flex gap-2 flex-col h-full">
              <div className="flex gap-2">
                <Controller
                  name="baseMatchRule.method"
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="w-24"
                      options={METHOD_OPTIONS.map((item) => ({
                        ...item,
                        label: <HttpBadge value={item.label} />,
                      }))}
                    />
                  )}
                />
                <Controller
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
                name="ruleName"
                render={({ field }) => (
                  <Input {...field} placeholder={lang.rule.namePlaceHolder} />
                )}
              />
              <Controller
                name="modifyInfo.continueRequest"
                render={({ field: { onChange, ...field } }) => (
                  <Checkbox
                    className="self-start"
                    {...field}
                    onChange={(e) => onChange(e.target.checked)}
                  >
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
                        <div className="flex gap-2">
                          <Controller
                            name="modifyInfo.response.status"
                            render={({ field }) => (
                              <Select
                                {...field}
                                className="w-[250px]"
                                showSearch
                              >
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
                            name="modifyInfo.response.delay"
                            render={({ field }) => (
                              <InputNumber
                                className="w-28"
                                prefix={<ClockCircleOutlined />}
                                controls={false}
                                min={0}
                                precision={3}
                                {...field}
                                placeholder={lang.rule.delayPlaceHolder}
                              />
                            )}
                          />
                        </div>
                        <Controller
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
                    children: (
                      <div className="flex flex-col gap-2 h-full">
                        <ArrayField name="modifyInfo.response.responseHeaders">
                          {(fields, { append, remove }) => {
                            return (
                              <>
                                {fields.map(({ id, getName }, index) => {
                                  return (
                                    <Fragment key={id}>
                                      <Space.Compact>
                                        <Controller
                                          name={getName("0")}
                                          render={({ field }) => (
                                            <Input
                                              className="w-48"
                                              {...field}
                                              placeholder={
                                                lang.rule.headerNamePlaceHolder
                                              }
                                            />
                                          )}
                                        />
                                        <Controller
                                          name={getName("1")}
                                          render={({ field }) => (
                                            <Input
                                              {...field}
                                              placeholder={
                                                lang.rule.headerValuePlaceHolder
                                              }
                                            />
                                          )}
                                        />
                                        <Button onClick={() => remove(index)}>
                                          <MinusCircleOutlined />
                                        </Button>
                                      </Space.Compact>
                                    </Fragment>
                                  );
                                })}
                                <Button
                                  type="dashed"
                                  block
                                  className="w-40"
                                  icon={<PlusOutlined />}
                                  onClick={() => {
                                    append([["", ""]]);
                                  }}
                                >
                                  {lang.rule.addHeaderTitle}
                                </Button>
                              </>
                            );
                          }}
                        </ArrayField>
                      </div>
                    ),
                  },
                  ...(continueRequest
                    ? [
                        {
                          label: "Request",
                          key: "request",
                          children: (
                            <div className="flex flex-col gap-2 h-full">
                              <Controller
                                name="modifyInfo.response.delay"
                                render={({ field }) => (
                                  <InputNumber
                                    className="w-28"
                                    prefix={<ClockCircleOutlined />}
                                    controls={false}
                                    min={0}
                                    precision={3}
                                    {...field}
                                    placeholder={lang.rule.delayPlaceHolder}
                                  />
                                )}
                              />
                              <Controller
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
                          label: "Request Headers",
                          key: "request headers",
                          children: (
                            <div className="flex flex-col gap-2 h-full">
                              <ArrayField name="modifyInfo.request.requestHeaders">
                                {(fields, { append, remove }) => {
                                  return (
                                    <>
                                      {fields.map(({ id, getName }, index) => {
                                        return (
                                          <Fragment key={id}>
                                            <Space.Compact>
                                              <Controller
                                                name={getName("0")}
                                                render={({ field }) => (
                                                  <Input
                                                    className="w-48"
                                                    {...field}
                                                    placeholder={
                                                      lang.rule
                                                        .headerNamePlaceHolder
                                                    }
                                                  />
                                                )}
                                              />
                                              <Controller
                                                name={getName("1")}
                                                render={({ field }) => (
                                                  <Input
                                                    {...field}
                                                    placeholder={
                                                      lang.rule
                                                        .headerValuePlaceHolder
                                                    }
                                                  />
                                                )}
                                              />
                                              <Button
                                                onClick={() => remove(index)}
                                              >
                                                <MinusCircleOutlined />
                                              </Button>
                                            </Space.Compact>
                                          </Fragment>
                                        );
                                      })}
                                      <Button
                                        type="dashed"
                                        block
                                        className="w-40"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                          append([["", ""]]);
                                        }}
                                      >
                                        {lang.rule.addHeaderTitle}
                                      </Button>
                                    </>
                                  );
                                }}
                              </ArrayField>
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]}
              ></Tabs>
            </div>
          </FormProvider>
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
