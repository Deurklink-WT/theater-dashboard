const { buildTimerStepOscBuffer, sendOscUdp } = require('./osc-send');

/** Zelfde keten als in Theater Dashboard `getVoorstellingTimerStepIds`. */
function stepIdsForPauseCount(pauseCount) {
    const pauses = Math.max(0, Number(pauseCount) || 0);
    const steps = ['deuren_open', 'vijf_voor_aanvang', 'aanvang'];
    for (let p = 1; p <= pauses; p++) {
        steps.push(p === 1 ? 'vijf_voor_pauze' : `vijf_voor_pauze_${p}`);
        steps.push(p === 1 ? 'pauze' : `pauze_${p}`);
        const nextAct = p + 1;
        steps.push(nextAct === 2 ? 'vijf_voor_tweede_deel' : `vijf_voor_aanvang_act_${nextAct}`);
        steps.push(nextAct === 2 ? 'aanvang_tweede_deel' : `aanvang_act_${nextAct}`);
    }
    steps.push('vijf_voor_einde', 'einde');
    return steps;
}

function allStepIdChoices() {
    const set = new Set();
    for (let pc = 0; pc <= 6; pc += 1) {
        stepIdsForPauseCount(pc).forEach((id) => set.add(id));
    }
    return [...set].sort().map((id) => ({ id, label: id }));
}

const SLOT_CHOICES = [
    { id: 'ochtend', label: 'Ochtend' },
    { id: 'middag', label: 'Middag' },
    { id: 'avond', label: 'Avond' },
    { id: 'alledag', label: 'Hele dag' }
];

module.exports = function updateActions(self) {
    self.setActionDefinitions({
        timer_step: {
            name: 'Timerstap (OSC)',
            options: [
                {
                    id: 'slot',
                    type: 'dropdown',
                    label: 'Slot',
                    default: 'middag',
                    choices: SLOT_CHOICES
                },
                {
                    id: 'step',
                    type: 'dropdown',
                    label: 'Stap (id)',
                    default: 'deuren_open',
                    choices: allStepIdChoices()
                }
            ],
            callback: async (event) => {
                const host = String(self.config.host || '127.0.0.1').trim();
                const port = Number(self.config.port || 3955);
                const slotId = event.options.slot;
                const stepId = event.options.step;
                const buf = buildTimerStepOscBuffer(slotId, stepId);
                try {
                    await sendOscUdp(host, port, buf);
                } catch (e) {
                    self.log('error', `OSC send failed: ${e.message || e}`);
                }
            }
        }
    });
};
