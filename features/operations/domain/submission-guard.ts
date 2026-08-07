type MutableCell<T> = { current: T };

export function claimOperationSubmission(lock: MutableCell<number | null>, version: number) {
  if (lock.current !== null) {
    return false;
  }

  lock.current = version;
  return true;
}

export function clearOperationSubmission(lock: MutableCell<number | null>) {
  lock.current = null;
}
