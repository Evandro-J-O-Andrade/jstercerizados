export const MEDIA_PERMISSIONS = {
  dashboardRead: 'media.read',
  assetsRead: 'media_assets.read',
  assetsWrite: 'media_assets.write',
  assetsDelete: 'media_assets.delete',
  uploadManage: 'media.upload.manage',
  galleryManage: 'media.gallery.manage',
} as const;

export type MediaPermission =
  (typeof MEDIA_PERMISSIONS)[keyof typeof MEDIA_PERMISSIONS];
