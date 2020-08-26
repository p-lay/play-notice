type ScheduleType = 'flight'

interface Schedule {
  id: string
  name: string
  type: string
  params: any
  createdDate: string
  phoneNumbers: string[]
}

export interface AddScheduleReq {
  type: ScheduleType
  name: string
  params: string
  phoneNumberJson: string
}

export interface DeleteScheduleReq {
  scheduleId: string
}

export interface GetScheduleRes {
  schedules: Schedule[]
}
