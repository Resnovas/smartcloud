import { handlers as sharedHandlers } from './util/index.js';
import { handlers as prHandlers } from './pr/index.js';
const handlers = [
    ...sharedHandlers,
    ...prHandlers,
    // ...issueHandlers,
    // ...scheduleHandlers,
];
/**
 * The schedule condition handler.
 */
export function getConditionHandler(condition) {
    const handler = handlers.find(handler => handler[0] === condition.type);
    return handler?.[1];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZGl0aW9ucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFrREEsT0FBTyxFQUFDLFFBQVEsSUFBSSxjQUFjLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsUUFBUSxJQUFJLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQXVMckQsTUFBTSxRQUFRLEdBQUc7SUFDaEIsR0FBRyxjQUFjO0lBQ2pCLEdBQUcsVUFBVTtJQUNiLG9CQUFvQjtJQUNwQix1QkFBdUI7Q0FDdkIsQ0FBQztBQU9GOztHQUVHO0FBQ0gsTUFBTSxVQUFVLG1CQUFtQixDQUVsQyxTQUE4RTtJQUU5RSxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQWlCLENBQUM7SUFDeEYsT0FBTyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDIn0=