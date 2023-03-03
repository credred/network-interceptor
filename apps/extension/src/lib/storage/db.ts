import { openDB, DBSchema } from "idb";
import debugFn from "debug";
import { NetworkRule } from "common/network-rule";
import { concat, from, shareReplay, Subject, switchMap, tap } from "rxjs";

const debug = debugFn("storage");
debugFn.enable("*");

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

export const updateRule = async (rule: NetworkRule) => {
  const db = await dbRequest;
  const store = await db.transaction("rule", "readwrite").objectStore("rule");
  const key = await store.index("id").getKey(rule.id);
  await store.put(rule, key);
  internalRuleChange$.next({ type: "updated", data: rule });
};

export const createRule = async (rule: NetworkRule) => {
  const db = await dbRequest;
  await db.transaction("rule", "readwrite").objectStore("rule").add(rule);
  internalRuleChange$.next({ type: "created", data: rule });
};

export const deleteRule = async (ruleId: string) => {
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
    createRulesOb(),
    ruleChange$.pipe(switchMap(() => createRulesOb()))
  ).pipe(
    shareReplay(1),
    tap((rule) => console.log("rule change", rule))
  );
})();
