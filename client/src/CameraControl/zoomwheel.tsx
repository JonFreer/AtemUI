import React from "react";
import { max } from "moment";

interface FocusProps {
    callback: any
}
interface FocusState {
    startY: number
    distance: number
    active: boolean
    offset: number
    height:number


}

export class ZoomWheel extends React.Component<FocusProps, FocusState> {

    constructor(props: FocusProps) {
        super(props)
        this.state = {
            startY: 0,
            distance: 0,
            offset: 0,
            active: false,
            height:0,

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
                active: true, startY: e.clientY
            }
        )
    };

    handleDrag = (e: any) => {
        e.stopPropagation()
        var distance =(e.clientY - this.state.startY)/-(this.state.height/2)
        this.props.callback(Math.min(2048,Math.max(-2048,Math.round((Math.pow((distance),3)+distance)*1024))))
        this.setState({ distance: (e.clientY - this.state.startY) })
    };

    handleDragMobile = (e: any) => {
        e.stopPropagation()
        var distance =(e.touches.item(0).clientY - this.state.startY)/-(this.state.height/2)
        this.props.callback(Math.min(2048,Math.max(-2048,Math.round((Math.pow((distance),3)+distance)*1024))))
        this.setState({ distance: (Math.round(e.touches.item(0).clientY) - this.state.startY) })

    };

    handleEnd = (e: any) => {
        this.setState(
            {
                active: false,
                offset: 0,
                distance: 0
            }
        )
        this.props.callback(0)
        document.removeEventListener('mousemove', this.handleDrag)
        document.removeEventListener('mouseup', this.handleEnd)
    };

    render() {
        var notch = []
        for (var i = 0; i < 80; i++) notch.push(<div className="cam-zoom-inner-inner"></div>)

        return (
            <div style={{overscrollBehavior: "contain", touchAction: "none"}} className="cam-zoom-outer"
            onTouchStart={(e)=>this.setState({ active: true, startY: e.touches.item(0).clientY})}
            onTouchMove={(e)=>this.handleDragMobile(e)}
            onTouchEnd={(e)=>{this.setState({active: false, offset: 0, distance: 0});this.props.callback(0)}}>
            <div className="cam-zoom-label-holder">
                <div className="cam-zoom-label">T</div>
                <div className="cam-zoom-label">W</div>
            </div>
            <div
            ref={el => {if (!el || this.state.height == el.getBoundingClientRect().height) return;
                this.setState({height:el.getBoundingClientRect().height});
            }} 
            style={{ cursor: (this.state.active) ? "grabbing" : "inherit" }}
            className="cam-zoom-holder"
            onMouseDown={this.handleStart}
           
            >
            <div style={{ top: Math.max(-this.state.height/2,Math.min(this.state.height/2,(this.state.distance + this.state.offset)))-100}} className={(this.state.active)?"cam-zoom-inner":"cam-zoom-inner scroll"}>
                {notch}
            </div>
            <div style={{  top: Math.max(-this.state.height/2,Math.min(this.state.height/2,(this.state.distance + this.state.offset)))}} className={(this.state.active)?"cam-zoom-circle-holder":"cam-zoom-circle-holder scroll"}>
                <div className="cam-zoom-circle-outer"><div className="cam-zoom-circle"></div></div>
            </div>
            <div className="cam-zoom-slider">
            </div>
            </div>
        </div>)
    }

}