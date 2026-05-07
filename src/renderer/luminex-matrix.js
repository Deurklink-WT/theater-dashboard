/**
 * Luminex visuele patch: sACN-bronnen (iconen) naar uitgangen, n8n-achtige SVG-lijnen.
 */
(function () {
    const COLORS = ['#7dd3a8', '#a78bfa', '#7eb8ff', '#fbbf9d', '#f0abfc', '#5eead4', '#fcd34d', '#93c5fd'];
    /** Zelfde stap als `background-size` van het raster (snap-to-grid). */
    const LUMINEX_GRID_PX = 20;

    function snapToGrid(n) {
        return Math.round(Number(n) / LUMINEX_GRID_PX) * LUMINEX_GRID_PX;
    }

    /** Kleinste sleutel eerst in sort; verticaal: kleinste universe bovenaan (kleinere y), oplopend naar beneden. */
    function yStackTopDown(rank, count, rowGap, topBase) {
        if (count <= 0) return snapToGrid(topBase);
        const r = Math.max(0, Math.min(rank, count - 1));
        return snapToGrid(topBase + r * rowGap);
    }

    /** 5-polige DMX — cirkel + 5 pinnetjes in een boog (onderkant), zoals gangbare DMX-pictogrammen. */
    const ICON_DMX_FEMALE_XLR =
        '<svg class="luminex-dmx-xlr-female" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
        '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.25"/>' +
        '<circle cx="8.17" cy="15.21" r="1.2" fill="currentColor"/>' +
        '<circle cx="9.89" cy="16.53" r="1.2" fill="currentColor"/>' +
        '<circle cx="12" cy="17" r="1.2" fill="currentColor"/>' +
        '<circle cx="14.11" cy="16.53" r="1.2" fill="currentColor"/>' +
        '<circle cx="15.83" cy="15.21" r="1.2" fill="currentColor"/>' +
        '</svg>';

    function bezierPath(x1, y1, x2, y2) {
        const dx = Math.max(40, (x2 - x1) * 0.45);
        return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    }

    /** Twee Bezier-segmenten: via engine-in en engine-out (visueel bron → engine → uitgang). */
    function bezierThroughEngine(x1, y1, xIn, yIn, xOut, yOut, x2, y2) {
        const d1 = bezierPath(x1, y1, xIn, yIn);
        const d2 = bezierPath(xOut, yOut, x2, y2);
        return { d1, d2 };
    }

    class LuminexMatrixView {
        /**
         * @param {HTMLElement} root
         * @param {object} options
         * @param {boolean} [options.dynamic] — dynamische sACN/uitgangen
         * @param {string} [options.inputsTitle]
         * @param {string} [options.outputsTitle]
         * @param {function} [options.onChange]
         * @param {number} [options.inputCount] — alleen zonder dynamic
         * @param {number} [options.outputCount]
         * @param {object} [options.i18n] — getLabelIn/getLabelOut voor legacy
         */
        constructor(root, options = {}) {
            this.root = root;
            this.dynamic = !!options.dynamic;
            this.onChange = typeof options.onChange === 'function' ? options.onChange : null;
            this._onNodeLayoutChange =
                typeof options.onNodeLayoutChange === 'function' ? options.onNodeLayoutChange : null;
            /** @type {Record<string, { x: number, y: number }>} */
            this._freePos =
                options.initialLayout && typeof options.initialLayout === 'object'
                    ? { ...options.initialLayout }
                    : {};
            /** @type {{ key: string, el: HTMLElement, pointerId: number, startX: number, startY: number, origLeft: number, origTop: number }|null} */
            this._nodeDrag = null;
            this.i18n = options;
            /** @type {{ universe: number, sourceName?: string, sourceAddress?: string }[]} */
            this._inputSpecs = [];
            /** @type {{ key: string, label: string }[]} */
            this._outputSpecs = [];
            this.inputCount = options.inputCount ?? 8;
            this.outputCount = options.outputCount ?? 8;

            /** @type {{ inIdx: number, outIdx: number, processblockId?: number|null }[]} */
            this.connections = [];
            this._drag = null;
            this._svg = null;
            this._layer = null;
            this._portsIn = new Map();
            this._portsOut = new Map();
            this._resizeObs = null;
            this._raf = null;
            /** @type {{ name: string, id: number|null }} */
            this._engineSpec = { name: '', id: null };
            /** @type {{ id: number, name: string }[]|null} — meerdere process engines in één canvas */
            this._engineBlockSpecs = null;
            /** @type {Map<number, { pIn: HTMLElement, pOut: HTMLElement }>} */
            this._enginePortMap = new Map();

            this._onPointerUp = this._onPointerUp.bind(this);
            this._onPointerMove = this._onPointerMove.bind(this);
            this._onNodePointerMove = this._onNodePointerMove.bind(this);
            this._onNodePointerUp = this._onNodePointerUp.bind(this);
            this._onResize = this._onResize.bind(this);

            this._buildDom();
            this._wireResize();
            if (this.dynamic) {
                this._rebuildDynamicLists();
            } else {
                this._buildFixedPorts();
                this._applyLabels();
            }
            requestAnimationFrame(() => this._redraw());
        }

        destroy() {
            if (this._resizeObs) {
                this._resizeObs.disconnect();
                this._resizeObs = null;
            }
            window.removeEventListener('resize', this._onResize);
            document.removeEventListener('pointermove', this._onPointerMove);
            document.removeEventListener('pointerup', this._onPointerUp);
            document.removeEventListener('pointermove', this._onNodePointerMove);
            document.removeEventListener('pointerup', this._onNodePointerUp);
            this.root.innerHTML = '';
        }

        /** Stabiele sleutel voor output (file/config). */
        _safeOutKey(key) {
            return String(key || '').replace(/[^a-zA-Z0-9]/g, '_');
        }

        _inPosKey(universe) {
            return `in_u_${Number(universe)}`;
        }

        /** Layout-sleutel voor invoer (gedeelde universe = één kaart; geen processblockId op spec). */
        _inputLayoutKey(spec) {
            if (spec && spec.mergeFromEngine === true) {
                return `merge_u_${Number(spec.universe)}`;
            }
            return this._inPosKey(spec.universe);
        }

        _useMultiEngine() {
            return Array.isArray(this._engineBlockSpecs) && this._engineBlockSpecs.length > 1;
        }

        setEngineBlockSpecs(specs) {
            if (!Array.isArray(specs) || specs.length <= 1) {
                this._engineBlockSpecs = null;
                return;
            }
            const seen = new Set();
            const out = [];
            for (const s of specs) {
                const id = Number(s.id);
                if (Number.isNaN(id) || seen.has(id)) continue;
                seen.add(id);
                out.push({ id, name: s.name != null ? String(s.name) : '' });
            }
            out.sort((a, b) => a.id - b.id);
            this._engineBlockSpecs = out.length > 1 ? out : null;
        }

        _outPosKey(key) {
            return `out_k_${this._safeOutKey(key)}`;
        }

        getNodeLayout() {
            return { ...this._freePos };
        }

        /**
         * Herstelt opgeslagen posities ({ in_u_1: {x,y}, out_k_..., engine: {...} }).
         * @param {Record<string, { x: number, y: number }>} layout
         * @param {boolean} [skipApply] — alleen _freePos vullen (vóór setDynamicPorts / rebuild).
         */
        setNodeLayout(layout, skipApply) {
            if (!layout || typeof layout !== 'object') return;
            this._freePos = { ...this._freePos, ...layout };
            if (!skipApply && this.dynamic) {
                this._applyFreePositions();
                this._redraw();
            }
        }

        _emitNodeLayoutChange() {
            if (!this._onNodeLayoutChange) return;
            try {
                this._onNodeLayoutChange(this.getNodeLayout());
            } catch (_) {
                /* ignore */
            }
        }

        _bindFreeDrag(row) {
            if (!this.dynamic) return;
            const key = row.getAttribute('data-lum-nk');
            if (!key) return;
            row.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;
                if (e.target.closest('button.luminex-matrix-port')) return;
                if (e.target.closest('[data-lum-engine-port]')) return;
                this._startNodeDrag(e, row, key);
            });
        }

        _startNodeDrag(e, rowEl, key) {
            e.preventDefault();
            e.stopPropagation();
            if (!this._layer) return;
            const layerRect = this._layer.getBoundingClientRect();
            const rect = rowEl.getBoundingClientRect();
            const left = rect.left - layerRect.left;
            const top = rect.top - layerRect.top;
            try {
                rowEl.setPointerCapture(e.pointerId);
            } catch (_) {
                /* ignore */
            }
            this._nodeDrag = {
                key,
                el: rowEl,
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                origLeft: left,
                origTop: top
            };
            rowEl.classList.add('luminex-matrix-node--dragging');
            document.addEventListener('pointermove', this._onNodePointerMove);
            document.addEventListener('pointerup', this._onNodePointerUp);
        }

        _onNodePointerMove(e) {
            if (!this._nodeDrag || !this._layer) return;
            const d = this._nodeDrag;
            const dx = e.clientX - d.startX;
            const dy = e.clientY - d.startY;
            let nx = d.origLeft + dx;
            let ny = d.origTop + dy;
            const nw = d.el.offsetWidth;
            const nh = d.el.offsetHeight;
            const maxW = this._layer.clientWidth;
            const maxH = Math.max(this._layer.clientHeight, nh + 8);
            nx = Math.max(0, Math.min(nx, maxW - nw));
            ny = Math.max(0, Math.min(ny, maxH - nh));
            nx = snapToGrid(nx);
            ny = snapToGrid(ny);
            d.el.style.left = `${nx}px`;
            d.el.style.top = `${ny}px`;
            this._redraw();
        }

        _onNodePointerUp(e) {
            if (!this._nodeDrag) return;
            const d = this._nodeDrag;
            const { el, key, pointerId } = d;
            document.removeEventListener('pointermove', this._onNodePointerMove);
            document.removeEventListener('pointerup', this._onNodePointerUp);
            this._nodeDrag = null;
            el.classList.remove('luminex-matrix-node--dragging');
            if (pointerId != null && typeof el.releasePointerCapture === 'function') {
                try {
                    el.releasePointerCapture(pointerId);
                } catch (_) {
                    /* ignore */
                }
            }
            let x = parseFloat(el.style.left) || 0;
            let y = parseFloat(el.style.top) || 0;
            x = snapToGrid(x);
            y = snapToGrid(y);
            this._freePos[key] = { x, y };
            this._expandFreeCanvasHeight();
            this._emitNodeLayoutChange();
            this._redraw();
        }

        /** Bronnen links: oplopend op universe (één rij per universe). */
        _leftColumnSpecsSorted() {
            return this._inputSpecs
                .filter((s) => !s.mergeFromEngine)
                .map((s, origIdx) => ({ s, origIdx }))
                .sort((a, b) => Number(a.s.universe) - Number(b.s.universe));
        }

        /** Merge-/output-universes rechts: zelfde sort. */
        _mergeSpecsSorted() {
            return this._inputSpecs
                .filter((s) => s.mergeFromEngine)
                .map((s, origIdx) => ({ s, origIdx }))
                .sort((a, b) => Number(a.s.universe) - Number(b.s.universe));
        }

        _outputSortValue(spec) {
            const k = String(spec.key || '');
            const dm = /^dmx:(\d+)$/i.exec(k);
            if (dm) return Number(dm[1]);
            const io = /^io:(\d+)$/i.exec(k);
            if (io) return 100000 + Number(io[1]);
            const ioa = /^ioarr:(\d+)$/i.exec(k);
            if (ioa) return 200000 + Number(ioa[1]);
            if (k === 'web:manual' || k === '') return 900000;
            return 500000;
        }

        _outputsSorted() {
            return this._outputSpecs
                .map((s, i) => ({ s, i }))
                .sort((a, b) => {
                    const va = this._outputSortValue(a.s);
                    const vb = this._outputSortValue(b.s);
                    if (va !== vb) return va - vb;
                    return String(a.s.key || '').localeCompare(String(b.s.key || ''));
                });
        }

        _defaultPositionForKey(key) {
            const pad = 10;
            const cw = this._layer ? this._layer.clientWidth || 880 : 880;
            const rowGap = 76;
            if (key === 'engine') {
                return {
                    x: snapToGrid(Math.max(pad, cw / 2 - 72)),
                    y: yStackTopDown(0, 1, 220, 150)
                };
            }
            if (key.startsWith('engine_pb_')) {
                const id = Number(key.slice('engine_pb_'.length));
                const specs = [...(this._engineBlockSpecs || [])].sort((a, b) => Number(a.id) - Number(b.id));
                const n = Math.max(1, specs.length);
                let blockIdx = specs.findIndex((b) => Number(b.id) === id);
                if (blockIdx < 0) blockIdx = 0;
                const topBase = 100;
                const engineRowGap = 200;
                if (n <= 1) {
                    return {
                        x: snapToGrid(Math.max(pad, cw / 2 - 72)),
                        y: yStackTopDown(0, 1, engineRowGap, topBase)
                    };
                }
                /* Meerdere engines: onder elkaar in het midden (geen overlap door dezelfde x/y). */
                return {
                    x: snapToGrid(Math.max(pad, cw / 2 - 72)),
                    y: yStackTopDown(blockIdx, n, engineRowGap, topBase)
                };
            }
            if (key === 'empty_in') {
                return { x: snapToGrid(pad), y: snapToGrid(40) };
            }
            if (key.startsWith('merge_pb')) {
                const m = /^merge_pb(\d+)_u_(\d+)$/.exec(key);
                if (m) {
                    const u = Number(m[2]);
                    const mergeCol = this._mergeSpecsSorted();
                    const n = Math.max(1, mergeCol.length);
                    const rank = Math.max(0, mergeCol.findIndex(({ s }) => Number(s.universe) === u));
                    return {
                        x: snapToGrid(Math.max(pad, cw - 210)),
                        y: yStackTopDown(rank, n, rowGap, 40)
                    };
                }
            }
            if (key.startsWith('merge_u_')) {
                const u = parseInt(key.slice(8), 10);
                const mergeCol = this._mergeSpecsSorted();
                const n = Math.max(1, mergeCol.length);
                const rank = Math.max(0, mergeCol.findIndex(({ s }) => Number(s.universe) === u));
                return {
                    x: snapToGrid(Math.max(pad, cw - 210)),
                    y: yStackTopDown(rank, n, rowGap, 40)
                };
            }
            if (key.startsWith('in_pb')) {
                const m = /^in_pb(\d+)_u_(\d+)$/.exec(key);
                if (m) {
                    const u = Number(m[2]);
                    const leftCol = this._leftColumnSpecsSorted();
                    const n = Math.max(1, leftCol.length);
                    const rank = Math.max(0, leftCol.findIndex(({ s }) => Number(s.universe) === u));
                    return {
                        x: snapToGrid(pad),
                        y: yStackTopDown(rank, n, rowGap, 40)
                    };
                }
            }
            if (key.startsWith('in_u_')) {
                const u = parseInt(key.slice(5), 10);
                const leftCol = this._leftColumnSpecsSorted();
                const n = Math.max(1, leftCol.length);
                const rank = Math.max(0, leftCol.findIndex(({ s }) => Number(s.universe) === u));
                return {
                    x: snapToGrid(pad),
                    y: yStackTopDown(rank, n, rowGap, 40)
                };
            }
            if (key.startsWith('out_k_')) {
                const sk = key.slice(6);
                const specFor = (this._outputSpecs || []).find(
                    (s) => this._safeOutKey(s.key) === sk
                );
                if (specFor && specFor.hidden) {
                    return { x: snapToGrid(Math.max(pad, cw - 190)), y: -8000 };
                }
                /* Alleen zichtbare uitgangen stapelen — verborgen rijen veroorzaakten overlappende (rank 0) posities. */
                const outsVis = this._outputsSorted().filter(({ s }) => !s.hidden);
                const n = Math.max(1, outsVis.length);
                let rank = outsVis.findIndex(({ s }) => this._safeOutKey(s.key) === sk);
                if (rank < 0) rank = 0;
                const outColGap = 82;
                return {
                    x: snapToGrid(Math.max(pad, cw - 190)),
                    y: yStackTopDown(rank, n, outColGap, 40)
                };
            }
            return { x: snapToGrid(pad), y: snapToGrid(pad) };
        }

        _applyFreePositions() {
            const nodesRoot = this._layer && this._layer.querySelector('[data-lum-free-nodes]');
            if (!nodesRoot) return;
            nodesRoot.querySelectorAll('[data-lum-nk]').forEach((el) => {
                const key = el.getAttribute('data-lum-nk');
                if (!key) return;
                let pos = this._freePos[key];
                if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
                    pos = this._defaultPositionForKey(key);
                    this._freePos[key] = pos;
                }
                const sx = snapToGrid(pos.x);
                const sy = snapToGrid(pos.y);
                if (sx !== pos.x || sy !== pos.y) this._freePos[key] = { x: sx, y: sy };
                el.style.left = `${sx}px`;
                el.style.top = `${sy}px`;
            });
            this._expandFreeCanvasHeight();
        }

        _expandFreeCanvasHeight() {
            const nodesRoot = this._layer && this._layer.querySelector('[data-lum-free-nodes]');
            if (!nodesRoot || !this._layer) return;
            let maxB = 320;
            nodesRoot.querySelectorAll('[data-lum-nk]').forEach((el) => {
                const top = parseFloat(el.style.top) || 0;
                const h = el.offsetHeight || 48;
                maxB = Math.max(maxB, top + h + 24);
            });
            nodesRoot.style.minHeight = `${Math.ceil(maxB)}px`;
        }

        /**
         * Zet alle zichtbare knopen op automatisch gesorteerde posities (kolommen; verticaal op universe, kleinste bovenaan).
         * Overschrijft handmatige posities tenzij route.preserveLuminexNodeLayout in de app aan staat.
         */
        applyAutoStackedLayout() {
            if (!this.dynamic || !this._layer) return;
            const nodesRoot = this._layer.querySelector('[data-lum-free-nodes]');
            if (!nodesRoot) return;
            const next = {};
            nodesRoot.querySelectorAll('[data-lum-nk]').forEach((el) => {
                const key = el.getAttribute('data-lum-nk');
                if (!key) return;
                next[key] = this._defaultPositionForKey(key);
            });
            this._freePos = next;
            this._applyFreePositions();
            this._redraw();
            this._emitNodeLayoutChange();
        }

        /**
         * Vernieuwt ingangen (sACN) en uitgangen; behoudt verbindingen waar universe+key nog bestaan.
         * @param {object[]} inputs
         * @param {object[]} outputs { key, label }
         */
        setDynamicPorts(inputs, outputs) {
            if (!this.dynamic) return;
            const prevRoutes = this.getRoutePatches();
            this._inputSpecs = Array.isArray(inputs) ? inputs.slice() : [];
            this._outputSpecs = Array.isArray(outputs) ? outputs.slice() : [];
            this._rebuildDynamicLists();
            this.connections = [];
            for (const r of prevRoutes) {
                const inIdx = this._inputSpecs.findIndex((s) => Number(s.universe) === Number(r.sourceUniverse));
                const outIdx = this._outputSpecs.findIndex((s) => s.key === r.outputKey);
                if (inIdx >= 0 && outIdx >= 0) {
                    const pid =
                        r.processblockId != null && r.processblockId !== '' ? Number(r.processblockId) : null;
                    const dup = this.connections.some(
                        (c) =>
                            c.inIdx === inIdx &&
                            c.outIdx === outIdx &&
                            (c.processblockId == null ? pid == null : Number(c.processblockId) === pid)
                    );
                    if (!dup) this.connections.push({ inIdx, outIdx, processblockId: pid });
                }
            }
            this._redraw();
            this._emitChange();
        }

        getRoutePatches() {
            return this.connections.map((c) => {
                const specIn = this._inputSpecs[c.inIdx];
                const patch = {
                    inIdx: c.inIdx,
                    outIdx: c.outIdx,
                    sourceUniverse: specIn ? Number(specIn.universe) : null,
                    outputKey: this._outputSpecs[c.outIdx] ? this._outputSpecs[c.outIdx].key : null
                };
                let pid = c.processblockId;
                if (pid == null || Number.isNaN(Number(pid))) {
                    pid = specIn && specIn.processblockId != null ? Number(specIn.processblockId) : null;
                }
                if (pid != null && !Number.isNaN(pid)) {
                    patch.processblockId = pid;
                }
                return patch;
            });
        }

        /** Herstelt verbindingen op basis van opgeslagen universe + outputKey (na rebuild van poorten). */
        applyPatchesFromRoutes(routes) {
            if (!this.dynamic) return;
            this.connections = [];
            for (const p of routes || []) {
                const su = Number(p.sourceUniverse);
                const key = p.outputKey;
                if (Number.isNaN(su) || !key) continue;
                const inIdx = this._inputSpecs.findIndex((s) => Number(s.universe) === su);
                const outIdx = this._outputSpecs.findIndex((s) => s.key === key);
                if (inIdx >= 0 && outIdx >= 0) {
                    const pid =
                        p.processblockId != null && p.processblockId !== '' ? Number(p.processblockId) : null;
                    const dup = this.connections.some(
                        (c) =>
                            c.inIdx === inIdx &&
                            c.outIdx === outIdx &&
                            (c.processblockId == null ? pid == null : Number(c.processblockId) === pid)
                    );
                    if (!dup) this.connections.push({ inIdx, outIdx, processblockId: pid });
                }
            }
            this._redraw();
            this._emitChange();
        }

        setLabels(i18n) {
            this.i18n = { ...this.i18n, ...i18n };
            if (!this.dynamic) this._applyLabels();
            else {
                const tin = this._layer && this._layer.querySelector('[data-lum-col="in"]');
                const tout = this._layer && this._layer.querySelector('[data-lum-col="out"]');
                const te = this._layer && this._layer.querySelector('[data-lum-col="engine"]');
                if (tin) tin.textContent = i18n.inputsTitle || tin.textContent;
                if (tout) tout.textContent = i18n.outputsTitle || tout.textContent;
                if (te) te.textContent = i18n.engineColumnTitle || te.textContent;
                const elab = this._layer && this._layer.querySelector('[data-lum-engine-label]');
                if (elab && i18n.engineHubLabel != null) elab.textContent = i18n.engineHubLabel;
                const emptyMsg = this._layer && this._layer.querySelector('[data-lum-empty-msg]');
                if (emptyMsg && i18n.emptyInputsHint != null) emptyMsg.textContent = i18n.emptyInputsHint;
                const dch = this._layer && this._layer.querySelector('[data-lum-drag-hint]');
                if (dch && i18n.dragCanvasHint != null) dch.textContent = i18n.dragCanvasHint;
                if (i18n.dragHint != null) {
                    this._layer.querySelectorAll('.luminex-matrix-port--sacn').forEach((p) => {
                        p.title = i18n.dragHint;
                    });
                }
                if (i18n.notSeenInScanShort != null) {
                    this._layer.querySelectorAll('.luminex-sacn-scan-hint').forEach((el) => {
                        el.textContent = i18n.notSeenInScanShort;
                    });
                }
                if (i18n.sourceLanOnly != null) {
                    this._layer.querySelectorAll('.luminex-sacn-lan-only-hint').forEach((el) => {
                        el.textContent = i18n.sourceLanOnly;
                    });
                }
                if (i18n.mergeLine != null || i18n.mergeLineModeOnly != null) {
                    this._layer.querySelectorAll('[data-lum-merge-htp]').forEach((el) => {
                        const raw = el.getAttribute('data-lum-merge-htp') || '';
                        const mode = (el.getAttribute('data-lum-merge-mode') || 'HTP').trim() || 'HTP';
                        const tpl = i18n.mergeLine || '{mode} {universes}';
                        const empty = i18n.mergeLineModeOnly || '{mode}';
                        el.textContent = raw.trim()
                            ? tpl.replace(/\{mode\}/g, mode).replace(/\{universes\}/g, raw)
                            : empty.replace(/\{mode\}/g, mode);
                    });
                }
            }
        }

        /** Toont welke process engine in het midden van het schema hoort (signaal loopt hierlangs). */
        setEngineSpec(spec) {
            if (!this.dynamic || !this._layer) return;
            this._engineSpec = {
                name: spec && spec.name != null ? String(spec.name) : '',
                id: spec && spec.id != null ? Number(spec.id) : null
            };
            const nameEl = this._layer.querySelector('[data-lum-engine-name]');
            if (nameEl) {
                const n = (this._engineSpec.name || '').trim();
                const id = this._engineSpec.id;
                if (!n) {
                    nameEl.textContent = '—';
                } else if (id != null && !Number.isNaN(id)) {
                    nameEl.textContent = `${n} · id ${id}`;
                } else {
                    nameEl.textContent = n;
                }
                nameEl.setAttribute('title', nameEl.textContent);
            }
        }

        _buildDom() {
            const wrap = document.createElement('div');
            const hub = this.dynamic;
            wrap.className =
                'luminex-matrix-canvas' +
                (this.dynamic ? ' luminex-matrix-canvas--dynamic' : '') +
                (hub ? ' luminex-matrix-canvas--hub luminex-matrix-canvas--free' : '');
            if (hub) {
                wrap.innerHTML = `
                <svg class="luminex-matrix-svg" aria-hidden="true"></svg>
                <div class="luminex-matrix-free">
                    <div class="luminex-matrix-free-legend">
                        <span class="luminex-matrix-legend-t" data-lum-col="in"></span>
                        <span class="luminex-matrix-legend-t" data-lum-col="engine"></span>
                        <span class="luminex-matrix-legend-t" data-lum-col="out"></span>
                    </div>
                    <p class="luminex-matrix-drag-hint" data-lum-drag-hint></p>
                    <div class="luminex-matrix-free-nodes" data-lum-free-nodes></div>
                </div>
            `;
            } else {
                wrap.innerHTML = `
                <svg class="luminex-matrix-svg" aria-hidden="true"></svg>
                <div class="luminex-matrix-columns">
                    <div class="luminex-matrix-col luminex-matrix-col--in">
                        <div class="luminex-matrix-col-title" data-lum-col="in"></div>
                        <div class="luminex-matrix-port-list" data-lum-ports="in"></div>
                    </div>
                    <div class="luminex-matrix-col luminex-matrix-col--out">
                        <div class="luminex-matrix-col-title" data-lum-col="out"></div>
                        <div class="luminex-matrix-port-list" data-lum-ports="out"></div>
                    </div>
                </div>
            `;
            }
            this.root.appendChild(wrap);
            this._layer = wrap;
            this._svg = wrap.querySelector('.luminex-matrix-svg');

            const tin = wrap.querySelector('[data-lum-col="in"]');
            const tout = wrap.querySelector('[data-lum-col="out"]');
            if (tin) tin.textContent = this.i18n.inputsTitle || 'Ingangen';
            if (tout) tout.textContent = this.i18n.outputsTitle || 'Uitgangen';
            const te = wrap.querySelector('[data-lum-col="engine"]');
            if (te) te.textContent = this.i18n.engineColumnTitle || 'Process engine';
            const elab = wrap.querySelector('[data-lum-engine-label]');
            if (elab) elab.textContent = this.i18n.engineHubLabel || '';
            const dragHint = wrap.querySelector('[data-lum-drag-hint]');
            if (dragHint) dragHint.textContent = this.i18n.dragCanvasHint || '';

            this._svg.addEventListener('click', (e) => {
                const hit = e.target.closest('[data-conn-index]');
                if (hit && hit.dataset.connIndex !== undefined) {
                    const idx = parseInt(hit.dataset.connIndex, 10);
                    if (!Number.isNaN(idx)) {
                        this.connections.splice(idx, 1);
                        this._redraw();
                        this._emitChange();
                    }
                }
            });
        }

        _buildFixedPorts() {
            const wrap = this._layer;
            const listIn = wrap.querySelector('[data-lum-ports="in"]');
            const listOut = wrap.querySelector('[data-lum-ports="out"]');
            for (let i = 0; i < this.inputCount; i++) {
                const row = this._makeLegacyPortRow('in', i);
                listIn.appendChild(row);
                this._portsIn.set(i, row.querySelector('.luminex-matrix-port'));
            }
            for (let i = 0; i < this.outputCount; i++) {
                const row = this._makeLegacyPortRow('out', i);
                listOut.appendChild(row);
                this._portsOut.set(i, row.querySelector('.luminex-matrix-port'));
            }
        }

        _fillEngineRowName(row, spec) {
            const nameEl = row.querySelector('[data-lum-engine-name]');
            if (!nameEl) return;
            const n = spec && spec.name != null ? String(spec.name).trim() : '';
            const id = spec && spec.id != null ? Number(spec.id) : null;
            if (!n) {
                nameEl.textContent = '—';
            } else if (id != null && !Number.isNaN(id)) {
                nameEl.textContent = `${n} · id ${id}`;
            } else {
                nameEl.textContent = n;
            }
            nameEl.setAttribute('title', nameEl.textContent);
        }

        _createEngineNodeRow(layoutKey) {
            const nk = layoutKey || 'engine';
            const row = document.createElement('div');
            row.className =
                'luminex-matrix-row luminex-matrix-row--engine luminex-node-card luminex-node-card--engine luminex-matrix-node luminex-matrix-node--free';
            row.setAttribute('data-lum-nk', nk);
            row.innerHTML = `
                <button type="button" class="luminex-matrix-port luminex-matrix-port--engine-in" data-lum-engine-port="in" tabindex="-1" aria-hidden="true"></button>
                <div class="luminex-engine-node luminex-node-card__body">
                    <div class="luminex-engine-icon-wrap">
                        <i class="fas fa-microchip" aria-hidden="true"></i>
                    </div>
                    <div class="luminex-engine-text">
                        <span class="luminex-engine-hub-label" data-lum-engine-label></span>
                        <span class="luminex-engine-hub-name" data-lum-engine-name="">—</span>
                    </div>
                </div>
                <button type="button" class="luminex-matrix-port luminex-matrix-port--engine-out" data-lum-engine-port="out" tabindex="-1" aria-hidden="true"></button>
            `;
            const elab = row.querySelector('[data-lum-engine-label]');
            if (elab) elab.textContent = this.i18n.engineHubLabel || '';
            return row;
        }

        _rebuildDynamicLists() {
            const nodesRoot = this._layer.querySelector('[data-lum-free-nodes]');
            if (!nodesRoot) return;
            nodesRoot.innerHTML = '';
            this._portsIn = new Map();
            this._portsOut = new Map();
            this._enginePortMap = new Map();

            const multi = this._useMultiEngine();

            if (this._inputSpecs.length === 0) {
                const empty = document.createElement('div');
                empty.className =
                    'luminex-matrix-empty luminex-matrix-node luminex-matrix-node--free luminex-matrix-empty-node';
                empty.setAttribute('data-lum-nk', 'empty_in');
                const inner = document.createElement('div');
                inner.className = 'luminex-matrix-empty-inner';
                const icon = document.createElement('div');
                icon.className = 'luminex-matrix-empty-icon';
                icon.setAttribute('aria-hidden', 'true');
                icon.innerHTML = '<i class="fas fa-broadcast-tower"></i>';
                const msg = document.createElement('p');
                msg.className = 'luminex-matrix-empty-msg';
                msg.setAttribute('data-lum-empty-msg', '1');
                msg.textContent = this.i18n.emptyInputsHint || '';
                inner.appendChild(icon);
                inner.appendChild(msg);
                empty.appendChild(inner);
                nodesRoot.appendChild(empty);
                this._bindFreeDrag(empty);
            } else if (multi) {
                for (let ii = 0; ii < this._inputSpecs.length; ii++) {
                    const spec = this._inputSpecs[ii];
                    const row = this._makeSacnInputRow(spec, ii);
                    nodesRoot.appendChild(row);
                    this._portsIn.set(ii, row.querySelector('.luminex-matrix-port'));
                    this._bindFreeDrag(row);
                }
                for (const block of this._engineBlockSpecs) {
                    const pbId = Number(block.id);
                    const engineRow = this._createEngineNodeRow(`engine_pb_${pbId}`);
                    const teLab = engineRow.querySelector('[data-lum-engine-label]');
                    if (teLab) teLab.textContent = this.i18n.engineHubLabel || '';
                    nodesRoot.appendChild(engineRow);
                    this._bindFreeDrag(engineRow);
                    const pIn = engineRow.querySelector('[data-lum-engine-port="in"]');
                    const pOut = engineRow.querySelector('[data-lum-engine-port="out"]');
                    if (pIn && pOut) this._enginePortMap.set(pbId, { pIn, pOut });
                    this._fillEngineRowName(engineRow, { name: block.name, id: block.id });
                }
                this._outputSpecs.forEach((spec, i) => {
                    const row = this._makeOutputRow(spec, i);
                    nodesRoot.appendChild(row);
                    this._portsOut.set(i, row.querySelector('.luminex-matrix-port'));
                    this._bindFreeDrag(row);
                });
                this._applyFreePositions();
            } else {
                this._inputSpecs.forEach((spec, i) => {
                    const row = this._makeSacnInputRow(spec, i);
                    nodesRoot.appendChild(row);
                    this._portsIn.set(i, row.querySelector('.luminex-matrix-port'));
                    this._bindFreeDrag(row);
                });

                const engineRow = this._createEngineNodeRow('engine');
                nodesRoot.appendChild(engineRow);
                this._bindFreeDrag(engineRow);
                const teLab = engineRow.querySelector('[data-lum-engine-label]');
                if (teLab) teLab.textContent = this.i18n.engineHubLabel || '';

                this._outputSpecs.forEach((spec, i) => {
                    const row = this._makeOutputRow(spec, i);
                    nodesRoot.appendChild(row);
                    this._portsOut.set(i, row.querySelector('.luminex-matrix-port'));
                    this._bindFreeDrag(row);
                });

                this._applyFreePositions();
                this.setEngineSpec(this._engineSpec);
            }
        }

        _makeSacnInputRow(spec, index) {
            const row = document.createElement('div');
            const live = spec.liveSacn === true;
            const fromDev = spec.fromDevice === true;
            const mergeFe = spec.mergeFromEngine === true;
            const sacnKind =
                fromDev && !live
                    ? ' luminex-node-card--sacn-config-only'
                    : ' luminex-node-card--sacn-live';
            row.className =
                'luminex-matrix-row luminex-matrix-row--sacn luminex-node-card luminex-matrix-node luminex-matrix-node--free' +
                (mergeFe
                    ? ' luminex-matrix-row--sacn-merge-layout luminex-node-card--sacn-merge-out luminex-node-card--out'
                    : ' luminex-node-card--in') +
                sacnKind +
                (!fromDev ? ' luminex-node-card--from-lan-scan' : '') +
                (mergeFe ? ' luminex-node-card--sacn-merge-engine' : '');
            row.setAttribute('data-lum-nk', this._inputLayoutKey(spec));
            row.setAttribute('data-lum-merge-out', mergeFe ? '1' : '');

            const text = document.createElement('div');
            text.className = 'luminex-sacn-text' + (mergeFe ? ' luminex-out-text luminex-sacn-text--merge-out' : '');
            const uEl = document.createElement('span');
            uEl.className = 'luminex-sacn-u';
            uEl.textContent = `Universe ${spec.universe}`;
            text.appendChild(uEl);
            if (mergeFe) {
                const htp = document.createElement('span');
                htp.className = 'luminex-sacn-merge-htp-line';
                const uniList = Array.isArray(spec.mergeHtpUniverses)
                    ? spec.mergeHtpUniverses.map((n) => Number(n)).filter((n) => !Number.isNaN(n))
                    : [];
                const uniStr = uniList.join(', ');
                const mode = (spec.mergeModeLabel && String(spec.mergeModeLabel).trim()) || 'HTP';
                htp.setAttribute('data-lum-merge-htp', uniStr);
                htp.setAttribute('data-lum-merge-mode', mode);
                const tpl = (this.i18n.mergeLine && String(this.i18n.mergeLine)) || '{mode} {universes}';
                const empty = (this.i18n.mergeLineModeOnly && String(this.i18n.mergeLineModeOnly)) || '{mode}';
                htp.textContent = uniStr
                    ? tpl.replace(/\{mode\}/g, mode).replace(/\{universes\}/g, uniStr)
                    : empty.replace(/\{mode\}/g, mode);
                text.appendChild(htp);
            } else {
                const nameEl = document.createElement('span');
                nameEl.className = 'luminex-sacn-name';
                nameEl.textContent = spec.sourceName || 'sACN-signaal';
                const ipEl = document.createElement('span');
                ipEl.className = 'luminex-sacn-ip';
                ipEl.textContent = spec.sourceAddress || '';
                text.appendChild(nameEl);
                if (spec.networkTag && String(spec.networkTag).trim()) {
                    const netEl = document.createElement('span');
                    netEl.className = 'luminex-sacn-network';
                    const pfx = (this.i18n.sourceNetworkLine && String(this.i18n.sourceNetworkLine).trim()) || '';
                    netEl.textContent = pfx ? `${pfx}: ${String(spec.networkTag).trim()}` : String(spec.networkTag).trim();
                    text.appendChild(netEl);
                }
                if (spec.sourceAddress) text.appendChild(ipEl);
                if (fromDev && !live) {
                    const hint = document.createElement('span');
                    hint.className = 'luminex-sacn-scan-hint';
                    hint.textContent = this.i18n.notSeenInScanShort || '';
                    text.appendChild(hint);
                }
            }

            if (mergeFe) {
                const body = document.createElement('div');
                body.className = 'luminex-out-node luminex-sacn-node--merge-output luminex-node-card__body';
                const iconWrap = document.createElement('div');
                iconWrap.className =
                    'luminex-sacn-icon-wrap luminex-sacn-icon-wrap--out-merge luminex-sacn-merge-out-icon';
                iconWrap.innerHTML = '<i class="fas fa-broadcast-tower" aria-hidden="true"></i>';
                const flowOut = document.createElement('span');
                flowOut.className = 'luminex-stream-arrow luminex-stream-arrow--out';
                flowOut.setAttribute('aria-hidden', 'true');
                flowOut.innerHTML = '<i class="fas fa-arrow-right" aria-hidden="true"></i>';
                body.appendChild(iconWrap);
                body.appendChild(flowOut);
                body.appendChild(text);
                const port = document.createElement('button');
                port.type = 'button';
                port.className = 'luminex-matrix-port luminex-matrix-port--sacn luminex-matrix-port--merge-echo';
                port.dataset.portKind = 'in';
                port.dataset.portIndex = String(index);
                port.dataset.universe = String(spec.universe);
                port.title = this.i18n.dragHint || '';
                port.setAttribute('aria-label', `sACN universe ${spec.universe} (uitgang na merge)`);
                row.appendChild(port);
                row.appendChild(body);
                port.addEventListener('pointerdown', (e) => this._startDrag(e, index));
                return row;
            }

            const node = document.createElement('div');
            node.className = 'luminex-sacn-node luminex-node-card__body';
            const flowIn = document.createElement('span');
            flowIn.className =
                'luminex-stream-arrow luminex-stream-arrow--in' + (live ? ' luminex-stream-arrow--live' : '');
            flowIn.setAttribute('aria-hidden', 'true');
            flowIn.innerHTML = '<i class="fas fa-arrow-right" aria-hidden="true"></i>';
            const iconWrap = document.createElement('div');
            iconWrap.className = 'luminex-sacn-icon-wrap';
            iconWrap.innerHTML = '<i class="fas fa-broadcast-tower" aria-hidden="true"></i>';
            node.appendChild(flowIn);
            node.appendChild(iconWrap);
            node.appendChild(text);

            const port = document.createElement('button');
            port.type = 'button';
            port.className = 'luminex-matrix-port luminex-matrix-port--sacn';
            port.dataset.portKind = 'in';
            port.dataset.portIndex = String(index);
            port.dataset.universe = String(spec.universe);
            port.title = this.i18n.dragHint || '';
            port.setAttribute('aria-label', `sACN universe ${spec.universe}`);

            row.appendChild(node);
            row.appendChild(port);
            port.addEventListener('pointerdown', (e) => this._startDrag(e, index));
            return row;
        }

        _makeOutputRow(spec, index) {
            const row = document.createElement('div');
            row.className =
                'luminex-matrix-row luminex-matrix-row--out luminex-node-card luminex-node-card--out luminex-matrix-node luminex-matrix-node--free';
            if (spec.hidden) {
                row.classList.add('luminex-matrix-row--output-hidden');
                row.setAttribute('aria-hidden', 'true');
            }
            row.setAttribute('data-lum-nk', this._outPosKey(spec.key));
            const port = document.createElement('button');
            port.type = 'button';
            port.className = 'luminex-matrix-port luminex-matrix-port--out';
            port.dataset.portKind = 'out';
            port.dataset.portIndex = String(index);
            port.dataset.outputKey = spec.key || '';
            port.setAttribute('aria-label', spec.label || `Uitgang ${index + 1}`);
            const body = document.createElement('div');
            body.className = 'luminex-out-node luminex-node-card__body';
            const isDmx =
                /^dmx:\d+$/i.test(String(spec.key || '')) ||
                String(spec.ioClass || '').toLowerCase() === 'dmx';
            const iconWrap = document.createElement('div');
            iconWrap.className = 'luminex-out-icon-wrap' + (isDmx ? ' luminex-out-icon-wrap--dmx' : '');
            iconWrap.innerHTML = isDmx ? ICON_DMX_FEMALE_XLR : '<i class="fas fa-plug" aria-hidden="true"></i>';
            const flowOut = document.createElement('span');
            flowOut.className = 'luminex-stream-arrow luminex-stream-arrow--out';
            flowOut.setAttribute('aria-hidden', 'true');
            flowOut.innerHTML = '<i class="fas fa-arrow-right" aria-hidden="true"></i>';
            const text = document.createElement('div');
            text.className = 'luminex-out-text';
            const span = document.createElement('span');
            span.className = 'luminex-out-label-text';
            span.textContent = spec.label || `Uitgang ${index + 1}`;
            text.appendChild(span);
            body.appendChild(iconWrap);
            body.appendChild(flowOut);
            body.appendChild(text);
            row.appendChild(port);
            row.appendChild(body);
            return row;
        }

        _makeLegacyPortRow(kind, index) {
            const row = document.createElement('div');
            row.className = 'luminex-matrix-row';
            const label = document.createElement('span');
            label.className = 'luminex-matrix-row-label';
            const port = document.createElement('button');
            port.type = 'button';
            port.className = 'luminex-matrix-port';
            port.dataset.portKind = kind;
            port.dataset.portIndex = String(index);
            port.setAttribute('aria-label', `${kind} ${index + 1}`);

            if (kind === 'in') {
                row.appendChild(label);
                row.appendChild(port);
                port.addEventListener('pointerdown', (e) => this._startDrag(e, index));
            } else {
                row.appendChild(port);
                row.appendChild(label);
            }
            return row;
        }

        _applyLabels() {
            const g = this._layer;
            if (!g) return;
            const tin = g.querySelector('[data-lum-col="in"]');
            const tout = g.querySelector('[data-lum-col="out"]');
            if (tin) tin.textContent = this.i18n.inputsTitle || 'Ingangen';
            if (tout) tout.textContent = this.i18n.outputsTitle || 'Uitgangen';
            g.querySelectorAll('[data-port-kind="in"]').forEach((p) => {
                const i = parseInt(p.dataset.portIndex, 10);
                const span = p.closest('.luminex-matrix-row')?.querySelector('.luminex-matrix-row-label');
                if (span) span.textContent = this.i18n.getLabelIn ? this.i18n.getLabelIn(i) : `In ${i + 1}`;
            });
            g.querySelectorAll('[data-port-kind="out"]').forEach((p) => {
                const i = parseInt(p.dataset.portIndex, 10);
                const span = p.closest('.luminex-matrix-row')?.querySelector('.luminex-matrix-row-label');
                if (span) span.textContent = this.i18n.getLabelOut ? this.i18n.getLabelOut(i) : `Uit ${i + 1}`;
            });
        }

        _emitChange() {
            if (this.onChange) {
                try {
                    this.onChange(this.getRoutePatches());
                } catch (_) {
                    /* ignore */
                }
            }
        }

        _wireResize() {
            this._resizeObs = new ResizeObserver(() => {
                if (this._raf) cancelAnimationFrame(this._raf);
                this._raf = requestAnimationFrame(() => this._redraw());
            });
            this._resizeObs.observe(this._layer);
            window.addEventListener('resize', this._onResize);
        }

        _onResize() {
            if (this._raf) cancelAnimationFrame(this._raf);
            this._raf = requestAnimationFrame(() => this._redraw());
        }

        _startDrag(e, index) {
            e.preventDefault();
            e.stopPropagation();
            const portEl = e.currentTarget;
            try {
                portEl.setPointerCapture(e.pointerId);
            } catch (_) {
                /* ignore */
            }
            this._drag = {
                inIdx: index,
                startX: e.clientX,
                startY: e.clientY,
                curX: null,
                curY: null,
                pointerId: e.pointerId,
                portEl
            };
            document.addEventListener('pointermove', this._onPointerMove);
            document.addEventListener('pointerup', this._onPointerUp);
            this._redraw();
        }

        _onPointerMove(e) {
            if (!this._drag) return;
            this._drag.curX = e.clientX;
            this._drag.curY = e.clientY;
            this._redraw();
        }

        _nearestOutputIndexAt(clientX, clientY) {
            if (!this._layer) return null;
            const outs = this._layer.querySelectorAll('[data-port-kind="out"]');
            let bestIdx = null;
            let best = Infinity;
            outs.forEach((btn) => {
                const r = btn.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const d = (cx - clientX) ** 2 + (cy - clientY) ** 2;
                if (d < best) {
                    best = d;
                    const ix = parseInt(btn.dataset.portIndex, 10);
                    bestIdx = Number.isNaN(ix) ? null : ix;
                }
            });
            return bestIdx;
        }

        _engineProcessblockIdFromElement(el) {
            if (!el || !el.closest) return null;
            const row = el.closest('.luminex-matrix-row--engine');
            if (!row) return null;
            const nk = row.getAttribute('data-lum-nk') || '';
            const m = /^engine_pb_(\d+)$/.exec(nk);
            if (!m) return null;
            const id = Number(m[1]);
            return Number.isNaN(id) ? null : id;
        }

        _onPointerUp(e) {
            if (!this._drag) return;
            const { inIdx, pointerId, portEl } = this._drag;
            let outIdx = null;
            let forcedPbId = null;
            if (e && typeof e.clientX === 'number') {
                const el = document.elementFromPoint(e.clientX, e.clientY);
                let outBtn = el && el.closest && el.closest('[data-port-kind="out"]');
                if (!outBtn && el && el.closest) {
                    const row = el.closest('.luminex-node-card--out');
                    if (row) outBtn = row.querySelector('[data-port-kind="out"]');
                }
                if (outBtn) {
                    outIdx = parseInt(outBtn.dataset.portIndex, 10);
                    if (Number.isNaN(outIdx)) outIdx = null;
                }
                if (outIdx === null && el && el.closest && this._layer && this._layer.contains(el)) {
                    const onEngine =
                        el.closest('.luminex-matrix-row--engine') ||
                        el.closest('[data-lum-engine-port]');
                    if (onEngine) {
                        forcedPbId = this._engineProcessblockIdFromElement(el);
                        outIdx = this._nearestOutputIndexAt(e.clientX, e.clientY);
                    }
                }
            }
            document.removeEventListener('pointermove', this._onPointerMove);
            document.removeEventListener('pointerup', this._onPointerUp);
            this._drag = null;
            if (pointerId != null && portEl && typeof portEl.releasePointerCapture === 'function') {
                try {
                    portEl.releasePointerCapture(pointerId);
                } catch (_) {
                    /* ignore */
                }
            }
            if (outIdx !== null && inIdx !== undefined) {
                const multi = this._useMultiEngine();
                const pbId =
                    multi && forcedPbId != null
                        ? forcedPbId
                        : multi
                          ? this._pickProcessblockForNewConnection(inIdx, outIdx)
                          : null;
                const exists = this.connections.some((c) => {
                    if (c.inIdx !== inIdx || c.outIdx !== outIdx) return false;
                    if (!multi) return true;
                    const ca =
                        c.processblockId != null && c.processblockId !== ''
                            ? Number(c.processblockId)
                            : null;
                    const cb = pbId != null && !Number.isNaN(Number(pbId)) ? Number(pbId) : null;
                    return ca === cb;
                });
                if (!exists) {
                    this.connections.push({
                        inIdx,
                        outIdx,
                        processblockId: multi ? pbId : null
                    });
                }
                this._emitChange();
            }
            this._redraw();
        }

        _portCenter(el) {
            if (!this._layer || !el) return { x: 0, y: 0 };
            const rect = el.getBoundingClientRect();
            const layerRect = this._layer.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2 - layerRect.left,
                y: rect.top + rect.height / 2 - layerRect.top
            };
        }

        _enginePortElements() {
            if (!this._layer) return null;
            const pIn = this._layer.querySelector('[data-lum-engine-port="in"]');
            const pOut = this._layer.querySelector('[data-lum-engine-port="out"]');
            if (!pIn || !pOut) return null;
            return { pIn, pOut };
        }

        /** Engine-poorten voor merge-orphan / legacy: zonder verbinding-spec, o.a. eerste engine bij merge. */
        _enginePortsForInputSpec(spec) {
            if (!this.dynamic || !this._layer) return null;
            if (this._useMultiEngine()) {
                if (spec && spec.processblockId != null) {
                    const eng = this._enginePortMap.get(Number(spec.processblockId));
                    if (eng && eng.pIn && eng.pOut) return eng;
                }
                if (spec && spec.mergeFromEngine === true) {
                    const first = this._engineBlockSpecs && this._engineBlockSpecs[0];
                    if (first) {
                        const eng = this._enginePortMap.get(Number(first.id));
                        if (eng && eng.pIn && eng.pOut) return eng;
                    }
                }
                return null;
            }
            return this._enginePortElements();
        }

        /** Welke engine hoort bij deze patchverbinding (processblockId op de verbinding). */
        _enginePortsForConnection(conn) {
            if (!this.dynamic || !this._layer) return null;
            let pid = conn.processblockId;
            if (pid == null || Number.isNaN(Number(pid))) {
                const specIn = this._inputSpecs[conn.inIdx];
                pid = specIn && specIn.processblockId != null ? Number(specIn.processblockId) : null;
            }
            if (this._useMultiEngine()) {
                if (pid != null && !Number.isNaN(pid)) {
                    const eng = this._enginePortMap.get(Number(pid));
                    if (eng && eng.pIn && eng.pOut) return eng;
                }
                const first = this._engineBlockSpecs && this._engineBlockSpecs[0];
                if (first) {
                    const eng = this._enginePortMap.get(Number(first.id));
                    if (eng && eng.pIn && eng.pOut) return eng;
                }
                return null;
            }
            return this._enginePortElements();
        }

        /**
         * Nieuwe patch: kies engine (dichtst bij het pad invoer→uitgang; zonder uitgang: verticaal bij invoer).
         */
        _pickProcessblockForNewConnection(inIdx, outIdx) {
            const specs = this._engineBlockSpecs;
            if (!specs || specs.length === 0) return null;
            if (specs.length === 1) return Number(specs[0].id);
            const pin = this._portsIn.get(inIdx);
            const pout = outIdx != null && outIdx >= 0 ? this._portsOut.get(outIdx) : null;
            const a = pin ? this._portCenter(pin) : { x: 0, y: 0 };
            if (!pout) {
                let bestId = Number(specs[0].id);
                let bestD = Infinity;
                for (const block of specs) {
                    const eng = this._enginePortMap.get(Number(block.id));
                    if (!eng || !eng.pIn) continue;
                    const ce = this._portCenter(eng.pIn);
                    /* Engines kunnen op één rij naast elkaar staan: voorkeur op horizontale nabijheid. */
                    const d = Math.abs(ce.x - a.x) + Math.abs(ce.y - a.y) * 0.4;
                    if (d < bestD) {
                        bestD = d;
                        bestId = Number(block.id);
                    }
                }
                return bestId;
            }
            const b = this._portCenter(pout);
            const midY = (a.y + b.y) / 2;
            const midX = (a.x + b.x) / 2;
            let bestId = Number(specs[0].id);
            let bestD = Infinity;
            for (const block of specs) {
                const eng = this._enginePortMap.get(Number(block.id));
                if (!eng || !eng.pIn) continue;
                const ce = this._portCenter(eng.pIn);
                const d = Math.abs(ce.y - midY) + Math.abs(ce.x - midX) * 0.15;
                if (d < bestD) {
                    bestD = d;
                    bestId = Number(block.id);
                }
            }
            return bestId;
        }

        _appendConnPaths(d1, d2, color, connVisualIndex) {
            const idx = String(connVisualIndex);
            const delay = `${-(connVisualIndex % 8) * 0.12}s`;
            const mk = (d, cls, extra = {}) => {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', d);
                path.setAttribute('class', cls);
                if (!cls.includes('luminex-matrix-link--flow')) path.setAttribute('stroke', color);
                path.dataset.connIndex = idx;
                if (extra.style) path.setAttribute('style', extra.style);
                this._svg.appendChild(path);
            };
            mk(d1, 'luminex-matrix-link luminex-matrix-link--base');
            mk(d2, 'luminex-matrix-link luminex-matrix-link--base');
            mk(d1, 'luminex-matrix-link luminex-matrix-link--flow', { style: `animation-delay:${delay}` });
            mk(d2, 'luminex-matrix-link luminex-matrix-link--flow', { style: `animation-delay:${delay}` });
            mk(d1, 'luminex-matrix-link-hit');
            mk(d2, 'luminex-matrix-link-hit');
        }

        /** Eén segment (engine → merge-sACN-poort) als er nog geen patchverbinding voor die invoer bestaat. */
        _appendSingleConnPath(d, color, connVisualIndex) {
            const delay = `${-(connVisualIndex % 8) * 0.12}s`;
            const mk = (dPath, cls, extra = {}) => {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', dPath);
                path.setAttribute('class', cls);
                if (!cls.includes('luminex-matrix-link--flow')) path.setAttribute('stroke', color);
                if (extra.style) path.setAttribute('style', extra.style);
                this._svg.appendChild(path);
            };
            mk(d, 'luminex-matrix-link luminex-matrix-link--base luminex-matrix-link--merge-sacn-orphan');
            mk(d, 'luminex-matrix-link luminex-matrix-link--flow luminex-matrix-link--merge-sacn-orphan', {
                style: `animation-delay:${delay}`
            });
            mk(d, 'luminex-matrix-link-hit luminex-matrix-link-hit--non-interactive');
        }

        _redraw() {
            if (!this._svg || !this._layer) return;
            const w = this._layer.clientWidth;
            const h = this._layer.clientHeight;
            this._svg.setAttribute('width', String(w));
            this._svg.setAttribute('height', String(h));
            this._svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            this._svg.innerHTML = '';

            let c = 0;
            for (let ci = 0; ci < this.connections.length; ci++) {
                const conn = this.connections[ci];
                const pin = this._portsIn.get(conn.inIdx);
                const pout = this._portsOut.get(conn.outIdx);
                if (!pin || !pout) continue;
                const specOut = this._outputSpecs[conn.outIdx];
                if (specOut && specOut.hidden) continue;
                const a = this._portCenter(pin);
                const b = this._portCenter(pout);
                const col = COLORS[c % COLORS.length];
                const specIn = this._inputSpecs[conn.inIdx];
                const eng = this.dynamic ? this._enginePortsForConnection(conn) : null;
                if (eng) {
                    const pEIn = this._portCenter(eng.pIn);
                    const pEOut = this._portCenter(eng.pOut);
                    if (specIn && specIn.mergeFromEngine) {
                        const d1 = bezierPath(pEOut.x, pEOut.y, a.x, a.y);
                        const d2 = bezierPath(pEOut.x, pEOut.y, b.x, b.y);
                        this._appendConnPaths(d1, d2, col, ci);
                    } else {
                        const { d1, d2 } = bezierThroughEngine(a.x, a.y, pEIn.x, pEIn.y, pEOut.x, pEOut.y, b.x, b.y);
                        this._appendConnPaths(d1, d2, col, ci);
                    }
                } else {
                    const d = bezierPath(a.x, a.y, b.x, b.y);
                    const idx = String(ci);
                    const delay = `${-(c % 8) * 0.12}s`;
                    const base = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    base.setAttribute('d', d);
                    base.setAttribute('class', 'luminex-matrix-link luminex-matrix-link--base');
                    base.setAttribute('stroke', col);
                    base.dataset.connIndex = idx;
                    this._svg.appendChild(base);
                    const flow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    flow.setAttribute('d', d);
                    flow.setAttribute('class', 'luminex-matrix-link luminex-matrix-link--flow');
                    flow.setAttribute('style', `animation-delay:${delay}`);
                    flow.dataset.connIndex = idx;
                    this._svg.appendChild(flow);
                    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    hit.setAttribute('d', d);
                    hit.setAttribute('class', 'luminex-matrix-link-hit');
                    hit.dataset.connIndex = idx;
                    this._svg.appendChild(hit);
                }
                c++;
            }

            if (this.dynamic) {
                const mergeInIdxWithConn = new Set();
                for (const conn of this.connections) {
                    const sin0 = this._inputSpecs[conn.inIdx];
                    if (sin0 && sin0.mergeFromEngine) mergeInIdxWithConn.add(conn.inIdx);
                }
                for (let i = 0; i < this._inputSpecs.length; i++) {
                    const spec = this._inputSpecs[i];
                    if (!spec || !spec.mergeFromEngine) continue;
                    if (mergeInIdxWithConn.has(i)) continue;
                    const pinM = this._portsIn.get(i);
                    if (!pinM) continue;
                    const engM = this._enginePortsForInputSpec(spec);
                    if (!engM) continue;
                    const pEOut = this._portCenter(engM.pOut);
                    const a = this._portCenter(pinM);
                    const d = bezierPath(pEOut.x, pEOut.y, a.x, a.y);
                    const col = COLORS[c % COLORS.length];
                    this._appendSingleConnPath(d, col, c);
                    c++;
                }
            }

            /* Slepen: één eenvoudige rubberband (bron → muis), geen hub-«suggestie». */
            if (this._drag) {
                const pin = this._portsIn.get(this._drag.inIdx);
                if (pin && this._layer) {
                    const a = this._portCenter(pin);
                    const layerRect = this._layer.getBoundingClientRect();
                    const bx = (this._drag.curX ?? this._drag.startX) - layerRect.left;
                    const by = (this._drag.curY ?? this._drag.startY) - layerRect.top;
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', bezierPath(a.x, a.y, bx, by));
                    path.setAttribute('class', 'luminex-matrix-link luminex-matrix-link--preview');
                    this._svg.appendChild(path);
                }
            }
        }
    }

    window.LuminexMatrixView = LuminexMatrixView;
})();
