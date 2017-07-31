export default function channel(state = {
  url: '',
}, action) {
  if (/^@@channel/.test(action.type)) {
    const { url } = action;
    return { url };
  }
  return state;
}
