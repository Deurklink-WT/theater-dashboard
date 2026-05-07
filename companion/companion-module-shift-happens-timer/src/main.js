const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base');
const updateActions = require('./actions');

class ShiftHappensTimerInstance extends InstanceBase {
    constructor(internal) {
        super(internal);
    }

    async init(config) {
        this.config = config;
        this.updateStatus(InstanceStatus.Ok);
        updateActions(this);
    }

    async destroy() {
        this.log('debug', 'destroy');
    }

    async configUpdated(config) {
        this.config = config;
    }

    getConfigFields() {
        return [
            {
                type: 'textinput',
                id: 'host',
                label: 'OSC host (Theater Dashboard)',
                width: 8,
                default: '127.0.0.1',
                regex: Regex.IP
            },
            {
                type: 'textinput',
                id: 'port',
                label: 'OSC UDP-poort',
                width: 4,
                default: '3955',
                regex: Regex.PORT
            }
        ];
    }
}

runEntrypoint(ShiftHappensTimerInstance, []);
