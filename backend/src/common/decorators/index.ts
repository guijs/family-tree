import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const TREE_ID_KEY = 'treeId';
export const TreeId = (treeId: string) => SetMetadata(TREE_ID_KEY, treeId);

export const SKIP_PRIVACY_KEY = 'skipPrivacy';
export const SkipPrivacy = () => SetMetadata(SKIP_PRIVACY_KEY, true);
