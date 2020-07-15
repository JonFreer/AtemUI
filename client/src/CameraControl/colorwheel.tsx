import React from "react";

interface ColourWheelState {
    active: boolean
    startX: number
    startY: number
    startR: number
    startG: number
    startB: number

}

export class ColourWheel extends React.Component<{ rgby: any, callback: any, outerRadius:number ,innerRadius:number,blackWidth:number}, ColourWheelState> {
    constructor(props: { rgby: any, callback: any, outerRadius:number ,innerRadius:number ,blackWidth:number}) {
        super(props)
        this.state = {
            active: false,
            startX: 0,
            startY: 0,
            startR: this.props.rgby.r,
            startG: this.props.rgby.b,
            startB: this.props.rgby.y,

        }
    }
    shouldComponentUpdate(nextProps: { rgby: any }) {
        //return true
        return this.props.rgby.r !== nextProps.rgby.r || this.props.rgby.g !== nextProps.rgby.g || this.props.rgby.b !== nextProps.rgby.b
    }


    distance(dot1: any, dot2: any) {
        var x1 = dot1[0],
            y1 = dot1[1],
            x2 = dot2[0],
            y2 = dot2[1];
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    limit(x: any, y: any) {
        var dist = this.distance([x, y], [0, 0]);
        if (dist <= 125) {
            return { x: x, y: y };
        }
        else {
            x = x - 0;
            y = y - 0;
            var radians = Math.atan2(y, x)
            return {
                x: Math.cos(radians) * 125 + 0,
                y: Math.sin(radians) * 125 + 0
            }
        }
    }

    handleStart = (e: any) => {
        document.addEventListener('mousemove', this.handleDrag)
        document.addEventListener('mouseup', this.handleEnd)
        this.setState(
            {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                startR: this.props.rgby.r,
                startG: this.props.rgby.g,
                startB: this.props.rgby.b
            }
        )
    }

    handleStartMobile = (e: any) => {
        document.addEventListener('mousemove', this.handleDrag)
        document.addEventListener('mouseup', this.handleEnd)
        // e.preventDefault()
        this.setState(
            {
                active: true,
                startX: e.touches.item(0).clientX,
                startY: e.touches.item(0).clientY,
                startR: this.props.rgby.r,
                startG: this.props.rgby.g,
                startB: this.props.rgby.b
            }
        )
    }

    handleDrag = (e: any) => {
        const b = { x: 122.5, y: 21.25 } //vectors for movement
        const g = { x: -80, y: 96.25 }
        const r = { x: -42.5, y: -117.5 }
        e.stopPropagation()
        var xDist = (e.clientX - this.state.startX) / 100
        var yDist = (e.clientY - this.state.startY) / 100
        var newR = this.state.startR + Math.round(xDist * r.x + yDist * r.y)
        var newG = this.state.startG + Math.round(xDist * g.x + yDist * g.y)
        var newB = this.state.startB + Math.round(xDist * b.x + yDist * b.y)
        this.props.callback(newR, newG, newB)
    }

    handleDragMobile = (e: any) => {
        const b = { x: 122.5, y: 21.25 } //vectors for movement
        const g = { x: -80, y: 96.25 }
        const r = { x: -42.5, y: -117.5 }
        // e.preventDefault()
        e.stopPropagation()
        var xDist = (e.touches.item(0).clientX - this.state.startX) / 100
        var yDist = (e.touches.item(0).clientY - this.state.startY) / 100
        var newR = this.state.startR + Math.round(xDist * r.x + yDist * r.y)
        var newG = this.state.startG + Math.round(xDist * g.x + yDist * g.y)
        var newB = this.state.startB + Math.round(xDist * b.x + yDist * b.y)
        this.props.callback(newR, newG, newB)

    }

    handleEnd = (e: any) => {
        this.setState(
            {
                active: false,
            }
        )
        document.removeEventListener('mousemove', this.handleDrag)
        document.removeEventListener('mouseup', this.handleEnd)
    };

    render() {
        const b = { x: 122.5, y: 21.25 } //vectors for movement
        const g = { x: -80, y: 96.25 }
        const r = { x: -42.5, y: -117.5 }
        var cy = (this.props.rgby.b / 4096 * b.y) + (this.props.rgby.g / 4096 * g.y) + (this.props.rgby.r / 4096 * r.y)
        var cx = (this.props.rgby.b / 4096 * b.x) + (this.props.rgby.g / 4096 * g.x) + (this.props.rgby.r / 4096 * r.x)
        var coords = this.limit(cx, cy)
        const resolution = 1;
        const outerRadius = this.props.outerRadius;
        const innerRadius = this.props.innerRadius;
        // style={{touchAction:(this.state.active)?"none":"auto",overscrollBehavior:(this.state.active)?"contain":"contain"}}
        return (
           
        <svg height="100%" width="100%" viewBox="0 0 300 300" version="1.1" id="color-wheel">
            <circle fill="#181818" cx={outerRadius} cy={outerRadius} r={outerRadius}></circle>
            <ConicGradient outerRadius={outerRadius} resolution={resolution} blackWidth={this.props.blackWidth}/>
            <circle fill="#232323" cx={outerRadius} cy={outerRadius} r={innerRadius - 10}></circle>
            <line x1={"150"} x2="150" y1={15+this.props.blackWidth} y2={285-this.props.blackWidth} stroke="#303030" strokeWidth="1" ></line>
            <line x1={15+this.props.blackWidth} x2={285-this.props.blackWidth} y1="150" y2="150" stroke="#303030" strokeWidth="1" stroke-width="1"></line>  
            <circle 
            className="cam-shadow"
            cx={coords.x + 150}
            cy={coords.y + 150}
            r="10"
            fill="#50505000"
            stroke={this.state.active ? "orange" : "#505050"}
            strokeWidth="3"
            onMouseDown={(e) => this.handleStart(e)}
            onTouchStart={this.handleStartMobile}
            onTouchMove={this.handleDragMobile}
            onTouchEnd={() => this.setState({ active: false })}
        ></circle>
    </svg>
        
    
     
 
        )
    }
}

//Seperated to stop constant rerendering
class ConicGradient extends React.Component<{ outerRadius: number, resolution: number ,blackWidth:number }>{

    shouldComponentUpdate() {
        return false
    }

    polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    }


    describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
        const start = this.polarToCartesian(x, y, radius, endAngle);
        const end = this.polarToCartesian(x, y, radius, startAngle);

        const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

        const d = [
            'M', start.x, start.y,
            'A', radius, radius, 0, arcSweep, 0, end.x, end.y,
            'L', x, y,
            'L', start.x, start.y
        ].join(' ');

        return d;
    }

    render() {
        var paths = []
        for (var i = 0; i < 360 * this.props.resolution; i++) {
            const path = <path fill={'hsl(' + (-(i / this.props.resolution) - 30) + ', 40%, 50%)'} d={this.describeArc(
                this.props.outerRadius,
                this.props.outerRadius,
                this.props.outerRadius - this.props.blackWidth,
                i / this.props.resolution,
                (i + 2) / this.props.resolution
            )}>

            </path>
            paths.push(path);
        }

        return (<g>{paths}</g>)

    }
}


