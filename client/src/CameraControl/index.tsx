import React, { useContext } from 'react'
import './Cams.css'
import { AtemDeviceInfo } from '../Devices/types'
import { GetActiveDevice, DeviceManagerContext, GetDeviceId } from '../DeviceManager'
import { faCircleNotch, faCaretRight, faCaretLeft, faHamburger, faBars } from '@fortawesome/free-solid-svg-icons'
import { FocusWheel } from './focuswheel'
import {  YRGBWheel } from './yrgbWheel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { max } from 'moment'
import { ZoomWheel } from './zoomwheel'
import { ApertureSquare } from './apertureSquare'
import Slider from 'react-rangeslider'
import { CoarseSlider } from './coarseSlider'
import { CamMenu, ResetMenu } from './menu'
import { MagicLabel } from './magicLabel'
import { ColourWheel } from './colorwheel'
import { Expanded } from './expanded'
import { useMediaQuery } from 'react-responsive'
import { stringify } from 'querystring'

export const CameraPage=() => {
  //context!: React.ContextType<typeof DeviceManagerContext>
  const context = useContext(DeviceManagerContext)
  //static contextType = DeviceManagerContext

  //render() {
    const device = GetActiveDevice(context)
    const isTabletOrMobile = useMediaQuery({ maxWidth: 550 })
    return (
      <div className="page-camera">

        {device ? (
          <CameraPageInner

            key={context.activeDeviceId || ''}
            device={device}
            currentProfile={context.currentProfile}
            // currentState={this.state.currentState}
            mobile={isTabletOrMobile}
            signalR={context.signalR}
          />
        ) : (
            <p>No device selected</p>
          )}
      </div>
    )
  //}
}

interface CameraPageInnerProps {
  device: AtemDeviceInfo
  signalR: signalR.HubConnection | undefined
  currentProfile: any
  mobile:boolean
  
}

interface AudioPageInnerState {
  hasConnected: boolean
  currentState: any
  expanded:number
  mobileCam:number
}



class CameraPageInner extends React.Component<CameraPageInnerProps, AudioPageInnerState> {
  constructor(props: CameraPageInnerProps) {
    super(props)
    this.state = {
      hasConnected: props.device.connected,
      currentState: null,
      expanded:0,
      mobileCam:1
    }

    if (props.device.connected) {
      this.loadDeviceState(props)
    }
  }

  componentDidMount() {
    if (this.props.signalR) {
      this.props.signalR.on("state", (state: any) => {

        this.setState({ currentState: state })

      })
    }
  }

  componentWillUnmount() {
    if (this.props.signalR) {
      this.props.signalR.off("state")
    }
  }


  loadDeviceState(props: CameraPageInnerProps) {
    if (props.signalR) {
      props.signalR
        .invoke<any>('sendState', GetDeviceId(props.device))
        .then(state => {
        })
        .catch(err => {
          console.error('StateViewer: Failed to load state:', err)
        })
    }
  }

  private sendCommand(command: string, value: any) {
    const { device, signalR } = this.props
    if (device.connected && signalR) {
      const devId = GetDeviceId(device)

      signalR
        .invoke('CommandSend', devId, command, JSON.stringify(value))
        .then((res) => {
          // console.log(value)
          // console.log('ManualCommands: sent')
          // console.log(command)
        })
        .catch(e => {
          console.log('ManualCommands: Failed to send', e)
        })
    }

  }



  render() {

    if (this.props.currentProfile == null || this.state.currentState == undefined || this.state.currentState.cameraControl.cams[1] == undefined) {
      return (<p>Waiting for Profile</p>)
    }

    if(this.state.expanded!=0 && !this.props.mobile){
      return(
      <div className="cam-holder-holder open">
      <Cam onAir={this.state.currentState.mixEffects[0].sources.program==this.state.expanded}
         name={this.state.currentState.settings.inputs["input"+(this.state.expanded)].properties.shortName} 
        currentState={this.state.currentState.cameraControl.cams[this.state.expanded]}
        signalR={this.props.signalR}
        device={this.props.device}
        mobile={this.props.mobile}
        input={this.state.expanded}
        expanded={this.state.expanded!=0}
        expandedCallback={(e:number)=>(this.state.expanded!=e)?this.setState({expanded:e}):this.setState({expanded:0})}>

        </Cam>
      <Expanded
      lift={this.state.currentState.cameraControl.cams[this.state.expanded].chip.lift}
      gamma={this.state.currentState.cameraControl.cams[this.state.expanded].chip.gamma}
      gain ={this.state.currentState.cameraControl.cams[this.state.expanded].chip.gain}
      contrast={this.state.currentState.cameraControl.cams[this.state.expanded].chip.contrast}
      hue={this.state.currentState.cameraControl.cams[this.state.expanded].chip.hue}
      saturation={this.state.currentState.cameraControl.cams[this.state.expanded].chip.saturation}
      lumMix={this.state.currentState.cameraControl.cams[this.state.expanded].chip.lumMix}
      input={this.state.expanded}
      sendCommand={(cmd:string,val:any)=>this.sendCommand(cmd,val)}
      ></Expanded>

      </div>)
    }

    if(this.props.mobile){

      var topBar = []
      for(var i = 0; i<Object.keys(this.state.currentState.cameraControl.cams).length; i++){
        const x = i+1
        topBar.push(
        <div className={this.state.mobileCam != i+1?"cam-mobile-selecter":"cam-mobile-selecter active"}
        onClick={()=>this.setState({mobileCam:x})}
        >
          {this.state.currentState.settings.inputs["input"+(i+1)].properties.shortName}
      </div>
      )
      }

      return(
        <div className="cam-holder-holder mobile">
        <div style={{gridTemplateColumns:"repeat("+ Object.keys(this.state.currentState.cameraControl.cams).length  +",1fr)"}} className="cam-mobile-selecter-holder">
          {topBar}
        </div>
        <Cam onAir={this.state.currentState.mixEffects[0].sources.program==this.state.mobileCam}
        name={this.state.currentState.settings.inputs["input"+(this.state.mobileCam)].properties.shortName} 
        currentState={this.state.currentState.cameraControl.cams[this.state.mobileCam]}
        signalR={this.props.signalR}
        device={this.props.device}
        mobile={this.props.mobile}
        expanded={this.state.expanded!=0}
        input={this.state.mobileCam}
        expandedCallback={(e:number)=>(this.state.expanded==0)?this.setState({expanded:e}):this.setState({expanded:0})}></Cam>
        </div>
      )
    }


    else{
      var cams=[]
      for(var i = 0; i<Object.keys(this.state.currentState.cameraControl.cams).length; i++){
          cams.push( 
            
          <Cam onAir={this.state.currentState.mixEffects[0].sources.program==i+1}
           name={this.state.currentState.settings.inputs["input"+(i+1)].properties.shortName} 
          currentState={this.state.currentState.cameraControl.cams[i+1]}
          signalR={this.props.signalR}
          device={this.props.device}
          mobile={this.props.mobile}
          input={i+1}
          expanded={this.state.expanded==i+1}
          expandedCallback={(e:number)=>(this.state.expanded!=e)?this.setState({expanded:e}):this.setState({expanded:0})}></Cam>
          )
      }
      return(<div className="cam-holder-holder">
        {cams}



      </div>)
    }

    


    
  }
}



interface CamProps {
  device: AtemDeviceInfo
  signalR: signalR.HubConnection | undefined
  currentState: any
  name: string
  onAir:boolean
  mobile:boolean
  expandedCallback:any
  expanded:boolean
  input:number
  
  
}

class Cam extends React.Component<CamProps,{page:number,coarse:number}> {
  constructor(props: CamProps) {
    super(props)
    this.state = {
      page:0,
      coarse:0, //0 to 9
    }
  }

  private sendCommand(command: string, value: any) {
    const { device, signalR } = this.props
    if (device.connected && signalR) {
      const devId = GetDeviceId(device)

      signalR
        .invoke('CommandSend', devId, command, JSON.stringify(value))
        .then((res) => {
          console.log(value)
          console.log('ManualCommands: sent')
          console.log(command)
        })
        .catch(e => {
          console.log('ManualCommands: Failed to send', e)
        })
    }

  }

  shouldComponentUpdate(nextProps: CamProps, nextState:{page:number,coarse:number}){
    return JSON.stringify(this.props) != JSON.stringify(nextProps) || this.state.page!= nextState.page || this.state.coarse != nextState.coarse

  }

  
  render() {


    const pageScale = [4096,8192,2048][this.state.page]
    const pageMax= [4096,8192,32767][this.state.page]
    const pageId = ["lift","gamma","gain"][this.state.page]


    //aperture lights
    var apertureOffCount = Math.round((this.props.currentState.lens.iris - 3072)/640)
    var aperture = []
    for (var i=0; i < apertureOffCount; i++) aperture.push(<div className="cam-aperture-item"></div>)
    for (var i=0; i < 24 - apertureOffCount; i++) aperture.push(<div className="cam-aperture-item on"></div>)
    

    return (
    
    <div className="cam-holder">
     <Heading onAir={this.props.onAir} name={this.props.name}/>

     <div style={{height: "100%", margin:"0px 10px"}} className="ss-button-holder">
                    <div onClick={()=>this.setState({page:0})} className={(this.state.page == 0)?"ss-button-inner ss-button-left ss-button-inner-selected":"ss-button-inner ss-button-left"}>
                        Lift
                    </div>
                    <div onClick={()=>this.setState({page:1})} className={(this.state.page == 1)?"ss-button-inner ss-button-mid ss-button-inner-selected":"ss-button-inner ss-button-mid"}>
                        Gamma
                    </div>
                    <div onClick={()=>this.setState({page:2})} className={(this.state.page == 2)?"ss-button-inner ss-button-right ss-button-inner-selected":"ss-button-inner ss-button-right"}>
                        Gain
                    </div>
                </div>

      <div className="cam-circle-holder">
          <ColourWheel
          callback={(r:number,g:number,b:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:r,G:g,B:b,Y:this.props.currentState.chip.lift.y})}
          rgby={this.props.currentState.chip[pageId]}
          outerRadius = {150}
          innerRadius = {135}
          blackWidth={10}
          /> 

        <div className="cam-circle-button expand" onClick={()=>this.props.expandedCallback(this.props.input)}> 
                <svg style={{position:"absolute",top:"2px",left:"2px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={this.props.expanded?"orange":"#5e5e5e"} width="24px" height="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>
            </div>
      </div>
      <YRGBWheel minMax={pageMax} values={{r:this.props.currentState.chip[pageId].r,g:this.props.currentState.chip[pageId].g,b:this.props.currentState.chip[pageId].b,y:this.props.currentState.chip[pageId].y}}
       callback={(r:number,g:number,b:number,y:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:r,G:g,B:b,Y:y})}/>

  

      <div className="cam-value-bar">
        <CamMenu 
        detail={this.props.currentState.camera.detail}
        colorBar={this.props.currentState.colorBars}
        colorBarCallback={()=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand", {Input:this.props.input,AdjustmentDomain:4,Relative:false, ColorBars: !this.props.currentState.colorBars})}
        detailCallback={(e:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand", {Input:this.props.input,AdjustmentDomain:1,CameraFeature:8,Relative:false, Detail:e})}
          />
        
        <div className="cam-value">
          <MagicLabel step={5} max={pageMax} min= {-pageMax}
          callback={(e: number) => { this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",
          {Input:this.props.input,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:this.props.currentState.chip[pageId].r,G:this.props.currentState.chip[pageId].g,B:this.props.currentState.chip[pageId].b,Y:e})}} 
          format={(e:any)=>(e/pageScale).toFixed(2)}
          value={this.props.currentState.chip[pageId].y}/>
    
          <div className="cam-value-colour-bar white"></div>
        </div>

        <div className="cam-value">
        <MagicLabel step={5} max={pageMax} min= {-pageMax}
          callback={(e: number) => { this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",
          {Input:this.props.input,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:e,G:this.props.currentState.chip[pageId].g,B:this.props.currentState.chip[pageId].b,Y:this.props.currentState.chip[pageId].y})}} 
          format={(e:any)=>(e/pageScale).toFixed(2)}
          value={this.props.currentState.chip[pageId].r}/>
          <div className="cam-value-colour-bar red"></div>
        </div>

        <div className="cam-value">
        <MagicLabel step={5} max={pageMax} min= {-pageMax}
          callback={(e: number) => { this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",
          {Input:this.props.input,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:this.props.currentState.chip[pageId].r,G:e,B:this.props.currentState.chip[pageId].b,Y:this.props.currentState.chip[pageId].y})}} 
          format={(e:any)=>(e/pageScale).toFixed(2)}
          value={this.props.currentState.chip[pageId].g}/>
          <div className="cam-value-colour-bar green"></div>
        </div>

        <div className="cam-value">
        <MagicLabel step={5} max={pageMax} min= {-pageMax}
          callback={(e: number) => { this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",
          {Input:this.props.input,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:this.props.currentState.chip[pageId].r,G:this.props.currentState.chip[pageId].g,B:e,Y:this.props.currentState.chip[pageId].y})}} 
          format={(e:any)=>(e/pageScale).toFixed(2)}
          value={this.props.currentState.chip[pageId].b}/>
          <div className="cam-value-colour-bar blue"></div>
        </div>

        <ResetMenu 
        callbackLift={()=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:8,ChipFeature:0,Relative:false,R:0,G:0,B:0,Y:0})}
        callbackGamma={(e:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand", {Input:this.props.input,AdjustmentDomain:8,ChipFeature:1,Relative:false,R:0,G:0,B:0,Y:0})}
        callbackGain={(e:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand", {Input:this.props.input,AdjustmentDomain:8,ChipFeature:2,Relative:false,R:2048,G:2048,B:2048,Y:2048})}
          />

      </div>




      <CamBarBlack
      input={this.props.input}
      sendCommand={(command:string, val:any)=>this.sendCommand(command,val)}
      shutter={this.props.currentState.camera.shutter}
      gain={this.props.currentState.camera.gain}
      whiteBalance={this.props.currentState.camera.whiteBalance}
      
      ></CamBarBlack>


      {this.props.expanded && this.props.mobile?<ChipSliders 
      input={this.props.input}
      sendCommand={(command:string, val:any)=>this.sendCommand(command,val)}
      hue={this.props.currentState.chip.hue}
      saturation={this.props.currentState.chip.saturation}
      lumMix = {this.props.currentState.chip.lumMix}
      contrast={this.props.currentState.chip.contrast}
      ></ChipSliders>:null}


      <div className="cam-bottom-holder">
        <div className="cam-aperture">
          <div className="cam-aperture-label">OPEN</div>
          <div className="cam-aperture-holder">
              {aperture}
          </div>
          <div className="cam-aperture-label">CLOSE</div>
        </div>
        <div className="cam-mid-holder">
          <ApertureSquare 
          coarse ={this.state.coarse}
          onAir={this.props.onAir}
          valueX={this.props.currentState.chip.lift.y}
          value={this.props.currentState.lens.iris} 
          callback={(e:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:0,LensFeature:2,Relative:false,Iris:e})}
          callbackX={(e:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:8,ChipFeature:0,Relative:false,R:this.props.currentState.chip.lift.r,G:this.props.currentState.chip.lift.g,B:this.props.currentState.chip.lift.b,Y:e})}>

          </ApertureSquare>
          <FocusWheel  callback={(e:number)=>{this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:0,LensFeature:0,Relative:true,Focus:e})}}></FocusWheel>
        </div>
        
        <div className="cam-right-holder">
          <div className="cam-aperture-label">ZOOM</div>
        
          <ZoomWheel callback={(e:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:0,LensFeature:9,Relative:false,ZoomSpeed:e})}></ZoomWheel>
          <div className="cam-aperture-label">COARSE</div>
          <CoarseSlider
          value={this.state.coarse}
          callback={(e:number)=>{
          this.setState({coarse:e})
          // this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:0,LensFeature:2,Relative:false,Aperture:(this.props.currentState.lens.aperture)+((e/100)*13824)})
          }}>

          </CoarseSlider>
          <div className="cam-circle-button" onClick={()=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:0,LensFeature:1})}> 
            <svg height="100%" width="100%" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="17" strokeWidth="2" stroke="#5e5e5e" fill="none"></circle>
                <rect x="23" width="4" y="7" height="7" fill="#5e5e5e"></rect>
                <rect x="23" width="4" y="35" height="7" fill="#5e5e5e"></rect>
                <rect x="7" width="7" y="23" height="4" fill="#5e5e5e"></rect>
                <rect x="35" width="7" y="23" height="4" fill="#5e5e5e"></rect>
            </svg> 
            </div>
        </div>
            
        </div>
        </div>

    )
  }
}


function Heading(props:{onAir:boolean,name:string}){
  if(!props.onAir){
    return(
      <div className="cam-header">
          <div className="cam-header-title">{props.name}</div>
      </div>
    )
  }
  return(
    <div className="cam-header active">
          <div className="cam-header-title">{props.name}</div>
          <div className="cam-header-onAir">On Air</div>
    </div>
  )
}


const areEqual = (prevProps:{input:number,sendCommand:any,whiteBalance:number,shutter:number,gain:number}, nextProps:{input:number,sendCommand:any,whiteBalance:number,shutter:number,gain:number}) => JSON.stringify(prevProps)==JSON.stringify(nextProps);


const CamBarBlack = React.memo( props =>{
  const shutter =[41667,40000,33333,20000,16667,13333,11111,10000,8333,6667,5556,4000,2778,2000,1379,1000,690,500]
  return(
  <div className="cam-black-bar" >
  <div className="cam-black-item">
    <div className="cam-black-arrow left" onClick={()=> props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:props.input,AdjustmentDomain:1,CameraFeature:13,Relative:0,CameraGain:Math.max(-12,props.gain-6)})} ><FontAwesomeIcon icon={faCaretLeft} /></div>
    <div style={{width:"44px"}} className="cam-black-text">{props.gain+"db"}</div>
    <div className="cam-black-arrow" onClick={()=> props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:props.input,AdjustmentDomain:1,CameraFeature:13,Relative:0,CameraGain:Math.min(24,props.gain+6)})}><FontAwesomeIcon icon={faCaretRight} /></div>
  </div>

  <div className="cam-black-item">
    <div className="cam-black-arrow left"  onClick={()=> props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:props.input,AdjustmentDomain:1,CameraFeature:5,Relative:0,Shutter:shutter[Math.abs(-1+shutter.length+shutter.indexOf(props.shutter))%shutter.length]})}><FontAwesomeIcon icon={faCaretLeft} /></div>
    <div className="cam-black-text">{"1/"+Math.round((1/props.shutter)*1000000)}</div>
    <div className="cam-black-arrow" onClick={()=> props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:props.input,AdjustmentDomain:1,CameraFeature:5,Relative:0,Shutter:shutter[Math.abs(1+shutter.length+shutter.indexOf(props.shutter))%shutter.length]})}><FontAwesomeIcon icon={faCaretRight} /></div>
  </div>

  <div className="cam-black-item">
    <div className="cam-black-arrow left" onClick={()=> props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:props.input,AdjustmentDomain:1,CameraFeature:2,Relative:false,WhiteBalance:Math.max(2500,props.whiteBalance-50)})}><FontAwesomeIcon icon={faCaretLeft}/></div>
    <div style={{width:"59px"}} className="cam-black-text">{props.whiteBalance+"K"}</div>
    <div  className="cam-black-arrow" onClick={()=> props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:props.input,AdjustmentDomain:1,CameraFeature:2,Relative:false,WhiteBalance:Math.min(10000,props.whiteBalance+50)})}><FontAwesomeIcon icon={faCaretRight} /></div>
  </div>
</div>)
},areEqual);


function ChipSliders(props:{contrast:number,saturation:number,hue:number, lumMix:number,sendCommand:any ,input:number}){

  return(
  <div className="cam-expanded-slider-holder-holder">
  <div className="cam-slider">
      <div className="cam-expanded-slider-label">Contrast</div>
      <div className="cam-expanded-slider-value">{Math.round(props.contrast/40.96)}%</div>
      <Slider 
      value={props.contrast} 
      max={4096} 
      min={0}
      step={1}
      tooltip={false}
      onChange={(e)=>props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input: props.input, AdjustmentDomain:8, ChipFeature:4 , Contrast:e})}
      ></Slider>
  </div>


  <div className="cam-slider">
      <div className="cam-expanded-slider-label">Saturation</div>
      <div className="cam-expanded-slider-value">{Math.round(props.saturation/40.96)}%</div>
      <Slider 
      value={props.saturation} 
      max={4096} 
      min={0}
      step={1}
      tooltip={false}
      onChange={(e)=>props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input: props.input, AdjustmentDomain:8, ChipFeature:6 , Saturation:e,Hue:props.hue})}
      ></Slider>
  </div>

  <div className="cam-slider">
      <div className="cam-expanded-slider-label">Hue</div>
      <div className="cam-expanded-slider-value">{Math.round(((props.hue+2048)/4096)*360)}&deg;</div>
      <Slider 
      value={props.hue} 
      max={2048} 
      min={-2048}
      step={1}
      tooltip={false}
      onChange={(e)=>props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input: props.input, AdjustmentDomain:8, ChipFeature:6 , Hue:e, Saturation:props.saturation})}
      ></Slider>
  </div>

  <div className="cam-slider">
      <div className="cam-expanded-slider-label">RGB</div>
      <div className="cam-expanded-slider-label" style={{right:"0px"}}>YRGB</div>
      <Slider 
      value={props.lumMix} 
      max={2048} 
      min={0}
      step={1}
      tooltip={false}
      onChange={(e)=>props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input: props.input, AdjustmentDomain:8, ChipFeature:5 , LumMix:e})}
      ></Slider>
  </div>

</div>)
}
