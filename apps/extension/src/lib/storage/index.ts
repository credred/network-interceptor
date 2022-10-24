import { NetworkRule } from "common/network-rule";
import Browser, { Storage } from "webextension-polyfill";
import { StorageKey } from "./constants";
import { firstValueFrom, from, fromEventPattern, merge, shareReplay } from "rxjs";
import debugFn from "debug";
import { omit } from 'lodash';

const debug = debugFn("storage");

const storage = Browser.storage.sync;

export const saveRule = async (rule: NetworkRule) => {
  const rules = await firstValueFrom(rules$);
  if (rules[rule.id]) {
    debug('update rule', rule)
  } else {
    debug('add rule', rule)
  }
  await storage.set({
    [StorageKey.RULES]: {
      ...rules,
      [rule.id]: rule,
    },
  });
};

export const deleteRule = async (ruleId: string) => {
  
  const rules = await firstValueFrom(rules$);
  debug("delete rule", rules[ruleId]);
  await storage.set({
    [StorageKey.RULES]: omit(rules, ruleId),
  });
};

export const clearRules = () => {
  debug("clear rule")
  return storage.set({
    [StorageKey.RULES]: {}
  })
}

const getAllRules = async () => {
  const res = (await storage.get(StorageKey.RULES)) as {
    [StorageKey.RULES]: Record<string, NetworkRule> | undefined;
  };
  return res.rules || {};
};

export const getRuleById = async (
  ruleId: string
): Promise<Partial<NetworkRule>> => {
  const rules = await firstValueFrom(rules$);
  const rule = rules?.[ruleId] || {};
  debug('get rule', rule)
  return rule
};

const onRulesChange = (callback: (rules: Record<string, NetworkRule>) => void) => {
  const listener: Parameters<typeof storage.onChanged.addListener>[0] = (changes) => {
    if (changes.rules) {
      debug('rules change', changes.rules)
      callback(((changes.rules as Storage.StorageChange).newValue || {}) as Record<string, NetworkRule>)
    }
  }
  storage.onChanged.addListener(listener)

  return () => {
    storage.onChanged.removeListener(listener)
  }
}

const rulesByGet$ = from(getAllRules())
const rulesByListener$ = fromEventPattern<Record<string, NetworkRule>>(onRulesChange, (handler) => handler())

const rules$ = merge(rulesByGet$, rulesByListener$).pipe(
  shareReplay(1)
)

export { rules$ }
