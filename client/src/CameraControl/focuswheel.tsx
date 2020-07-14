import React from "react";

interface FocusProps {
    callback: any
}
interface FocusState {
    startX: number
    distance: number
    active: boolean
    offset: number

}

export class FocusWheel extends React.Component<FocusProps, FocusState> {

    constructor(props: FocusProps) {
        super(props)
        this.state = {
            startX: 0,
            distance: 0,
            offset: 0,
            active: false
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
                active: true, startX: e.clientX
            }
        )
    };

    handleDrag = (e: any) => {
        e.stopPropagation()
        console.log(e.clientX)
        this.props.callback(((e.clientX - this.state.startX) - this.state.distance) * 10)
        this.setState({ distance: (e.clientX - this.state.startX) })

    };

    handleDragMobile = (e: any) => {
        e.stopPropagation()
        
        this.props.callback(((Math.round(e.touches.item(0).clientX) - this.state.startX) - this.state.distance) * 10)
        this.setState({ distance: (Math.round(e.touches.item(0).clientX) - this.state.startX) })

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
        for (var i = 0; i < 40; i++) notch.push(<div className="cam-focus-inner-inner"></div>)
        return (<div
            style={{ cursor: (this.state.active) ? "grabbing" : "inherit" }}
            className="cam-focus-holder"
            onMouseDown={this.handleStart}
            onTouchStart={(e)=>this.setState({ active: true, startX: e.touches.item(0).clientX})}
            onTouchMove={(e)=>this.handleDragMobile(e)}
            onTouchEnd={(e)=>this.setState({active: false, offset: this.state.offset + this.state.distance, distance: 0})}
            >
            <div style={{ left: (this.state.distance + this.state.offset) % 5 }} className="cam-focus-inner">
                {notch}
            </div>
            <div className="cam-focus-slider">
            </div>
        </div>)
    }

}