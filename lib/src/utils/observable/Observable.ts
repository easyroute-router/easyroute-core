import { generateId } from '../generateId'

export default class Observable<T> {
  private _subscribersQueue: { [key: string]: ObservableListener<T> } = {}

  constructor(private value: T) {}

  get getValue() {
    return this.value
  }

  public subscribe(listener: ObservableListener<T>) {
    const id = generateId()
    this._subscribersQueue[id] = listener
    listener(this.getValue)
    return () => {
      delete this._subscribersQueue[id]
    }
  }

  public setValue(newValue: T) {
    this.value = newValue
    for (const key in this._subscribersQueue) {
      const subscriber = this._subscribersQueue[key]
      subscriber(this.value)
    }
  }
}
