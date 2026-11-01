export const RH_PERMISSIONS = {
  peopleRead: 'people.read',
  peopleCreate: 'people.create',
  peopleUpdate: 'people.update',
  peopleDisable: 'people.disable',
  peopleExport: 'people.export',
  candidatesRead: 'candidates.read',
  jobsRead: 'jobs.read',
  applicationsRead: 'applications.read',
  recruitmentStageManage: 'recruitment.stage.manage',
  recruitmentRead: 'recruitment.read',
} as const;

export type RhPermission =
  (typeof RH_PERMISSIONS)[keyof typeof RH_PERMISSIONS];
