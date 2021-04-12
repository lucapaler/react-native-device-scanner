import Discovery from './discovery/discovery.container'
import Configure from './discovery/config.container'
import DeviceInfo from './discovery/deviceInfo.container'
import ConfigInfo from './discovery/configInfo.container'
import Analysis from './analysis/analysis.container'
import Diagnostic from './diagnostic/diagnostic.container'
import ScanLogs from './discovery/scanLogsList.container'
import Login from './general/login.container'
const screens = {
    General: {
        Login
    },
    Discovery,
    Configure,
    ConfigInfo,
    DeviceInfo,
    ScanLogs,
    Analysis,
    Diagnostic
}

export default screens