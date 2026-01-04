import CircuitElement from "../circuitElement";
import Node, { findNode } from "../node";
import simulationArea from "../simulationArea";
import { gateGenerateVerilog } from '../utils';

import {
    correctWidth,
    bezierCurveTo,
    moveTo,
    arc2,
    drawCircle2,
    rect2,
    fillText,
    fillText2,
} from "../canvasApi";
import { changeInputSize } from "../modules";
/**
 * @class
 * NorGate
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope=} scope - Cirucit on which element is drawn
 * @param {string=} dir - direction of element
 * @param {number=} inputs - number of input nodes
 * @param {number=} bitWidth - bit width per node.
 * @category modules
 */
// DIN update 2
import { colors } from "../themer/themer";

export default class NorGate extends CircuitElement {
    constructor(
        x,
        y,
        scope = globalScope,
        dir = "RIGHT",
        inputs = 2,
        bitWidth = 1
    ) {
        super(x, y, scope, dir, bitWidth);
        /* this is done in this.baseSetup() now
        this.scope['NorGate'].push(this);
        */
        this.rectangleObject = false;
        this.setDimensions(15, 20);

        this.inp = [];
        this.inputSize = inputs;

        if (inputs % 2 === 1) {
            for (let i = 0; i < inputs / 2 - 1; i++) {
                const a = new Node(-10, -10 * (i + 1), 0, this);
                this.inp.push(a);
            }
            let a = new Node(-10, 0, 0, this);
            this.inp.push(a);
            for (let i = inputs / 2 + 1; i < inputs; i++) {
                a = new Node(-10, 10 * (i + 1 - inputs / 2 - 1), 0, this);
                this.inp.push(a);
            }
        } else {
            for (let i = 0; i < inputs / 2; i++) {
                const a = new Node(-10, -10 * (i + 1), 0, this);
                this.inp.push(a);
            }
            for (let i = inputs / 2; i < inputs; i++) {
                const a = new Node(-10, 10 * (i + 1 - inputs / 2), 0, this);
                this.inp.push(a);
            }
        }
        this.output1 = new Node(30, 0, 1, this);
    }

    /**
     * @memberof NorGate
     * fn to create save Json Data of object
     * @return {JSON}
     */
    customSave() {
        const data = {
            constructorParamaters: [
                this.direction,
                this.inputSize,
                this.bitWidth,
            ],
            nodes: {
                inp: this.inp.map(findNode),
                output1: findNode(this.output1),
            },
        };
        return data;
    }

    /**
     * @memberof NorGate
     * resolve output values based on inputData
     */
    resolve() {
        let result = this.inp[0].value || 0;
        for (let i = 1; i < this.inputSize; i++)
            result |= this.inp[i].value || 0;
        result =
            ((~result >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
        this.output1.value = result;
        simulationArea.simulationQueue.add(this.output1);

        this.setOutputsUpstream(true);
    }

    /**
     * @memberof NorGate
     * function to draw element
     */
    customDraw() {
        var ctx = simulationArea.context;
        const xx = this.x;
        const yy = this.y;

        ctx.beginPath();
        ctx.lineWidth = correctWidth(3);
        ctx.strokeStyle = colors["stroke"];
        ctx.fillStyle = colors["fill"];

        if (globalScope.settings.isDIN) {
            // DIN/IEC Style: Rectangular
            rect2(ctx, -10, -20, 30, 40, xx, yy, this.direction);
        } else {
            // ANSI Style: Curved
            moveTo(ctx, -10, -20, xx, yy, this.direction, true);
            bezierCurveTo(0, -20, +15, -10, 20, 0, xx, yy, this.direction);
            bezierCurveTo(
                0 + 15,
                0 + 10,
                0,
                0 + 20,
                -10,
                +20,
                xx,
                yy,
                this.direction
            );
            bezierCurveTo(0, 0, 0, 0, -10, -20, xx, yy, this.direction);
        }
        ctx.closePath();

        if (
            (this.hover && !simulationArea.shiftDown) ||
            simulationArea.lastSelected === this ||
            simulationArea.multipleObjectSelections.contains(this)
        ) {
            ctx.fillStyle = colors["hover_select"];
        }

        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        if (globalScope.settings.isDIN) {
            // DIN symbol ≥1 and negation circle at edge
            drawCircle2(ctx, 25, 0, 5, xx, yy, this.direction);
            ctx.stroke();

            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.fillStyle = colors["text"];
            fillText2(ctx, "≥1", 2, 0, xx, yy, this.direction);
            ctx.fill();
        } else {
            // ANSI Negation circle
            drawCircle2(ctx, 25, 0, 5, xx, yy, this.direction);
            ctx.stroke();
        }
    }

    generateVerilog() {
        return gateGenerateVerilog.call(this, '|', true);
    }
}

/**
 * @memberof NorGate
 * Help Tip
 * @type {string}
 * @category modules
 */
NorGate.prototype.tooltipText =
    "Nor Gate ToolTip : Combination of OR gate and NOT gate.";

/**
 * @memberof NorGate
 * @type {boolean}
 * @category modules
 */
NorGate.prototype.alwaysResolve = true;

/**
 * @memberof SevenSegDisplay
 * function to change input nodes of the element
 * @category modules
 */
NorGate.prototype.changeInputSize = changeInputSize;

/**
 * @memberof SevenSegDisplay
 * @type {string}
 * @category modules
 */
NorGate.prototype.verilogType = "nor";
NorGate.prototype.helplink =
    "https://docs.circuitverse.org/#/chapter4/4gates?id=nor-gate";
NorGate.prototype.objectType = "NorGate";
