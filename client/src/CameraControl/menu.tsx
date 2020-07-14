
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUndo } from "@fortawesome/free-solid-svg-icons";
interface MenuProps {
    colorBarCallback: any
    colorBar:number
    detailCallback:any
    detail:any
}

export class CamMenu extends React.Component<MenuProps,{open:boolean}>{
    constructor(props: MenuProps) {
        super(props)
        this.state = {
            open:false
        }
        this.onBlur = this.onBlur.bind(this)
    }

    shouldComponentUpdate(nextProps:MenuProps,nextState:{open:boolean}){
        if(nextState.open!==this.state.open){
            return true
        }
        else if(nextState.open){
            return nextProps.detail !== this.props.detail || nextProps.colorBar !== this.props.colorBar
        }else{
            return false
        }
    }


    onBlur(){
        this.setState({open:false})
    }

    render(){
        

        return( <div tabIndex={0} onClick={()=>this.setState({open:!this.state.open})} onBlur={this.onBlur} className="cam-value-bar-button"><FontAwesomeIcon icon={faBars}/>

        {(this.state.open)?  
            <div  className="cam-value-bar-menu" >
                <div style={{borderBottom:"1px solid #181818"}} className="cam-value-bar-menu-row" onClick={()=>this.props.colorBarCallback()}> {(this.props.colorBar)?"Hide Color Bars":"Show Color Bars" }</div>
                <div className={this.props.detail===0? "cam-value-bar-menu-row active":"cam-value-bar-menu-row" } onClick={()=> this.props.detailCallback(0)}> Detail Off </div>
                <div className={this.props.detail===1? "cam-value-bar-menu-row active":"cam-value-bar-menu-row" } onClick={()=> this.props.detailCallback(1)}> Default Detail </div>
                <div className={this.props.detail===2? "cam-value-bar-menu-row active":"cam-value-bar-menu-row" } onClick={()=> this.props.detailCallback(2)}> Medium Detail </div>
                <div className={this.props.detail===3? "cam-value-bar-menu-row active":"cam-value-bar-menu-row" } onClick={()=> this.props.detailCallback(3)}> High Detail </div>
            </div>:<div></div>}

        </div>
        )
        
        
  
        
    }
  }

  interface ResetProps {
    callbackLift: any
    callbackGamma: any
    callbackGain: any

  }


  export class ResetMenu extends React.Component<ResetProps,{open:boolean}>{
    constructor(props: ResetProps) {
        super(props)
        this.state = {
            open:false
        }
        this.onBlur = this.onBlur.bind(this)
    }

    shouldComponentUpdate(nextProps:ResetProps,nextState:{open:boolean}){
        if(nextState.open!==this.state.open){
            return true
        }
        else if(nextState.open){
            return true
            // return nextProps.detail !== this.props.detail || nextProps.colorBar !== this.props.colorBar
        }else{
            return false
        }
    }


    onBlur(){
        this.setState({open:false})
    }

    render(){
        

        return( <div style={{paddingLeft:"5px"}} tabIndex={0} onClick={()=>this.setState({open:!this.state.open})} onBlur={this.onBlur} className="cam-value-bar-button"><FontAwesomeIcon icon={faUndo}/>

        {(this.state.open)?  
            <div style={{left:"-140px"}}  className="cam-value-bar-menu" >
                <div className="cam-value-bar-menu-row" onClick={()=>this.props.callbackLift()} > Reset Lift </div>
                <div className="cam-value-bar-menu-row" onClick={()=>this.props.callbackGamma()}> Reset Gamma </div>
                <div className="cam-value-bar-menu-row" onClick={()=>this.props.callbackGain()}> Reset Gain </div>
                <div style={{borderTop:"1px solid #181818"}}  onClick={()=>{
                    this.props.callbackLift()
                    this.props.callbackGamma()
                    this.props.callbackGain()}} className="cam-value-bar-menu-row" > Reset All </div>
            </div>:<div></div>}

        </div>
        )
        
        
  
        
    }
  }