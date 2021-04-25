import { diff } from 'deep-object-diff';

export default function logger({ getState }) {
  return (next) => async (action) => {
    const oldState = getState();

    const result = next(action);
    const newState = getState();

    console.log(`REDUX action_type: ${action.type} state_diff: ${JSON.stringify(diff(oldState, newState), null, 2)}`);

    return result;
  };
}
