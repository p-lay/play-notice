import { Code } from '../../contract/global'

export class Exception {
  constructor(code: Code, message?: string) {
    this.code = code
    this.message = message
    this.getMessage()
  }

  code: Code
  message: string

  getMessage() {
    if (!this.message) {
      this.message = this.codeToMsg(this.code)
    }
  }

  codeToMsg(code: Code) {
    switch (code) {
      case 1000:
        return 'empty value, not exception'
      case 2000:
        return 'no data in table'
      case 3000:
        return 'data has relation, cannot be delete'
        case 3100:
        return 'duplicate data in table'
    }
  }
}
