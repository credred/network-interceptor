import { openDB, DBSchema } from "idb";
import debugFn from "debug";
import { NetworkRule } from "common/network-rule";
import { concat, from, shareReplay, Subject, switchMap, tap } from "rxjs";

const debug = debugFn("storage");
debugFn.enable("*");

interface InterceptorDB extends DBSchema {
  rule: {
    key: string;
    value: NetworkRule;
  };
}

interface BaseChangeType<T> {
  type: "created" | "updated";
  data: T;
}

interface DeleteChangeType<T> {
  type: "deleted";
  data?: T;
  id: string;
}
interface ClearChangeType {
  type: "clear";
}

type ChangeType<T> = BaseChangeType<T> | DeleteChangeType<T> | ClearChangeType;

const internalRuleChange$ = new Subject<ChangeType<NetworkRule>>();
internalRuleChange$.subscribe((change) => {
  const type = change.type;
  if (type === "clear") {
    debug(`cleared all rules`);
  } else {
    if (type === "deleted" && !change.data) {
      debug(`delete rule by not exist ruleId`, change.id);
    } else {
      debug(`${type} rule: `, change.data);
    }
  }
});

const dbRequest = openDB<InterceptorDB>("interceptor", 1, {
  upgrade(db, oldVersion, newVersion) {
    debug(
      `upgrade interceptor db from ${oldVersion} to ${newVersion || "null"}`
    );
    db.createObjectStore("rule", { keyPath: "id" });
  },
});

export const updateRule = async (rule: NetworkRule) => {
  const db = await dbRequest;
  await db.transaction("rule", "readwrite").objectStore("rule").put(rule);
  internalRuleChange$.next({ type: "updated", data: rule });
};

export const createRule = async (rule: NetworkRule) => {
  const db = await dbRequest;
  await db.transaction("rule", "readwrite").objectStore("rule").add(rule);
  internalRuleChange$.next({ type: "created", data: rule });
};

export const deleteRule = async (ruleId: string) => {
  const db = await dbRequest;
  const tx = db.transaction("rule", "readwrite").objectStore("rule");
  const rule = await tx.get(ruleId);
  await tx.delete(ruleId);
  internalRuleChange$.next({ type: "deleted", data: rule, id: ruleId });
};

export const clearRules = async () => {
  const db = await dbRequest;
  const tx = db.transaction("rule", "readwrite").objectStore("rule");
  await tx.clear();
  internalRuleChange$.next({ type: "clear" });
};

export const getRule = async (ruleId: string) => {
  const db = await dbRequest;
  return db.get("rule", ruleId);
};

export const getAllRules = async () => {
  const db = await dbRequest;
  return db.getAll("rule");
};

export const ruleChange$ = from(internalRuleChange$);
export const rules$ = (() => {
  const createRulesOb = () => from(getAllRules());
  return concat(
    createRulesOb(),
    ruleChange$.pipe(switchMap(() => createRulesOb()))
  ).pipe(
    shareReplay(1),
    tap((rule) => console.log("rule change", rule))
  );
})();
