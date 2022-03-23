export class Update {
  constructor(payload) {
    this.payload = payload;
  }
}

export class UpdateQueue {
  constructor() {
    this.firstUpdate = null;
    this.lastUpdate = null;
  }
  enqueue(update) {
    if (this.firstUpdate == null) {
      this.firstUpdate = this.lastUpdate = update;
    } else {
      this.lastUpdate.nextUpdate = update;
      this.lastUpdate = update;
    }
  }
  forceUpdate(state) {
    let currentUpdate = this.firstUpdate;
    let newState = { ...state };
    while (currentUpdate) {
      const nextState =
        typeof currentUpdate.payload === "function"
          ? currentUpdate.payload(newState)
          : currentUpdate.payload;
      newState = { ...newState, ...nextState };
      currentUpdate = currentUpdate.nextUpdate;
    }
    this.firstUpdate = this.lastUpdate = null;

    return newState;
  }
}
