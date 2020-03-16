import { Widget } from './Widget';
import * as PIXI from 'pixi.js';
import { MeasureMode } from './IMeasurable';
import { LayoutOptions, FastLayoutOptions } from './layout-options';

/**
 * The stage is the root node in the PUXI scene graph. It does not provide a
 * sophisticated layout model; however, it will accept constraints defined by
 * `PUXI.FastLayoutOptions` or `PUXI.LayoutOptions` in its children.
 *
 * The stage is not a `PUXI.Widget` and its dimensions are always fixed.
 *
 * @memberof PUXI
 * @class
 * @extends PIXI.Container
 */
export class Stage extends PIXI.Container
{
    __width: number;
    __height: number;
    minWidth: number;
    minHeight: number;
    initialized: boolean;
    widgetChildren: Widget[];

    stage: any;

    protected background: PIXI.Container;

    /**
     * @param {number} width - width of the stage
     * @param {number} height - height of the stage
     */
    constructor(width: number, height: number)
    {
        super();

        this.__width = width;
        this.__height = height;
        this.minWidth = 0;
        this.minHeight = 0;

        this.widgetChildren = [];
        this.interactive = true;
        this.stage = this;
        this.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
        this.initialized = true;
        this.resize(width, height);
    }

    protected measureAndLayout(): void
    {
        if (this.background)
        {
            this.background.width = this.width;
            this.background.height = this.height;
        }

        for (let i = 0, j = this.widgetChildren.length; i < j; i++)
        {
            const widget = this.widgetChildren[i];
            const lopt = (widget.layoutOptions || LayoutOptions.DEFAULT) as FastLayoutOptions;

            const widthMeasureMode = lopt.width < LayoutOptions.MAX_DIMEN
                ? MeasureMode.EXACTLY
                : MeasureMode.AT_MOST;
            const heightMeasureMode = lopt.height < LayoutOptions.MAX_DIMEN
                ? MeasureMode.EXACTLY
                : MeasureMode.AT_MOST;
            const loptWidth = (Math.abs(lopt.width) < 1) ? lopt.width * this.width : lopt.width;
            const loptHeight = (Math.abs(lopt.height) < 1) ? lopt.height * this.height : lopt.height;

            widget.measure(
                widthMeasureMode === MeasureMode.EXACTLY ? loptWidth : this.width,
                heightMeasureMode === MeasureMode.EXACTLY ? loptHeight : this.height,
                widthMeasureMode,
                heightMeasureMode);

            let x = lopt.x ? lopt.x : 0;
            let y = lopt.y ? lopt.y : 0;

            if (Math.abs(x) < 1)
            {
                x *= this.width;
            }
            if (Math.abs(y) < 1)
            {
                y *= this.height;
            }

            const anchor = lopt.anchor || FastLayoutOptions.DEFAULT_ANCHOR;
            const l = x - (anchor.x * widget.getMeasuredWidth());
            const t = y - (anchor.y * widget.getMeasuredHeight());

            widget.layout(l, t,
                l + widget.getMeasuredWidth(),
                t + widget.getMeasuredHeight(),
                true);
        }
    }

    getBackground(): PIXI.Container
    {
        return this.background;
    }

    setBackground(bg: PIXI.Container): void
    {
        if (this.background)
        {
            super.removeChild(this.background);
        }

        this.background = bg;

        if (bg)
        {
            super.addChildAt(bg, 0);

            this.background.width = this.width;
            this.background.height = this.height;
        }
    }

    private update(widgets: Widget[]): void
    {
        for (let i = 0, j = widgets.length; i < j; i++)
        {
            const widget = widgets[i];

            if (!widget.initialized)
            {
                widget.initialize();
            }

            this.update(widget.widgetChildren);
            widget.stage = this;
            widget.update();
        }
    }

    render(renderer: PIXI.Renderer): void
    {
        this.update(this.widgetChildren);
        super.render(renderer);
    }

    addChild(UIObject: Widget): void
    {
        const argumentLenght = arguments.length;

        if (argumentLenght > 1)
        {
            for (let i = 0; i < argumentLenght; i++)
            {
                this.addChild(arguments[i]);
            }
        }
        else
        {
            if (UIObject.parent)
            {
                UIObject.parent.removeChild(UIObject);
            }

            UIObject.parent = this;
            this.widgetChildren.push(UIObject);
            super.addChild(UIObject.insetContainer);
            // UIObject.updatesettings(true);
        }

        this.measureAndLayout();
    }

    removeChild(UIObject: Widget): void
    {
        const argumentLenght = arguments.length;

        if (argumentLenght > 1)
        {
            for (let i = 0; i < argumentLenght; i++)
            {
                this.removeChild(arguments[i]);
            }
        }
        else
        {
            super.removeChild(UIObject.insetContainer);

            const index = this.widgetChildren.indexOf(UIObject);

            if (index !== -1)
            {
                this.children.splice(index, 1);
                UIObject.parent = null;
            }
        }

        this.measureAndLayout();
    }

    resize(width?: number, height?: number): void
    {
        if (!isNaN(height)) this.__height = height;
        if (!isNaN(width)) this.__width = width;

        if (this.minWidth || this.minHeight)
        {
            let rx = 1;
            let ry = 1;

            if (width && width < this.minWidth)
            {
                rx = this.minWidth / width;
            }

            if (height && height < this.minHeight)
            {
                ry = this.minHeight / height;
            }

            if (rx > ry && rx > 1)
            {
                this.scale.set(1 / rx);
                this.__height *= rx;
                this.__width *= rx;
            }
            else if (ry > 1)
            {
                this.scale.set(1 / ry);
                this.__width *= ry;
                this.__height *= ry;
            }
            else if (this.scale.x !== 1)
            {
                this.scale.set(1);
            }
        }

        if (this.hitArea)
        {
            this.hitArea.width = this.__width;
            this.hitArea.height = this.__height;
        }

        for (let i = 0; i < this.widgetChildren.length; i++)
        {
            this.widgetChildren[i].updatesettings(true, false);
        }

        this.measureAndLayout();
    }

    get width(): number
    {
        return this.__width;
    }
    set width(val: number)
    {
        if (!isNaN(val))
        {
            this.__width = val;
            this.resize();
        }
    }

    get height(): number
    {
        return this.__height;
    }
    set height(val: number)
    {
        if (!isNaN(val))
        {
            this.__height = val;
            this.resize();
        }
    }
}
