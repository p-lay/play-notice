export default {
  _config: {
    promiseGenericRes: 'CommonRes',
    // disableController: false,
    // disableEntity: false,
  },
  flight: {
    getFlights: {
      req: 'GetFlightsReq',
      res: 'GetFlightsRes',
    },
  },
  schedule: {
    addSchedule: {
      req: 'AddScheduleReq',
    },
    deleteSchedule: {
      req: 'DeleteScheduleReq',
    },
    getSchedule: {
      res: 'GetScheduleRes',
    },
  },
}
