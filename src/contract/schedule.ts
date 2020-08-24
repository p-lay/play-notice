type ScheduleType = 'flight'

interface Schedule {
  id: string
  name: string
  type: string
  params: any
  createdDate: string
}

export interface AddScheduleReq {
  type: ScheduleType
  name: string
  params: any
}

export interface DeleteScheduleReq {
  scheduleId: string
}

export interface GetScheduleRes {
  schedules: Schedule[]
}
