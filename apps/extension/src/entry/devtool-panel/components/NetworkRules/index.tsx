import { memo, useEffect, useMemo, useState } from "react";
import { NetworkRule } from "common/network-rule";
import {
  METHOD_OPTIONS,
  STATUS_CODE_OPTIONS,
} from "common/constants/options.constant";
import lang from "common/lang";
import { Button, Checkbox, Editor, Input, List, Select, Tabs } from "ui";
import { useForm, Controller } from "react-hook-form";
import { DeleteFilled } from "@ant-design/icons";
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
      if (type !== "change") return;
      void request.updateRule(value as NetworkRule);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleRemoveRule = () => {
    if (activeRule) {
      void request.deleteRule(activeRule.id);
      const linkRule = linkRules[activeRule.id];
      setActiveRule(linkRule.next?.value || linkRule.pre?.value);
    }
  };

  useEffect(() => {
    reset(activeRule);
  }, [activeRule]);

  return (
    <div className="flex h-full">
      <section>
        <div>
          <Button type="link" title="delete rule" onClick={handleRemoveRule}>
            <DeleteFilled />
          </Button>
        </div>
        <List
          rowKey="id"
          className="w-[260px]"
          selectable
          activeKey={activeRule?.id}
          dataSource={rules}
          onChange={(_, rule) => {
            setActiveRule(rule);
          }}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <div className="truncate">{item.baseMatchRule.path}</div>
              <div>{item.baseMatchRule.method}</div>
            </List.Item>
          )}
        ></List>
      </section>
      <section className="flex-1 min-w-0 px-1 pt-1">
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
                                  key={group.label + item.value}
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
                          className="flex-1"
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
      </section>
    </div>
  );
};

export default memo(NetworkRules);
