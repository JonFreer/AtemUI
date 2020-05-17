import React from "react";

interface FocusProps {
    callback: any
}
interface FocusState {
    focus: boolean
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
            focus: false,
            startY: 0,
            distance: 0,
            offset: 0,
            active: false,
            height:0
        }
    }

    // componentDidMount() {
    //     this.setState({

    //         height: this.container.offsetHeight,
         
    //     });
    //   }

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
        console.log(e.clientX)
        this.props.callback(((e.clientY - this.state.startY) - this.state.distance) * 10)
        this.setState({ distance: (e.clientY - this.state.startY) })
        

    };

    handleDragMobile = (e: any) => {
        e.stopPropagation()
        
        this.props.callback(((Math.round(e.touches.item(0).clientY) - this.state.startY) - this.state.distance) * 10)
        this.setState({ distance: (Math.round(e.touches.item(0).clientY) - this.state.startY) })

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
        for (var i = 0; i < 35; i++) notch.push(<div className="cam-zoom-inner-inner"></div>)
        notch.push(<div className="cam-zoom-circle-outer"><div className="cam-zoom-circle"></div></div>)
        for (var i = 0; i < 35; i++) notch.push(<div className="cam-zoom-inner-inner"></div>)
        return (<div
            ref={el => {if (!el || this.state.height == el.getBoundingClientRect().height) return;
                this.setState({height:el.getBoundingClientRect().height});
            }} 
            style={{ cursor: (this.state.active) ? "grabbing" : "inherit" }}
            className="cam-zoom-holder"
            onMouseDown={this.handleStart}
            onTouchStart={(e)=>this.setState({ active: true, startY: e.touches.item(0).clientY})}
            onTouchMove={(e)=>this.handleDragMobile(e)}
            onTouchEnd={(e)=>this.setState({active: false, offset: this.state.offset + this.state.distance, distance: 0})}
            >
            <div style={{ top: -180+this.state.height/2 }} className={(this.state.active)?"cam-zoom-inner":"cam-zoom-inner scroll"}>
                {notch}
            </div>
            <div className="cam-zoom-slider">
            </div>
        </div>)
    }

}