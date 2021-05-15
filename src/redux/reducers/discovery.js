import {
  START_DISCOVERY, SET_START_DISCOVERY_TIME, SET_END_DISCOVERY_TIME, DEVICE_DISCOVERED,
  ERROR_DISCOVERY, END_DISCOVERY, SET_DISCOVERY_CONFIG, TERMINATE_SCAN,
} from '../types/discovery';
import initialState from '../store/initialState';

export default function discoveryReducer(state = initialState.discovery, action = {}) {
  switch (action.type) {
    case START_DISCOVERY:
      return {
        ...state,
        isScanning: true,
        last: {
          config: action.config,
          start: Date.now(),
          end: null,
          time: {
            start: {},
            end: {},
          },
          discovered: [],
          error: {},
        },
      };

    case SET_START_DISCOVERY_TIME:
      if (!state.isScanning) {
        return state;
      }

      return {
        ...state,
        last: {
          ...state.last,
          time: {
            ...state.last.time,
            start: {
              ...state.last.time.start,
              [action.protocol]: Date.now(),
            },
          },
        },
      };

    case SET_END_DISCOVERY_TIME:
      if (!state.isScanning) {
        return state;
      }

      return {
        ...state,
        last: {
          ...state.last,
          time: {
            ...state.last.time,
            end: {
              ...state.last.time.end,
              [action.protocol]: Date.now(),
            },
          },
        },
      };

    case DEVICE_DISCOVERED:
      if (!state.isScanning) {
        return state;
      }

      return {
        ...state,
        last: {
          ...state.last,
          discovered: state.last.discovered.some(({ ip }) => ip === action.info.ip)
            ? state.last.discovered.map((device) => {
              if (device.ip === action.info.ip) {
                return {
                  ip: device.ip,
                  mac: device.mac || action.info.mac,
                  possibleMac: device.possibleMac || action.info.possibleMac,
                  manufacturer: device.manufacturer || action.info.manufacturer,
                  protocol: [...new Set([...device.protocol, ...action.info.protocol])],
                  timestamp: [...device.timestamp, ...action.info.timestamp],
                  name: device.name || action.info.name,
                  model: device.model || action.info.model,
                  txt: {
                    ...device.txt,
                    ...action.info.txt,
                  },
                };
              }

              return device;
            })
            : [...state.last.discovered, action.info],
        },
      };

    case ERROR_DISCOVERY:
      if (!state.isScanning) {
        return state;
      }

      return {
        ...state,
        last: {
          ...state.last,
          error: {
            ...state.last.error,
            [action.protocol]: action.error?.message,
          },
        },
      };

    case END_DISCOVERY:
      if (!state.isScanning) {
        return state;
      }

      return {
        ...state,
        isScanning: false,
        last: {
          ...state.last,
          end: Date.now(),
        },
        old: [
          ...state.old,
          {
            ...state.last,
            end: Date.now(),
          },
        ],
      };

    case SET_DISCOVERY_CONFIG:
      if (action.protocol) {
        return {
          ...state,
          config: {
            ...state.config,
            [action.protocol]: action.config,
          },
        };
      }

      return {
        ...state,
        config: action.config,
      };

    case TERMINATE_SCAN:
      return {
        ...state,
        isScanning: false,
        last: {
          ...state.last,
          end: Date.now(),
        },
      };

    default:
      return state;
  }
}
