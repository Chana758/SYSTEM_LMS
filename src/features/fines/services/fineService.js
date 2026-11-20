import { fineApi } from './fineApi'

export const fineService = {
  list(params = {}) { return fineApi.list(params) },
  myFines(params = {}) { return fineApi.myFines(params) },
  summary() { return fineApi.summary() },
  create(payload) { return fineApi.create(payload) },
  show(id) { return fineApi.show(id) },
}