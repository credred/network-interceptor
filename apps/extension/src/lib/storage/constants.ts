export enum StorageMessage {
  createRule = "storage:createRule",
  updateRule = "storage:updateRule",
  deleteRule = "storage:deleteRule",
  getRule = "storage:getRule",
  clearRules = "storage:clearRules",
  getAllRules = "storage:getAllRules",
}

export enum StorageMessageStreamName {
  ruleStream = "storage:ruleStream",
}
