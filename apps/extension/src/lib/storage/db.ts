import { openDB, DBSchema } from "idb";
import debugFn from "debug";
import { NetworkRule } from "common/network-rule";
import { concat, from, map, shareReplay, Subject, switchMap, tap } from "rxjs";

const debug = debugFn("storage");
debugFn.enable("*");

/** Prevent rule change event notification operators */
type Operator = string;

interface InterceptorDB extends DBSchema {
  rule: {
    key: number;
    value: NetworkRule;
    indexes: {
      id: string;
    };
  };
}

interface BaseChangeType<T> {
  type: "created" | "updated" | "toggled";
  operator?: Operator;
  data: T;
}

interface DeleteChangeType<T> {
  type: "deleted";
  operator?: Operator;
  data?: T;
  id: string;
}
interface ClearChangeType {
  type: "clear";
  operator?: Operator;
}

type ChangeType<T> = BaseChangeType<T> | DeleteChangeType<T> | ClearChangeType;

const internalRuleChange$ = new Subject<ChangeType<NetworkRule>>();
internalRuleChange$.subscribe((change) => {
  const type = change.type;
  if (type === "clear") {
    debug(`cleared all rules`);
  } else {
    debug(`${type} rule: `, change.data);
  }
});

const dbRequest = openDB<InterceptorDB>("interceptor", 1, {
  upgrade(db, oldVersion, newVersion) {
    debug(
      `upgrade interceptor db from ${oldVersion} to ${newVersion || "null"}`
    );
    const store = db.createObjectStore("rule", { autoIncrement: true });
    store.createIndex("id", "id", {
      unique: true,
    });
  },
});

export const updateRule = async (rule: NetworkRule, operator?: Operator) => {
  const db = await dbRequest;
  const store = db.transaction("rule", "readwrite").objectStore("rule");
  const key = await store.index("id").getKey(rule.id);
  await store.put(rule, key);
  internalRuleChange$.next({ type: "updated", data: rule, operator });
};

export const toggleRule = async (
  { ruleId, disabled }: { ruleId: string; disabled: boolean },
  operator?: Operator
) => {
  const db = await dbRequest;
  const store = db.transaction("rule", "readwrite").objectStore("rule");
  const oldRule = (await store.index("id").get(ruleId)) as NetworkRuleModel;
  const key = await store.index("id").getKey(ruleId);
  const newRule = { ...oldRule, disabled };
  await store.put(newRule, key);
  internalRuleChange$.next({ type: "toggled", data: newRule, operator });
};

export const createRule = async (rule: NetworkRule, operator?: Operator) => {
  const db = await dbRequest;
  await db.transaction("rule", "readwrite").objectStore("rule").add(rule);
  internalRuleChange$.next({ type: "created", data: rule, operator });
};

export const deleteRule = async (ruleId: string, operator?: Operator) => {
  const db = await dbRequest;
  const tx = db.transaction("rule", "readwrite");
  const store = tx.objectStore("rule");
  const index = store.index("id");
  const key = await index.getKey(ruleId);
  if (!key) {
    debug("delete an not exist ruleId", ruleId);
    return;
  }
  await store.delete(key);
  const rule = await index.get(ruleId);
  await tx.done;
  internalRuleChange$.next({
    type: "deleted",
    data: rule,
    id: ruleId,
    operator,
  });
};

export const clearRules = async (operator?: Operator) => {
  const db = await dbRequest;
  const tx = db.transaction("rule", "readwrite").objectStore("rule");
  await tx.clear();
  internalRuleChange$.next({ type: "clear", operator });
};

export const getRule = async (ruleId: string) => {
  const db = await dbRequest;
  return db.getFromIndex("rule", "id", ruleId);
};

export const getAllRules = async () => {
  const db = await dbRequest;

  const store = db.transaction("rule").objectStore("rule");
  let cursor = await store.openCursor(null, "prev");
  let result: NetworkRule[] = [];
  while (cursor) {
    result.push(cursor.value);
    cursor = await cursor.continue();
  }
  return result;
};

export const ruleChange$ = from(internalRuleChange$);
export const rules$ = (() => {
  const createRulesOb = () => from(getAllRules());
  return concat(
    createRulesOb().pipe(map((rules) => ({ rules, operator: undefined }))),
    ruleChange$.pipe(
      switchMap(({ operator }) =>
        createRulesOb().pipe(map((rules) => ({ rules, operator })))
      )
    )
  ).pipe(
    shareReplay(1),
    tap((rule) => console.log("rule change", rule))
  );
})();
