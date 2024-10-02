export enum AppResource {
  AUTH = 'AUTH',
  USER = 'USER',
  UPLOAD = 'UPLOAD',
  PERMISSION = 'PERMISSION',
  ROLE = 'ROLE',
}

export enum AppPermission {
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_UPDATE_OWN = 'user:update_own',
  USER_DELETE = 'user:delete',
  UPLOAD_IMAGE = 'upload:image',
  UPLOAD_VIDEO = 'upload:video',
  PERMISSION_VIEW = 'permission:view',
  PERMISSION_CREATE = 'permission:create',
  PERMISSION_UPDATE = 'permission:update',
  PERMISSION_DELETE = 'permission:delete',
  ROLE_VIEW = 'role:view',
  ROLE_CREATE = 'role:create',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
}
