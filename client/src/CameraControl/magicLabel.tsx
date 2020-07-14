import React from "react";
interface MagicLabelProps {
    callback: any
    value: any
    format:any
    disabled?: boolean
    step?: number
    max:number
    min:number
    onChangeStart?: any
    onChange?: any
  }
  interface MagicLabelState {

    tempValue: any
    displayValue:any
    disabled: boolean
    xCoord: number
    yCoord: number
    active: boolean
  
  }
export class MagicLabel extends React.Component<MagicLabelProps, MagicLabelState>{
    constructor(props: MagicLabelProps) {
        super(props)
        this.state = {
      
  
            tempValue: this.props.value,
            displayValue :this.props.value,
            disabled: this.props.disabled || true,
            xCoord: 0,
            yCoord: 0,
            active: false
        }
    }
    shouldComponentUpdate(nextProps: MagicLabelProps, nextState:MagicLabelState){
        if(nextProps.value !== this.props.value){
            return true
        }else if(this.state.active !== nextState.active || nextState.active){
            return true
        }
        return false
    }
  
    handleStart = (e: any) => {
        const { onChangeStart } = this.props
        document.addEventListener('mousemove', this.handleDrag)
        document.addEventListener('mouseup', this.handleEnd)
        this.setState(
            {
                displayValue:this.props.value,
                tempValue: this.props.value,
                active: true, xCoord: e.clientX, yCoord: e.clientY
            },
            () => {
                onChangeStart && onChangeStart(e)
            }
        )
    };

    handleStartMobile = (e:any) => {
        this.setState(
            {
                displayValue:this.props.value,
                tempValue: this.props.value,
                active: true,
                xCoord: e.touches.item(0).clientX,
                 yCoord: e.touches.item(0).clientY
            })
    }
  
    handleDrag = (e: any) => {
        var step = this.props.step || 1
        e.stopPropagation()
        this.props.callback(Math.max(this.props.min,Math.min(this.state.tempValue + ((e.clientX - this.state.xCoord)*step),this.props.max)))
        this.setState({displayValue:(Math.max(this.props.min,Math.min(this.state.tempValue + ((e.clientX - this.state.xCoord)*step),this.props.max))) })
    };

    handleDragMobile = (e: any) => {
        var step = this.props.step || 1
        e.stopPropagation()
        var val = Math.max(this.props.min,Math.min(Math.round(this.state.tempValue + ((this.state.yCoord-e.touches.item(0).clientY )*step)),this.props.max))
        this.props.callback(val)
        this.setState({displayValue:val })
    };
  
  
    handleEnd = (e: any) => {
        this.setState(
            {
                active: false
            }
        )
        document.removeEventListener('mousemove', this.handleDrag)
        document.removeEventListener('mouseup', this.handleEnd)
    };
  
    render() {
        var step = this.props.step || 1
        return (<div style={{ overscrollBehavior: "contain", touchAction: "none" }}
  
            onMouseDown={this.handleStart}

            onTouchStart={(e)=>{this.handleStartMobile(e)}}
            onTouchEnd={()=>this.setState({active:false})}
            onTouchMove={(e)=>{this.handleDragMobile(e)}}
            className={(!this.state.active) ? "cam-value-value" : "cam-value-value active"}>
            {(this.state.active)?this.props.format(this.state.displayValue):this.props.format(this.props.value)}
        </div>)
  
  
    }

}