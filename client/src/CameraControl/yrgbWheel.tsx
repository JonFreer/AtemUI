import React from "react";

interface FocusProps {
    callback: any
    values: any
    minMax: any

}
interface FocusState {
    focus: boolean
    startX: number
    distance: number
    active: boolean
    offset: number
    startingValues: any

}

export class YRGBWheel extends React.Component<FocusProps, FocusState> {

    constructor(props: FocusProps) {
        super(props)
        this.state = {
            focus: false,
            startX: 0,
            distance: 0,
            offset: 0,
            active: false,
            startingValues: this.props.values
        }
    }

    shouldComponentUpdate(nextProps:FocusProps,nextState:FocusState){
        return nextState.active!== this.state.active || nextState.active
    }

    handleStart = (e: any) => {
        document.addEventListener('mousemove', this.handleDrag)
        document.addEventListener('mouseup', this.handleEnd)
        this.setState(
            {
                active: true, startX: e.clientX, startingValues: this.props.values
            }
        )
    };

    handleDrag = (e: any) => {
        e.stopPropagation()
        this.setState({
            distance: (e.clientX - this.state.startX)
        })
        this.props.callback(
            Math.max(Math.min(this.state.startingValues.r + this.state.distance * 10, this.props.minMax), -this.props.minMax),
            Math.max(Math.min(this.state.startingValues.g + this.state.distance * 10, this.props.minMax), -this.props.minMax),
            Math.max(Math.min(this.state.startingValues.b + this.state.distance * 10, this.props.minMax), -this.props.minMax),
            Math.max(Math.min(this.state.startingValues.y + this.state.distance * 10, this.props.minMax), -this.props.minMax))
    };

    handleDragMobile = (e: any) => { // different due to need for rounding and differnet events
        e.stopPropagation()
        this.setState({
            distance: (e.touches.item(0).clientX - this.state.startX)
        })
        this.props.callback(
            Math.max(Math.min(Math.round(this.state.startingValues.r + this.state.distance * 10), this.props.minMax), -this.props.minMax),
            Math.max(Math.min(Math.round(this.state.startingValues.g + this.state.distance * 10), this.props.minMax), -this.props.minMax),
            Math.max(Math.min(Math.round(this.state.startingValues.b + this.state.distance * 10), this.props.minMax), -this.props.minMax),
            Math.max(Math.min(Math.round(this.state.startingValues.y + this.state.distance * 10), this.props.minMax), -this.props.minMax))
    };


    handleEnd = (e: any) => {
        this.setState(
            {
                active: false,
                offset: this.state.offset + this.state.distance,
                distance: 0
            }
        )
        document.removeEventListener('mousemove', this.handleDrag)
        document.removeEventListener('mouseup', this.handleEnd)
    };

    render() {
        var notch = []
        for (var i = 0; i < 30; i++) notch.push(<div className="cam-yrgb-inner-inner"></div>)
        return (
            <div
                style={{ cursor: (this.state.active) ? "grabbing" : "inherit" }}
                className="cam-yrgb-holder"
                onMouseDown={this.handleStart}
                onTouchStart={(e)=>this.setState({active: true, startX: e.touches.item(0).clientX, startingValues: this.props.values})}
                onTouchMove={(e)=>this.handleDragMobile(e)}
                onTouchEnd={(e)=>this.setState({active: false, offset: this.state.offset + this.state.distance, distance: 0})}
                >
                <div style={{ left: ((this.state.distance + this.state.offset) % 8) - 10 }} className="cam-yrgb-inner">
                    {notch}
                </div>
                <div className="cam-focus-slider">
                </div>
            </div>)
    }

}