import React from "react";
import ResizeObserver from 'resize-observer-polyfill'

interface FocusProps {
    callback: any
    callbackX: any
    value:number
    valueX:number
    onAir:boolean
    coarse:number
}
interface FocusState {

    active: boolean
    height: number
    top: number
    width:number
    left:number
    coarse:number
    wait:boolean
    resize:boolean


}

export class ApertureSquare extends React.Component<FocusProps, FocusState> {

    constructor(props: FocusProps) {
        super(props)
        this.state = {
            active: false,
            height: -1,
            top: 0,
            width:0,
            left:0,
            coarse:this.props.coarse,
            wait:false,
            resize:false
        }
        
    }
    
    handleStart = (e: any) => {
        document.addEventListener('mousemove', this.handleDrag)
        document.addEventListener('mouseup', this.handleEnd)
        this.setState(
            {
                active: true, 
            }
        )
    };


    handleDrag = (e: any) => {
        e.stopPropagation()

        const minY = 3072 + (1536*this.state.coarse)
        const maxY = 18432
        let pixelY = e.clientY -25 - this.state.top 
        const percentY = pixelY/(this.state.height-50) 
        const value = Math.round((percentY*(maxY-minY))+minY)
        this.props.callback(this.clamp(value,minY,maxY))

        const minX = -819
        const maxX = 819
        let pixelX = e.clientX -25 - this.state.left 
        const percentX = pixelX/(this.state.width-50) 
        const valueX = Math.round((percentX*(maxX-minX))+minX)
        this.props.callbackX(this.clamp(valueX,minX,maxX))
        
    };

    handleDragMobile = (e: any) => {
        e.stopPropagation()

        const minY = 3072 + (1536*this.state.coarse)
        const maxY = 18432
        let pixelY = e.touches.item(0).clientY -25 - this.state.top 
        const percentY = pixelY/(this.state.height-50) 
        const value = Math.round((percentY*(maxY-minY))+minY)
        this.props.callback(this.clamp(value,minY,maxY))

        const minX = -819
        const maxX = 819
        let pixelX = e.touches.item(0).clientX -25 - this.state.left 
        const percentX = pixelX/(this.state.width-50) 
        const valueX = Math.round((percentX*(maxX-minX))+minX)
        this.props.callbackX(this.clamp(valueX,minX,maxX))
    };

    handleEnd = (e: any) => {
        this.setState(
            {
                active: false,
            }
        )
        document.removeEventListener('mousemove', this.handleDrag)
        document.removeEventListener('mouseup', this.handleEnd)
    };

    componentDidMount () {
        const resizeObserver = new ResizeObserver(this.handleUpdate)
        const div = document.getElementById("cam1")
        if(div!=null){
            resizeObserver.observe(div)
        }
      }

    shouldComponentUpdate(nextProps:FocusProps , nextState: FocusState){
        if(nextProps.value!==this.props.value){ //Only allows one update of coarse at a time 
            if(this.state.wait){
                this.setState({wait:false})
            }
            return true
        }
        if(this.state.coarse!== nextProps.coarse){
            if(!this.state.wait){
                const minY = 3072 + (1536*this.state.coarse)
                const maxY = 18432
                const newMinY = 3072 + (1536*nextProps.coarse)
                const percentY = (this.props.value-minY)/(maxY-minY)
                const value = Math.round((percentY*(maxY-newMinY))+newMinY)
                this.props.callback(value)
                this.setState({coarse:nextProps.coarse,wait:true})
                return false
            }
        }
        var resize = this.state.resize
        if(resize){
            this.setState({resize:false})
        }
        return this.props.valueX !== nextProps.valueX || this.state.height !== nextState.height || this.state.top !== nextState.top || this.state.resize || this.state.active !== nextState.active
    }


      handleUpdate = () => {
        console.log(this.state.height)
        this.setState({resize:true}) //cause a rerender on resize
      };


     clamp (value:number, min:number, max:number) {
        return Math.min(Math.max(value, min), max)
      }


    render() {
        
        const minY = 3072 + (1536*this.state.coarse)
        console.log(minY)
        // console.log(this.props.coarse,minY)
        const maxY = 18432
        const percentY = (this.props.value-minY)/(maxY-minY)
        // console.log(this.props.coarse,minY,percentY)
        const pixelY = this.clamp((this.state.height -50) * percentY,0,this.state.height-50)
        

        const minX = -819
        const maxX = 819
        const percentX = (this.props.valueX-minX)/(maxX-minX)
        const pixelX = this.clamp((this.state.width -50) * percentX,0,this.state.width-50)
        
        return (
            <div id="cam1" className="cam-mid" ref={el => { 
                if (!el || this.state.height == el.getBoundingClientRect().height && this.state.top == el.getBoundingClientRect().top && this.state.width == el.getBoundingClientRect().width && this.state.left == el.getBoundingClientRect().left) return;
                this.setState({ width:el.getBoundingClientRect().width, height: el.getBoundingClientRect().height,left:el.getBoundingClientRect().left, top: el.getBoundingClientRect().top });
                console.log(el)
            }}

            >
                <div className="cam-mid-x"></div>
                <div className="cam-mid-y"></div>
                <div className="cam-mid-thumb-x"style={{top: pixelY+25+ "px" , background:(this.state.active)?"orange":"#4c4c4c"}}></div>
                <div className="cam-mid-thumb-y"style={{left: pixelX+25+ "px", background:(this.state.active)?"orange":"#4c4c4c"}}></div>
                <div className={ (this.props.onAir)?"cam-mid-thumb red":(this.state.active)?"cam-mid-thumb orange":"cam-mid-thumb" } 
                style={{ top: pixelY+ "px",left:pixelX+"px" }} 
                onMouseDown={this.handleStart}
                onTouchMove={(e)=>{this.handleDragMobile(e)}}
                onTouchStart={()=>this.setState({active:true})}
                onTouchEnd={()=>this.setState({active:false})}
                ></div>
                
            </div>)
    }

}