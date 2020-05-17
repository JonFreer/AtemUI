import React from 'react'
import './Cams.css'
import { AtemDeviceInfo } from '../Devices/types'
import { GetActiveDevice, DeviceManagerContext, GetDeviceId } from '../DeviceManager'
import { faCircleNotch, faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons'
import { FocusWheel } from './focuswheel'
import {  YRGBWheel } from './yrgbWheel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { max } from 'moment'
import { ZoomWheel } from './zoomwheel'

export class CameraPage extends React.Component {
  context!: React.ContextType<typeof DeviceManagerContext>

  static contextType = DeviceManagerContext

  render() {
    const device = GetActiveDevice(this.context)
    return (
      <div className="page-camera">

        {device ? (
          <CameraPageInner

            key={this.context.activeDeviceId || ''}
            device={device}
            currentProfile={this.context.currentProfile}
            // currentState={this.state.currentState}
            signalR={this.context.signalR}
          />
        ) : (
            <p>No device selected</p>
          )}
      </div>
    )
  }
}

interface CameraPageInnerProps {
  device: AtemDeviceInfo
  signalR: signalR.HubConnection | undefined
  currentProfile: any
}
interface AudioPageInnerState {
  hasConnected: boolean
  currentState: any
}



class CameraPageInner extends React.Component<CameraPageInnerProps, AudioPageInnerState> {
  constructor(props: CameraPageInnerProps) {
    super(props)
    this.state = {
      hasConnected: props.device.connected,
      currentState: null,
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

    return (

      <Cam onAir={true} name={"Cam 1"} currentState={this.state.currentState.cameraControl.cams[1]} signalR={this.props.signalR} device={this.props.device}></Cam>

    )
  }
}



interface CamProps {
  device: AtemDeviceInfo
  signalR: signalR.HubConnection | undefined
  currentState: any
  name: string
  onAir:boolean
}

class Cam extends React.Component<CamProps,{page:number}> {
  constructor(props: CamProps) {
    super(props)
    this.state = {
      page:0
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

  
  render() {


    const pageScale = [4096,8192,2048][this.state.page]
    const pageMax= [4096,8192,32767][this.state.page]
    const pageId = ["lift","gamma","gain"][this.state.page]
    const shutter =[41667,40000,33333,20000,16667,13333,11111,10000,8333,6667,5556,4000,2778,2000,1379,1000,690,500]
    // const shutter = [24,25,30,50,60,75,90,100,120,150,180,250,360,500,725,1000,1450,2000]


    var apertureOffCount = Math.round((this.props.currentState.lens.aperture - 3072)/640)
    var aperture = []
    for (var i=0; i < apertureOffCount; i++) aperture.push(<div className="cam-aperture-item"></div>)
    for (var i=0; i < 24 - apertureOffCount; i++) aperture.push(<div className="cam-aperture-item on"></div>)
    return (<div className="cam-holder">
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
          <ColourWheel rgby={this.props.currentState.chip.lift}/>
          
      </div>
      <YRGBWheel minMax={pageMax} values={{r:this.props.currentState.chip[pageId].r,g:this.props.currentState.chip[pageId].g,b:this.props.currentState.chip[pageId].b,y:this.props.currentState.chip[pageId].y}}
       callback={(r:number,g:number,b:number,y:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:r,G:g,B:b,Y:y})}/>

  

      <div className="cam-value-bar">
        <div></div>
        <div className="cam-value">
          <MagicLabel step={5} max={pageMax} min= {-pageMax}
          callback={(e: number) => { this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",
          {Input:1,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:this.props.currentState.chip[pageId].r,G:this.props.currentState.chip[pageId].g,B:this.props.currentState.chip[pageId].b,Y:e})}} 
          format={(e:any)=>(e/pageScale).toFixed(2)}
          value={this.props.currentState.chip[pageId].y}/>
    
          <div className="cam-value-colour-bar white"></div>
        </div>

        <div className="cam-value">
        <MagicLabel step={5} max={pageMax} min= {-pageMax}
          callback={(e: number) => { this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",
          {Input:1,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:e,G:this.props.currentState.chip[pageId].g,B:this.props.currentState.chip[pageId].b,Y:this.props.currentState.chip[pageId].y})}} 
          format={(e:any)=>(e/pageScale).toFixed(2)}
          value={this.props.currentState.chip[pageId].r}/>
          <div className="cam-value-colour-bar red"></div>
        </div>

        <div className="cam-value">
        <MagicLabel step={5} max={pageMax} min= {-pageMax}
          callback={(e: number) => { this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",
          {Input:1,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:this.props.currentState.chip[pageId].r,G:e,B:this.props.currentState.chip[pageId].b,Y:this.props.currentState.chip[pageId].y})}} 
          format={(e:any)=>(e/pageScale).toFixed(2)}
          value={this.props.currentState.chip[pageId].g}/>
          <div className="cam-value-colour-bar green"></div>
        </div>

        <div className="cam-value">
        <MagicLabel step={5} max={pageMax} min= {-pageMax}
          callback={(e: number) => { this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",
          {Input:1,AdjustmentDomain:8,ChipFeature:this.state.page,Relative:false,R:this.props.currentState.chip[pageId].r,G:this.props.currentState.chip[pageId].g,B:e,Y:this.props.currentState.chip[pageId].y})}} 
          format={(e:any)=>(e/pageScale).toFixed(2)}
          value={this.props.currentState.chip[pageId].b}/>
          <div className="cam-value-colour-bar blue"></div>
        </div>
      </div>




      <div className="cam-black-bar" >
        <div className="cam-black-item">
          <div className="cam-black-arrow left" onClick={()=> this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:1,CameraFeature:13,Relative:0,CameraGain:Math.max(-12,this.props.currentState.camera.gain-6)})} ><FontAwesomeIcon icon={faCaretLeft} /></div>
          <div style={{width:"44px"}} className="cam-black-text">{this.props.currentState.camera.gain+"db"}</div>
          <div className="cam-black-arrow" onClick={()=> this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:1,CameraFeature:13,Relative:0,CameraGain:Math.min(24,this.props.currentState.camera.gain+6)})}><FontAwesomeIcon icon={faCaretRight} /></div>
        </div>

        <div className="cam-black-item">
          <div className="cam-black-arrow left"  onClick={()=> this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:1,CameraFeature:5,Relative:0,Shutter:shutter[Math.abs(-1+shutter.length+shutter.indexOf(this.props.currentState.camera.shutter))%shutter.length]})}><FontAwesomeIcon icon={faCaretLeft} /></div>
          <div className="cam-black-text">{"1/"+Math.round((1/this.props.currentState.camera.shutter)*1000000)}</div>
          <div className="cam-black-arrow" onClick={()=> this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:1,CameraFeature:5,Relative:0,Shutter:shutter[Math.abs(1+shutter.length+shutter.indexOf(this.props.currentState.camera.shutter))%shutter.length]})}><FontAwesomeIcon icon={faCaretRight} /></div>
        </div>

        <div className="cam-black-item">
          <div className="cam-black-arrow left" onClick={()=> this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:1,CameraFeature:2,Relative:false,WhiteBalance:Math.max(2500,this.props.currentState.camera.whiteBalance-50)})}><FontAwesomeIcon icon={faCaretLeft}/></div>
          <div style={{width:"59px"}} className="cam-black-text">{this.props.currentState.camera.whiteBalance+"K"}</div>
          <div  className="cam-black-arrow" onClick={()=> this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:1,CameraFeature:2,Relative:false,WhiteBalance:Math.min(10000,this.props.currentState.camera.whiteBalance+50)})}><FontAwesomeIcon icon={faCaretRight} /></div>
        </div>
      </div>
      <div className="cam-bottom-holder">
        <div className="cam-aperture">
          <div className="cam-aperture-label">OPEN</div>
          <div className="cam-aperture-holder">
              {aperture}
          </div>
          <div className="cam-aperture-label">CLOSE</div>
        </div>
        <div className="cam-mid-holder">
          <div className="cam-mid">
            <div className="cam-mid-x"></div>
            <div className="cam-mid-y"></div>
          </div>
          <FocusWheel callback={(e:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:0,LensFeature:0,Relative:true,Focus:e})}></FocusWheel>
        </div>
        
        <div className="cam-right-holder">
          <div className="cam-aperture-label">ZOOM</div>
          <div className="cam-zoom-outer">
          <div></div>
          <ZoomWheel callback={(e:number)=>this.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:1,AdjustmentDomain:0,LensFeature:0,Relative:true,Focus:e})}></ZoomWheel>
          </div>

        </div>
            
        </div>
    </div>)
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


class ColourWheel extends React.Component<{rgby:any}> {
 
shouldComponentUpdate(){
  return false
}

polarToCartesian(centerX:number, centerY:number, radius:number, angleInDegrees:number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
    };
}

describeArc(x:number, y:number, radius:number, startAngle:number, endAngle:number) {
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

generateConicGradiant(radius:number, resolution:number) {
    var paths = []
    for (var i = 0; i < 360 * resolution; i++) {
        const path = <path fill={'hsl(' + (-(i / resolution)-30) + ', 40%, 50%)'} d={this.describeArc(
          radius,
          radius,
          radius-10,
          i / resolution,
          (i + 2) / resolution
      )}>

      </path>
        paths.push(path);
    } 
    return paths
}

distance(dot1:any, dot2:any) {
  var x1 = dot1[0],
      y1 = dot1[1],
      x2 = dot2[0],
      y2 = dot2[1];
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

limit(x:any, y:any) {
  var dist = this.distance([x, y], [0,0]);
  if (dist <= 125) {
      return {x: x, y: y};
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


  render(){
    const b = {x: 122.5 , y: 21.25}
    const g = {x: -80 , y: 96.25}
    const r ={x: -42.5 , y: -117.5}
    var cy = (this.props.rgby.b/4096*b.y) + (this.props.rgby.g/4096*g.y) + (this.props.rgby.r/4096*r.y)
    var cx = (this.props.rgby.b/4096*b.x) + (this.props.rgby.g/4096*g.x) + (this.props.rgby.r/4096*r.x)
    var coords = this.limit(cx,cy)
    const resolution = 1;
    const outerRadius = 150;
    const innerRadius = 135;
    return(<svg  height="100%" width="100%" viewBox="0 0 300 300" version="1.1" id="color-wheel">
    <circle fill="#181818" cx={outerRadius} cy={outerRadius} r={outerRadius}></circle>
    {this.generateConicGradiant(outerRadius, resolution)}
    <circle fill="#232323" cx={outerRadius} cy={outerRadius} r={innerRadius-10}></circle>
    <line x1="150" x2="150" y1="25" y2="275" stroke="#303030" strokeWidth="1" ></line>
    <line x1="25" x2="275" y1="150" y2="150" stroke="#303030" strokeWidth="1" stroke-width="1"></line>
    <circle className="cam-shadow" cx={150+coords.x} cy={150+coords.y} r="10" fill="none" stroke="#505050" strokeWidth="3"></circle>
  </svg>)
  }
}

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
  focus: boolean
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
          focus: false,

          tempValue: this.props.value,
          displayValue :this.props.value,
          disabled: this.props.disabled || true,
          xCoord: 0,
          yCoord: 0,
          active: false
      }
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

  handleDrag = (e: any) => {
      e.stopPropagation()
      console.log(e.clientX)
      
      this.props.callback(Math.max(this.props.min,Math.min(this.state.tempValue + ((e.clientX - this.state.xCoord)),this.props.max)))
      this.setState({displayValue:(Math.max(this.props.min,Math.min(this.state.tempValue + ((e.clientX - this.state.xCoord)),this.props.max))) })

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
          onTouchMove={(e) => {
              console.log((this.state.yCoord - e.touches.item(0).clientY))
              this.props.callback(this.props.value + ((this.state.yCoord - e.touches.item(0).clientY)))
              this.setState({ xCoord: e.touches.item(0).clientX, yCoord: e.touches.item(0).clientY })
          }}
          onTouchStart={(e) => {
              this.setState({ xCoord: e.touches.item(0).clientX, yCoord: e.touches.item(0).clientY })
              console.log("touchStart")
          }}

          className={(!this.state.active) ? "cam-value-value" : "cam-value-value active"}>
          {(this.state.active)?this.props.format(this.state.displayValue):this.props.format(this.props.value)}
      </div>)


  }
}