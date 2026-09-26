import type { Utils } from '../index.js';
import type { Label, Labels } from '../../types.js';
export declare function add(this: Utils, IDNumber: number, label: string): Promise<void>;
export declare function create(this: Utils, label: Label, ref?: string): Promise<void>;
export declare function del(this: Utils, name: string, ref?: string): Promise<void>;
export declare function get(this: Utils, ref?: string): Promise<Labels>;
export declare function remove(this: Utils, IDNumber: number, label: string, ref?: string): Promise<void>;
export declare function update(this: Utils, current_name: string, label: Label, ref?: string): Promise<void>;
