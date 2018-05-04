import { Permission } from "./enums";

export interface UserInfo {
    id: string;
    roles: number[],
    sites: any[],
    email,
    permissions: Permission[]
}