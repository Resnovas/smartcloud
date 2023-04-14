"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConditionHandler = void 0;
const index_js_1 = require("./util/index.js");
const index_js_2 = require("./pr/index.js");
const handlers = [
    ...index_js_1.handlers,
    ...index_js_2.handlers,
    // ...issueHandlers,
    // ...scheduleHandlers,
];
/**
 * The schedule condition handler.
 */
function getConditionHandler(condition) {
    const handler = handlers.find(handler => handler[0] === condition.type);
    return handler === null || handler === void 0 ? void 0 : handler[1];
}
exports.getConditionHandler = getConditionHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZGl0aW9ucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFrREEsOENBQTJEO0FBQzNELDRDQUFxRDtBQXVMckQsTUFBTSxRQUFRLEdBQUc7SUFDaEIsR0FBRyxtQkFBYztJQUNqQixHQUFHLG1CQUFVO0lBQ2Isb0JBQW9CO0lBQ3BCLHVCQUF1QjtDQUN2QixDQUFDO0FBT0Y7O0dBRUc7QUFDSCxTQUFnQixtQkFBbUIsQ0FFbEMsU0FBOEU7SUFFOUUsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFpQixDQUFDO0lBQ3hGLE9BQU8sT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLENBQUM7QUFORCxrREFNQyJ9