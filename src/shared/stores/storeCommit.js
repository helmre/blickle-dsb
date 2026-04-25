export function commitRef(target, nextValue, persist) {
  const previous = target.value
  target.value = nextValue
  try {
    persist()
  } catch (error) {
    target.value = previous
    throw error
  }
  return target.value
}

export function commitRefs(updates, persist) {
  const previous = updates.map(update => update.target.value)
  updates.forEach(update => { update.target.value = update.value })
  try {
    persist()
  } catch (error) {
    updates.forEach((update, index) => { update.target.value = previous[index] })
    throw error
  }
  return updates.map(update => update.target.value)
}
