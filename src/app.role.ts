export enum AppResource {
  AUTH = 'AUTH',
  USER = 'USER',
  UPLOAD = 'UPLOAD',
  PERMISSION = 'PERMISSION',
  ROLE = 'ROLE',
  FACULTY = 'FACULTY',
  MAJOR = 'MAJOR',
  CLASS = 'CLASS',
  NOTIFICATION = 'NOTIFICATION',
  META = 'META',
  LETTER = 'LETTER',
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
  ROLE_ASSIGN_PERMISSION = 'role:assign_permission',
  FACULTY_VIEW = 'faculty:view',
  FACULTY_CREATE = 'faculty:create',
  FACULTY_UPDATE = 'faculty:update',
  FACULTY_DELETE = 'faculty:delete',
  MAJOR_VIEW = 'major:view',
  MAJOR_CREATE = 'major:create',
  MAJOR_UPDATE = 'major:update',
  MAJOR_DELETE = 'major:delete',
  CLASS_VIEW = 'class:view',
  CLASS_CREATE = 'class:create',
  CLASS_UPDATE = 'class:update',
  CLASS_DELETE = 'class:delete',
  CLASS_STATISTIC = 'class:statistic',
  CLASS_CREATE_STUDENT = 'class:create_student',
  CLASS_UPDATE_STUDENT = 'class:update_student',
  CLASS_DELETE_STUDENT = 'class:delete_student',
  LETTER_VIEW = 'letter:view',
  LETTER_UPDATE = 'letter:update',
  LETTER_VIEW_OWN = 'letter:view_own',
  NOTIFICATION_VIEW = 'notification:view',
  NOTIFICATION_VIEW_OWN = 'notification:view_own',
  NOTIFICATION_CREATE = 'notification:create',
  NOTIFICATION_UPDATE = 'notification:update',
  NOTIFICATION_DELETE = 'notification:delete',
  ATTENDANCE_VIEW = 'attendance:view',
  ATTENDANCE_CREATE = 'attendance:create',
  ATTENDANCE_UPDATE = 'attendance:update',
  ATTENDANCE_DELETE = 'attendance:delete',
  THEME_VIEW = 'theme:view',
  THEME_UPDATE = 'theme:update',
  QUESTION_VIEW = 'question:view',
  QUESTION_CREATE = 'question:create',
  QUESTION_UPDATE = 'question:update',
  QUESTION_DELETE = 'question:delete',
  ANSWER_VIEW = 'answer:view',
  ANSWER_CREATE = 'answer:create',
  ANSWER_UPDATE = 'answer:update',
  ANSWER_DELETE = 'answer:delete',
  EXAM_VIEW = 'exam:view',
  EXAM_CREATE = 'exam:create',
  EXAM_UPDATE = 'exam:update',
  EXAM_DELETE = 'exam:delete',
  META_VIEW = 'meta:view',
  META_UPDATE = 'meta:update',
}
