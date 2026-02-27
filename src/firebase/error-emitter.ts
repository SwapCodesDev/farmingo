import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class TypedEventEmitter extends EventEmitter {
  emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>) {
    return super.emit(event, ...args);
  }

  on<E extends keyof Events>(event: E, listener: Events[E]) {
    return super.on(event, listener);
  }

  off<E extends keyof Events>(event: E, listener: Events[E]) {
    return super.off(event, listener);
  }
}

export const errorEmitter = new TypedEventEmitter();
