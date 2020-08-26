export type ScheduleType = 'flight'

export interface Schedule {
  id: string
  name: string
  type: ScheduleType
  params: any
  filter?: any
  createdDate: string
  phoneNumbers: string[]
}

export interface AddScheduleReq {
  type: ScheduleType
  name: string
  params: string
  filter?: string
  phoneNumberJson: string
}

export interface DeleteScheduleReq {
  scheduleId: string
}

export interface GetScheduleRes {
  schedules: Schedule[]
}
