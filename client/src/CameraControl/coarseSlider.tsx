import React from "react";
import ResizeObserver from 'resize-observer-polyfill'

interface FocusProps {
    callback: any
    value:number

}
interface FocusState {

    active: boolean
    height: number
    top: number
}

export class CoarseSlider extends React.Component<FocusProps, FocusState> {

    constructor(props: FocusProps) {
        super(props)
        this.state = {
            active: false,
            height: -1,
            top: 0,

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

        const minY = 0
        const maxY = 9
        let pixelY = e.clientY  - this.state.top 
        const percentY = pixelY/(this.state.height) 
        const value = Math.round((percentY*(maxY-minY))+minY)
        this.props.callback(this.clamp(value,minY,maxY))

       
        
    };

    handleDragMobile = (e: any) => {
        e.stopPropagation()

        const minY = 0
        const maxY = 9
        let pixelY = e.touches.item(0).clientY  - this.state.top 
        const percentY = pixelY/(this.state.height) 
        const value = Math.round((percentY*(maxY-minY))+minY)
        this.props.callback(this.clamp(value,minY,maxY))
       
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
        const div = document.getElementById("coarse1")
        if(div!=null){
            resizeObserver.observe(div)
        }
      }


      handleUpdate = () => {
        console.log(this.state.height)
        this.setState({active:false}) //cause a rerender on resize
      };


     clamp (value:number, min:number, max:number) {
        return Math.min(Math.max(value, min), max)
      }


    render() {
        const minY = 0
        const maxY = 9
        const percentY = (this.props.value-minY)/(maxY-minY)
        const pixelY = (this.state.height) * percentY -12
        

        
        return (
            <div id="coarse1" className="cam-coarse" ref={el => { 
                if (!el || this.state.height == el.getBoundingClientRect().height && this.state.top == el.getBoundingClientRect().top) return;
                this.setState({  height: el.getBoundingClientRect().height, top: el.getBoundingClientRect().top });
            }}

            

            >
     
          
                <div className="cam-coarse-handle"  
                style={{ top: pixelY+ "px"}} 
                onMouseDown={this.handleStart}
                onTouchMove={(e)=>{this.handleDragMobile(e)}}
                onTouchStart={()=>this.setState({active:true})}
                onTouchEnd={()=>this.setState({active:false})}
                ></div>
                
            </div>)
    }

}