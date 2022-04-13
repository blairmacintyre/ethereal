import { Bounds, downloadBlob, Edges, getBorder, getBounds, getMargin, getPadding } from "./dom-utils";
import Dexie from 'dexie';
// @ts-ignore
import { KTX2Encoder } from './textures/KTX2Encoder.bundle.js';
import { WebRenderer } from "./WebRenderer";
import { serializeToString } from "./serialization-utils";
import { getParentsHTML } from "./serialization-utils";
import { bufferToHex } from "./hex-utils";
import { Packr, Unpackr } from 'msgpackr';
import { compress, decompress } from 'fflate';
export class LayerStore extends Dexie {
    states;
    textures;
    constructor(name) {
        super(name);
        this.version(3).stores({
            states: '&hash',
            textures: '&hash, timestamp'
        });
    }
}
function nearestPowerOf2(n) {
    return 1 << 31 - Math.clz32(n);
}
function nextPowerOf2(n) {
    return nearestPowerOf2((n - 1) * 2);
}
export class WebLayerManagerBase {
    MINIMUM_RENDER_ATTEMPTS = 3;
    WebRenderer = WebRenderer;
    autosave = true;
    autosaveDelay = 10 * 1000;
    _autosaveTimer;
    pixelsPerMeter = 1000;
    /**
     * @deprecated
     */
    get pixelPerUnit() { return this.pixelsPerMeter; }
    store;
    serializeQueue = [];
    rasterizeQueue = [];
    optimizeQueue = [];
    textEncoder = new TextEncoder();
    ktx2Encoder = new KTX2Encoder();
    _unsavedTextureData = new Map();
    _stateData = new Map();
    _textureData = new Map();
    _imagePool = [];
    constructor(name = "ethereal-web-store") {
        this.store = new LayerStore(name);
    }
    saveStore() {
        const stateData = Array.from(this._stateData.entries())
            .filter(([k, v]) => typeof k === 'string')
            .map(([k, v]) => ({ hash: k, textureHash: v.texture?.hash }));
        const textureData = Array.from(this._unsavedTextureData.values());
        this._unsavedTextureData.clear();
        return this.loadIntoStore({
            stateData,
            textureData
        });
    }
    _packr = new Packr({ structuredClone: true });
    _unpackr = new Unpackr({ structuredClone: true });
    async importCache(url) {
        try {
            const response = await fetch(url);
            const zipped = await response.arrayBuffer();
            const buffer = await new Promise((resolve, reject) => {
                decompress(new Uint8Array(zipped), { consume: true }, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve(data);
                });
            });
            const data = this._unpackr.unpack(buffer);
            return this.loadIntoStore(data);
        }
        catch (err) {
            console.warn('Failed to import cache', err);
        }
    }
    getActiveStateHashes() {
        return Array.from(this._stateData.keys()).filter(k => typeof k === 'string');
    }
    /**
     * Export a cache file for the given state hashes
     * @param states by default all active states are exported
     * @returns
     */
    async exportCache(states = this.getActiveStateHashes()) {
        const stateData = await this.store.states.bulkGet(states);
        const textureData = await this.store.textures.bulkGet(stateData
            .map((v) => v.textureHash)
            .filter((v) => typeof v === 'string'));
        const data = { stateData, textureData };
        const buffer = this._packr.pack(data);
        return new Promise((resolve, reject) => {
            compress(buffer, { consume: true }, (err, data) => {
                if (err)
                    return reject(err);
                resolve(new Blob([data.buffer]));
            });
        });
    }
    /**
     * Export the cache data for this
     */
    async downloadCache() {
        await this.saveStore();
        const blob = await this.exportCache();
        const path = location.pathname.split('/').filter(x => x);
        downloadBlob(blob, 'web.' + location.host + '.' + (path[path.length - 1] ?? '') + '.cache');
    }
    async loadIntoStore(data) {
        return Promise.all([
            this.store.states.bulkPut(data.stateData),
            this.store.textures.bulkPut(data.textureData)
        ]);
    }
    getLayerState(hash) {
        let data = this._stateData.get(hash);
        if (!data) {
            data = {
                bounds: new Bounds,
                margin: new Edges,
                padding: new Edges,
                border: new Edges,
                fullWidth: 0,
                fullHeight: 0,
                renderAttempts: 0,
                textureWidth: 32,
                textureHeight: 32,
                pixelRatio: 1,
                texture: undefined,
                pseudo: {
                    hover: false,
                    active: false,
                    focus: false,
                    target: false
                }
            };
            this._stateData.set(hash, data);
        }
        return data;
    }
    getTextureState(textureHash) {
        let data = this._textureData.get(textureHash);
        if (!data) {
            data = {
                hash: textureHash,
                canvas: undefined,
                ktx2Url: undefined,
            };
            this._textureData.set(textureHash, data);
        }
        return data;
    }
    _statesRequestedFromStore = new Set();
    _texturesRequestedFromStore = new Set();
    async requestStoredData(hash) {
        const stateData = this.getLayerState(hash);
        if (typeof hash !== 'string')
            return stateData;
        if (!this._statesRequestedFromStore.has(hash)) {
            this._statesRequestedFromStore.add(hash);
            const state = await this.store.states.get(hash);
            if (state?.textureHash) {
                stateData.texture = this.getTextureState(state.textureHash);
            }
        }
        const textureData = stateData.texture;
        if (textureData && textureData.hash && !textureData.canvas && !textureData.ktx2Url &&
            !this._texturesRequestedFromStore.has(textureData?.hash)) {
            this._texturesRequestedFromStore.add(textureData.hash);
            const storedTexture = await this.store.textures.get(textureData.hash);
            if (storedTexture?.texture && !textureData.canvas) {
                const data = await new Promise((resolve, reject) => {
                    decompress(storedTexture.texture, { consume: true }, (err, data) => {
                        if (err)
                            return reject(err);
                        resolve(data);
                    });
                });
                if (!textureData.canvas) {
                    textureData.ktx2Url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/ktx2' }));
                }
            }
        }
        return stateData;
    }
    async compressTexture(textureHash) {
        const data = this._textureData.get(textureHash);
        const canvas = data?.canvas;
        if (!canvas)
            throw new Error('Missing texture canvas');
        const imageData = this.getImageData(canvas);
        const ktx2Texture = await this.ktx2Encoder.encode(imageData);
        const textureData = this._unsavedTextureData.get(textureHash) ||
            { hash: textureHash, timestamp: Date.now(), texture: undefined };
        data.ktx2Url = URL.createObjectURL(new Blob([ktx2Texture], { type: 'image/ktx2' }));
        const bufferData = await new Promise((resolve, reject) => {
            compress(new Uint8Array(ktx2Texture), { consume: true }, (err, bufferData) => {
                if (err)
                    return reject(err);
                resolve(bufferData);
            });
        });
        textureData.texture = bufferData;
        this._unsavedTextureData.set(textureHash, textureData);
    }
    tasksPending = false;
    serializePendingCount = 0;
    rasterizePendingCount = 0;
    MAX_SERIALIZE_TASK_COUNT = 10;
    MAX_RASTERIZE_TASK_COUNT = 10;
    scheduleTasksIfNeeded() {
        if (this.tasksPending ||
            (this.serializeQueue.length === 0 && this.rasterizeQueue.length === 0))
            return;
        this.tasksPending = true;
        setTimeout(this._runTasks, 1);
    }
    _runTasks = () => {
        const serializeQueue = this.serializeQueue;
        const rasterizeQueue = this.rasterizeQueue;
        // console.log("serialize task size", serializeQueue.length, serializeQueue)
        // console.log("rasterize task size", rasterizeQueue.length, rasterizeQueue)
        while (serializeQueue.length > 0 && this.serializePendingCount < this.MAX_SERIALIZE_TASK_COUNT) {
            this.serializePendingCount++;
            const { layer, resolve } = serializeQueue.shift();
            this.serialize(layer).then((val) => {
                this.serializePendingCount--;
                resolve(val);
            });
        }
        while (rasterizeQueue.length > 0 && this.rasterizePendingCount < this.MAX_RASTERIZE_TASK_COUNT) {
            this.rasterizePendingCount++;
            const { hash, svgUrl: url, resolve } = rasterizeQueue.shift();
            this.rasterize(hash, url).finally(() => {
                this.rasterizePendingCount--;
                resolve(undefined);
                if (this._autosaveTimer)
                    clearTimeout(this._autosaveTimer);
                if (this.autosave)
                    this._autosaveTimer = setTimeout(() => { this.saveStore(); }, this.autosaveDelay);
            });
        }
        this.tasksPending = false;
    };
    addToSerializeQueue(layer) {
        const inQueue = this.serializeQueue.find((v) => v.layer === layer);
        if (inQueue)
            return inQueue.promise;
        let resolve;
        const promise = new Promise((r) => { resolve = r; });
        this.serializeQueue.push({ layer, resolve, promise });
        return promise;
    }
    updateDOMMetrics(layer) {
        const metrics = layer.domMetrics;
        getBounds(layer.element, metrics.bounds, layer.parentLayer?.element);
        getMargin(layer.element, metrics.margin);
        getPadding(layer.element, metrics.padding);
        getBorder(layer.element, metrics.border);
    }
    async serialize(layer) {
        this.updateDOMMetrics(layer);
        const layerElement = layer.element;
        const metrics = layer.domMetrics;
        const { top, left, width, height } = metrics.bounds;
        const { top: marginTop, left: marginLeft, bottom: marginBottom, right: marginRight } = metrics.margin;
        // add margins
        const fullWidth = width + Math.max(marginLeft, 0) + Math.max(marginRight, 0);
        const fullHeight = height + Math.max(marginTop, 0) + Math.max(marginBottom, 0);
        const pixelRatio = layer.pixelRatio ||
            parseFloat(layer.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)) ||
            window.devicePixelRatio;
        const textureWidth = Math.max(nextPowerOf2(fullWidth * pixelRatio), 32);
        const textureHeight = Math.max(nextPowerOf2(fullHeight * pixelRatio), 32);
        const result = {};
        let svgDoc;
        if (layer.isMediaElement) {
            result.stateKey = layerElement;
        }
        else {
            // create svg markup
            const layerAttribute = WebRenderer.attributeHTML(WebRenderer.LAYER_ATTRIBUTE, '');
            const computedStyle = getComputedStyle(layerElement);
            const needsInlineBlock = computedStyle.display === 'inline';
            WebRenderer.updateInputAttributes(layerElement);
            const parentsHTML = getParentsHTML(layer, fullWidth, fullHeight, pixelRatio);
            const svgCSS = await WebRenderer.getAllEmbeddedStyles(layerElement);
            let layerHTML = await serializeToString(layerElement);
            layerHTML = layerHTML.replace(layerAttribute, `${layerAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
                `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
                WebRenderer.getPsuedoAttributes(layer.desiredPseudoState));
            svgDoc =
                '<svg width="' +
                    textureWidth +
                    '" height="' +
                    textureHeight +
                    '" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css"><![CDATA[\n' +
                    svgCSS.join('\n') +
                    ']]></style></defs><foreignObject x="0" y="0" width="' +
                    fullWidth * pixelRatio +
                    '" height="' +
                    fullHeight * pixelRatio +
                    '">' +
                    parentsHTML[0] +
                    layerHTML +
                    parentsHTML[1] +
                    '</foreignObject></svg>';
            // @ts-ignore
            layer._svgDoc = svgDoc;
            const stateHashBuffer = await crypto.subtle.digest('SHA-1', this.textEncoder.encode(svgDoc));
            const stateHash = bufferToHex(stateHashBuffer) +
                '?w=' + fullWidth +
                ';h=' + fullHeight +
                ';tw=' + textureWidth +
                ';th=' + textureHeight;
            result.stateKey = stateHash;
        }
        // update the layer state data
        const data = await this.requestStoredData(result.stateKey);
        data.bounds.left = left;
        data.bounds.top = top;
        data.bounds.width = width;
        data.bounds.height = height;
        data.margin.left = marginLeft;
        data.margin.top = marginTop;
        data.margin.right = marginRight;
        data.margin.bottom = marginBottom;
        data.fullWidth = fullWidth;
        data.fullHeight = fullHeight;
        data.pixelRatio = pixelRatio;
        data.textureWidth = textureWidth;
        data.textureHeight = textureHeight;
        layer.desiredDOMStateKey = result.stateKey;
        if (typeof result.stateKey === 'string')
            layer.allStateHashes.add(result.stateKey);
        result.needsRasterize = !layer.isMediaElement && fullWidth * fullHeight > 0 && !data.texture?.hash;
        result.svgUrl = (result.needsRasterize && svgDoc) ? 'data:image/svg+xml;utf8,' + encodeURIComponent(svgDoc) : undefined;
        return result;
    }
    async rasterize(stateHash, svgUrl) {
        const stateData = this.getLayerState(stateHash);
        const svgImage = this._imagePool.pop() || new Image();
        const { fullWidth, fullHeight, textureWidth, textureHeight, pixelRatio } = stateData;
        await new Promise((resolve, reject) => {
            svgImage.onload = () => {
                resolve();
            };
            svgImage.onerror = (error) => {
                reject(error);
            };
            svgImage.width = textureWidth;
            svgImage.height = textureHeight;
            svgImage.src = svgUrl;
        });
        if (!svgImage.complete || svgImage.currentSrc !== svgUrl) {
            throw new Error('Rasterization Failed');
        }
        await svgImage.decode();
        const sourceWidth = Math.floor(fullWidth * pixelRatio);
        const sourceHeight = Math.floor(fullHeight * pixelRatio);
        const hashCanvas = await this.rasterizeToCanvas(svgImage, sourceWidth, sourceHeight, 30, 30);
        const hashData = this.getImageData(hashCanvas);
        const textureHashBuffer = await crypto.subtle.digest('SHA-1', hashData.data);
        const textureHash = bufferToHex(textureHashBuffer) +
            '?w=' + textureWidth +
            ';h=' + textureHeight;
        const previousCanvasHash = stateData.texture?.hash;
        // stateData.texture.hash = textureHash
        if (previousCanvasHash !== textureHash) {
            stateData.renderAttempts = 0;
        }
        stateData.renderAttempts++;
        stateData.texture = this.getTextureState(textureHash);
        const hasTexture = stateData.texture.canvas || stateData.texture.ktx2Url;
        if (stateData.renderAttempts > this.MINIMUM_RENDER_ATTEMPTS && hasTexture) {
            return;
        }
        // in case the svg image wasn't finished loading, we should try again a few times
        setTimeout(() => this.addToRasterizeQueue(stateHash, svgUrl), (500 + Math.random() * 1000) * 2 ^ stateData.renderAttempts);
        if (stateData.texture.canvas)
            return;
        stateData.texture.canvas = await this.rasterizeToCanvas(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight);
        try {
            await this.compressTexture(textureHash);
        }
        finally {
            this._imagePool.push(svgImage);
        }
    }
    async rasterizeToCanvas(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight, canvas) {
        canvas = canvas || document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // createImageBitmap non-blocking api would be nice, but causes chrome to taint the canvas, 
        // and Safari treats the svg size strangely
        // const imageBitmap = await createImageBitmap(svgImage, 0,0, sourceWidth * devicePixelRatio, sourceHeight * devicePixelRatio, {
        //     resizeWidth: textureWidth,
        //     resizeHeight: textureHeight,
        //     resizeQuality: 'high'
        // })
        // ctx.drawImage(imageBitmap, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight)
        ctx.drawImage(svgImage, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight);
        return canvas;
    }
    getImageData(canvas) {
        return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    }
    addToRasterizeQueue(hash, url) {
        const inQueue = this.rasterizeQueue.find((v) => v.hash === hash);
        if (inQueue)
            return inQueue.promise;
        let resolve;
        const promise = new Promise((r) => { resolve = r; });
        this.rasterizeQueue.push({ hash, svgUrl: url, resolve, promise });
        return promise;
    }
    optimizeImageData(stateHash) {
    }
    addToOptimizeQueue(hash) {
    }
}
