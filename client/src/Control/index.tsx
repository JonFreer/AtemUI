import React from 'react'
import './control.css'
import { AtemDeviceInfo } from '../Devices/types'
import { GetActiveDevice, DeviceManagerContext, GetDeviceId } from '../DeviceManager'
import { SwitcherSettings, RateInput } from "./Settings/settings"
import { AtemButtonRed, AtemButtonGreen, AtemButtonYellow, AtemButtonOnAir, AtemButtonFTB } from './button/button';
import { videoIds } from '../ControlSettings/ids';
import MediaQuery, { useMediaQuery } from 'react-responsive'

export class ControlPage extends React.Component {
  context!: React.ContextType<typeof DeviceManagerContext>

  static contextType = DeviceManagerContext

  render() {
    const device = GetActiveDevice(this.context)
    if (device) {
      if (device.connected) {
        return (

          <ControlPageInnerInner
            key={this.context.activeDeviceId || ''}
            device={device}
            signalR={this.context.signalR}
          />

        )
      } else {
        return (<div>Device is not connected</div>)
      }
    } else {
      return (<div>No device Selected</div>)
    }
  }
}

interface ControlPageInnerInnerProps {
  device: AtemDeviceInfo
  signalR: signalR.HubConnection | undefined
}
interface ControlPageInnerInnerState {
  open: boolean
  openMobile: boolean
  currentState: any
}

//Handles Mobile Layout
class ControlPageInnerInner extends React.Component<ControlPageInnerInnerProps, ControlPageInnerInnerState> {
  constructor(props: ControlPageInnerProps) {
    super(props)
    this.state = {
      open: true,
      openMobile: false,
      currentState: undefined
    }
  }

  componentDidMount() {
    if (this.props.signalR) {
      this.props.signalR.on("state", (state: any) => {
        state.audio = { programOut: { followFadeToBlack: state.audio.programOut.followFadeToBlack } } //remove levels which cause constant updates 
        if (JSON.stringify(this.state.currentState) !== JSON.stringify(state)) {
          this.setState({ currentState: state })

        }
      })
    }
  }

  componentWillUnmount() {
    if (this.props.signalR) {
      this.props.signalR.off("state")
    }
  }


  render() {
    return (
      <MediaQuery minWidth='950px'>
        {(matches)=> matches?
        (this.state.open) ?

          <div className="control-page" style={{ gridTemplateColumns: "1fr 20px 310px" }}>

            <ControlPageInner
              open={this.state.open}
              device={this.props.device}
              currentState={this.state.currentState}
              signalR={this.props.signalR}
            />

            <div onClick={() => { this.setState({ open: false }) }} className="open-button"><svg style={{ position: "absolute", top: "7px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange" width="25px" height="25px"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg></div>

            <SwitcherSettings
              full={false}
              device={this.props.device}
              currentState={this.state.currentState}
              signalR={this.props.signalR}
            />

          </div> :

          <div className="control-page" style={{ gridTemplateColumns: "1fr 20px" }}>
            <ControlPageInner
            open={this.state.open}
              device={this.props.device}
              currentState={this.state.currentState}
              signalR={this.props.signalR}
            />

            <div onClick={() => { this.setState({ open: true }) }} className="open-button"><svg style={{ position: "absolute", left: "-1px", top: "7px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange" width="25px" height="25px"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" /></svg></div>
          </div>




        :

          (this.state.openMobile)?
          <div className="control-page" style={{ display: "box" }}>

          <div className="ss-button-holder" style={{ gridTemplateColumns: "1fr 1fr" }}  >
            <div className="ss-button-inner ss-button-left " onClick={() => this.setState({ openMobile: false })}>
              Control
                </div>

            <div className="ss-button-inner ss-button-right ss-button-inner-selected" onClick={() => this.setState({ openMobile: true })}>
              Settings
                </div>
          </div>

          <SwitcherSettings
            full={true}
            device={this.props.device}
            currentState={this.state.currentState}
            signalR={this.props.signalR}
          />


        </div>
          :
          <div className="control-page">

          <div className="ss-button-holder" style={{ gridTemplateColumns: "1fr 1fr" }} >
            <div className="ss-button-inner ss-button-left ss-button-inner-selected" onClick={() => this.setState({ openMobile: false })}>
              Control
                </div>

            <div className="ss-button-inner ss-button-right " onClick={() => this.setState({ openMobile: true })}>
              Settings
                </div>
          </div>

          <ControlPageInner
            device={this.props.device}
            currentState={this.state.currentState}
            open={this.state.open}
            signalR={this.props.signalR}
          />
        </div>
  }
      </MediaQuery>
    )
  }
}

interface ControlPageInnerProps {
  device: AtemDeviceInfo
  signalR: signalR.HubConnection | undefined
  currentState: any
  open:boolean
}
interface ControlPageInnerState {
  hasConnected: boolean
  state: any | null
  currentState: any
}

class ControlPageInner extends React.Component<ControlPageInnerProps, ControlPageInnerState> {
  constructor(props: ControlPageInnerProps) {
    super(props)
    this.state = {
      hasConnected: props.device.connected,
      state: props.currentState,
      currentState: null
    }
    if (props.device.connected) {
      this.loadDeviceState(props)
    }

  }


  loadDeviceState(props: ControlPageInnerProps) {
    if (props.signalR) {
      props.signalR
        .invoke<any>('sendState', GetDeviceId(props.device))
        .then(state => {
        })
        .catch(err => {
          console.error('StateViewer: Failed to load state:', err)
          this.setState({
            state: null
          })
        })
    }
  }


  signalR = this.props.signalR
  device = this.props.device


  public sendCommand(command: string, value: any) {
    const signalR = this.signalR
    const device = this.device
    console.log(this)
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
    const { device, currentState, signalR } = this.props
    const { hasConnected } = this.state

    if (!hasConnected) {
      return <p>Device is not connected</p>
    } else if (!currentState) {
      return <p>Loading state...</p>
    }

    return (
      <div className={(this.props.open)?"page-wrapper-control open":"page-wrapper-control"}>

        <Program programSource={ this.props.currentState.mixEffects[0].sources.program} inputs={this.props.currentState.settings.inputs} sendCommand={(command: string, values: any) => this.sendCommand(command, values)} />

        <Transition videoMode={this.props.currentState.settings.videoMode} transition={this.props.currentState.mixEffects[0].transition} sendCommand={(command: string, values: any) => this.sendCommand(command, values)} />
        <Preview previewSource={this.props.currentState.mixEffects[0].sources.preview } inputs={this.props.currentState.settings.inputs} sendCommand={(command: string, values: any) => this.sendCommand(command, values)} />
        <Next selection={this.props.currentState.mixEffects[0].transition.properties.selection} keyers={this.props.currentState.mixEffects[0].keyers} sendCommand={(command: string, values: any) => this.sendCommand(command, values)} />
        <DSK videoMode={this.props.currentState.settings.videoMode} downstreamKeyers={this.props.currentState.downstreamKeyers} sendCommand={(command: string, values: any) => this.sendCommand(command, values)} />
        <FTB fadeToBlack={this.props.currentState.mixEffects[0].fadeToBlack} videoMode={this.props.currentState.settings.videoMode} sendCommand={(command: string, values: any) => this.sendCommand(command, values)} />


      </div >
    )
  }
}



interface ProgramProps {
  sendCommand: any
  inputs: any
  programSource:number
}


const Program =React.memo((props: ProgramProps) =>{
  var myKeys = Object.keys(props.inputs).filter(i => videoIds[i] < 50 && videoIds[i] > 0)
  var programButtons = myKeys.map(item =>
    <AtemButtonRed key={videoIds[item]} name={props.inputs[(item)].properties.shortName} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.ProgramInputSetCommand", { Index: 0, Source: videoIds[item] })} active={item.includes(props.programSource.toString())}></AtemButtonRed>
  )

  var blkProgram = <AtemButtonRed name={"Blk"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.ProgramInputSetCommand", { Index: 0, Source: 0 })} active={props.programSource === 0}></AtemButtonRed>
  var barsProgram = <AtemButtonRed name={"Bars"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.ProgramInputSetCommand", { Index: 0, Source: 1000 })} active={props.programSource === 1000}></AtemButtonRed>
  var col1Program = <AtemButtonRed name={"Col1"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.ProgramInputSetCommand", { Index: 0, Source: 2001 })} active={props.programSource === 2001}></AtemButtonRed>
  var mp1Program = <AtemButtonRed name={"MP1"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.ProgramInputSetCommand", { Index: 0, Source: 3010 })} active={props.programSource === 3010}></AtemButtonRed>
  var mp2Program = <AtemButtonRed name={"MP2"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.ProgramInputSetCommand", { Index: 0, Source: 3020 })} active={props.programSource === 3020}></AtemButtonRed>

  const isPhone = useMediaQuery({ query: '(min-width: 600px)' })

  if (!isPhone) {
    return (
      <div className="box pp" id="Program" >

        <div className="box-title">Program</div>
        <div className="box-inner-mobile">
          <div className="box-inner-inputs">
            {programButtons}
          </div>
          <div className="box-program-row">
            {blkProgram}
            {barsProgram}
            {col1Program}
            {mp1Program}
            {mp2Program}
          </div>
        </div>
      </div>)
  } else {
    return (
      <div className="box pp" id="Program">
        <div className="box-title">Program</div>
        <div className="box-inner">
          <div className="box-inner-inputs">
            {programButtons}
          </div>
          <div className="box-inner-mid">
            {blkProgram}
            {barsProgram}
          </div>
          <div className="box-inner-rest">
            {col1Program}
            <div></div>
            {mp1Program}
            {mp2Program}
          </div>
        </div>
      </div>)
  }
})


interface PreviewProps {
  sendCommand: any
  inputs: any
  previewSource:number
}

const Preview =React.memo((props: PreviewProps) =>{
  var myKeys = Object.keys(props.inputs).filter(i => videoIds[i] < 50 && videoIds[i] > 0)
  var previewButtons = myKeys.map(item =>
    <AtemButtonGreen key={videoIds[item]} name={props.inputs[(item)].properties.shortName} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.PreviewInputSetCommand", { Index: 0, Source: videoIds[item] })} active={item.includes(props.previewSource.toString())} />
  )

  var blk = <AtemButtonGreen name={"Blk"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.PreviewInputSetCommand", { Index: 0, Source: 0 })} active={props.previewSource === 0} />
  var bars = <AtemButtonGreen name={"Bars"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.PreviewInputSetCommand", { Index: 0, Source: 1000 })} active={props.previewSource === 1000} />
  var col1 = <AtemButtonGreen name={"Col1"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.PreviewInputSetCommand", { Index: 0, Source: 2001 })} active={props.previewSource === 2001} />
  var mp1 = <AtemButtonGreen name={"MP1"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.PreviewInputSetCommand", { Index: 0, Source: 3010 })} active={props.previewSource === 3010} />
  var mp2 = <AtemButtonGreen name={"MP2"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.PreviewInputSetCommand", { Index: 0, Source: 3020 })} active={props.previewSource === 3020} />

  const isPhone = useMediaQuery({ query: '(min-width: 600px)' })

  if (!isPhone) {
    return (
      <div className="box pp" id="Preview" >
        <div className="box-title">Preview</div>
        <div className="box-inner-mobile">
          <div className="box-inner-inputs">
            {previewButtons}

          </div>
          <div className="box-program-row">
            {blk}
            {bars}
            {col1}
            {mp1}
            {mp2}
          </div>
        </div>
      </div>)
  } else {
    return (
      <div className="box pp" id="Preview">
        <div className="box-title">Preview</div>
        <div className="box-inner">
          <div className="box-inner-inputs">
            {previewButtons}

          </div>
          <div className="box-inner-mid">
            {blk}
            {bars}
          </div>
          <div className="box-inner-rest">
            {col1}
            <div></div>
            {mp1}
            {mp2}
          </div>
        </div>
      </div>)
  }
})



interface TransitionProps {
  sendCommand: any
  transition: any
  videoMode:number
}


const Transition =React.memo((props: TransitionProps) =>{
  var styleName = ["Mix", "Dip", "Wipe", "DVE"]
  var style = props.transition.properties.style
  return (
    <div className="box" id="Transition">
      <div className="box-title">Transition Style</div>
      <div className="box-transition">
        <AtemButtonYellow callback={(() => props.sendCommand("LibAtem.Commands.MixEffects.Transition.TransitionPropertiesSetCommand", { Index: 0, Mask: 1, NextStyle: 0 }))} active={style === 0} name={"MIX"}></AtemButtonYellow>
        <AtemButtonYellow callback={(() => props.sendCommand("LibAtem.Commands.MixEffects.Transition.TransitionPropertiesSetCommand", { Index: 0, Mask: 1, NextStyle: 1 }))} active={style === 1} name={"DIP"}></AtemButtonYellow>
        <AtemButtonYellow callback={(() => props.sendCommand("LibAtem.Commands.MixEffects.Transition.TransitionPropertiesSetCommand", { Index: 0, Mask: 1, NextStyle: 2 }))} active={style === 2} name={"WIPE"}></AtemButtonYellow>
        <AtemButtonYellow callback={(() => props.sendCommand("LibAtem.Commands.MixEffects.Transition.TransitionPropertiesSetCommand", { Index: 0, Mask: 1, NextStyle: 4 }))} active={style === 4} name={"STING"}></AtemButtonYellow>
        <AtemButtonYellow callback={(() => props.sendCommand("LibAtem.Commands.MixEffects.Transition.TransitionPropertiesSetCommand", { Index: 0, Mask: 1, NextStyle: 3 }))} active={style === 3} name={"DVE"}></AtemButtonYellow>

        <AtemButtonRed className={"atem-button-text prev-trans"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.Transition.TransitionPreviewSetCommand", { Index: 0, PreviewTransition: !props.transition.properties.preview })} active={props.transition.properties.preview} name={"PREV TRANS"}></AtemButtonRed>

        <div></div>

        <AtemButtonRed callback={() => props.sendCommand("LibAtem.Commands.MixEffects.MixEffectCutCommand", { Index: 0 })} active={false} name={"CUT"}></AtemButtonRed>

        <AtemButtonRed callback={() => props.sendCommand("LibAtem.Commands.MixEffects.MixEffectAutoCommand", { Index: 0 })} active={props.transition.position.inTransition} name={"AUTO"}></AtemButtonRed>

        <div className="rate"> Rate<RateInput disabled={style === 4} className={"rate-input"} callback={(e: string) => { props.sendCommand("LibAtem.Commands.MixEffects.Transition.Transition" + styleName[style] + "SetCommand", { Index: 0, Mask: 1, Rate: e }) }} value={props.transition.position.remainingFrames} videoMode={props.videoMode} ></RateInput></div>
      </div>
    </div>)
})


interface FTBProps {
  sendCommand: any
  fadeToBlack: any
  videoMode:number
}


const FTB =React.memo((props: FTBProps) =>{
  return (
    <div className="box" id="FTB">
      <div className="box-title">Fade to Black</div>
      <div className="box-ftb">
        <div className="rate"> Rate<RateInput className={"rate-input"} callback={(e: string) => { props.sendCommand("LibAtem.Commands.MixEffects.FadeToBlackRateSetCommand", { Index: 0, Rate: e }) }} value={props.fadeToBlack.status.remainingFrames} videoMode={props.videoMode} ></RateInput></div>
        <AtemButtonFTB key={"ftb_button"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.FadeToBlackAutoCommand", { Index: 0 })} name={"FTB"} inTransition={props.fadeToBlack.status.inTransition} isFullBlack={props.fadeToBlack.status.isFullyBlack}></AtemButtonFTB>
      </div>
    </div>
  )
})

interface NextProps {
  sendCommand: any
  keyers: any
  selection:number
}
const Next =React.memo((props: NextProps) =>{
  function dec2bin(dec: number) {
    return (dec >>> 0).toString(2);
  }

  function setKey(id: number) {
    var dec = dec2bin(props.selection).padStart(5, '0').split("").reverse();
    dec[id] = (dec[id] === "0" ? "1" : "0")
    return (parseInt(dec.reverse().join(""), 2))
  }

  var onAirs = [];
  var keysState = ((props.selection >>> 0).toString(2)).split("").reverse().join(""); //get binary of state and reverse it for iterating 
  var keys = [];

  var selection = props.selection

  keys.push(<AtemButtonYellow update={selection} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.Transition.TransitionPropertiesSetCommand", { Index: 0, Mask: 2, NextSelection: setKey(0) })} active={keysState[0] === "1"} name={"BKGD"}></AtemButtonYellow>)

  for (var i = 0; i < props.keyers.length; i++) {
    const x = i
    onAirs.push(<AtemButtonOnAir name={"ON AIR"} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.Key.MixEffectKeyOnAirSetCommand", { MixEffectIndex: 0, KeyerIndex: x, OnAir: !props.keyers[x].onAir })} active={props.keyers[x].onAir} />)
    keys.push(<AtemButtonYellow update={selection} callback={() => props.sendCommand("LibAtem.Commands.MixEffects.Transition.TransitionPropertiesSetCommand", { Index: 0, Mask: 2, NextSelection: setKey(x + 1) })} active={keysState[i + 1] === "1"} name={"KEY" + (i + 1)}></AtemButtonYellow>)
  }

  return (
    <div style={{ gridTemplateColumns: "repeat(" + props.keyers.length + 1 + " 50px)" }} className="box" id="Next">
      <div className="box-title">Next Transition</div>
      <div className="box-transition">
        <div></div>
        {onAirs}
        {keys}
      </div>
    </div>)
})

interface DSKProps {
  sendCommand: any
  videoMode: number
  downstreamKeyers:any

}


const DSK =React.memo((props: DSKProps) =>{
  var dskCount = props.downstreamKeyers.length
  var tie = []
  var rate = []
  var onAir = []
  var auto = []
  for (var i = 0; i < dskCount; i++) {
    const x = i
    tie.push(<AtemButtonYellow name={"Tie"} callback={() => props.sendCommand("LibAtem.Commands.DownstreamKey.DownstreamKeyTieSetCommand", { Index: x, Tie: !props.downstreamKeyers[x].properties.tie })} active={props.downstreamKeyers[x].properties.tie} />)
    rate.push(<div className="rate"> Rate<RateInput className={"rate-input"} callback={(e: string) => { props.sendCommand("LibAtem.Commands.DownstreamKey.DownstreamKeyRateSetCommand", { Index: x, Rate: e }) }} value={props.downstreamKeyers[x].state.remainingFrames} videoMode={props.videoMode} ></RateInput></div>)
    onAir.push(<AtemButtonOnAir name={"ON AIR"} callback={() => props.sendCommand("LibAtem.Commands.DownstreamKey.DownstreamKeyOnAirSetCommand", { Index: x, OnAir: !props.downstreamKeyers[x].state.onAir })} active={props.downstreamKeyers[x].state.onAir} />)
    auto.push(<AtemButtonRed name={"AUTO"} callback={() => props.sendCommand("LibAtem.Commands.DownstreamKey.DownstreamKeyAutoV8Command", { Index: x, IsTowardsOnAir: !props.downstreamKeyers[x].state.onAuto })} active={props.downstreamKeyers[x].state.isAuto} />)
  }

  if (dskCount == 1) {
    var style = "50px"
  } else {
    style = "50px 50px"
  }
  return (
    <div className="box" id="DSK">

      {(dskCount === 2) ?
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div className="box-title">DSK1</div>
          <div className="box-title">DSK2</div>
        </div> :

        <div className="box-title">DSK1</div>
      }
      <div className="box-dsk" style={{ gridTemplateColumns: style }}>
        {tie}
        {rate}
        {onAir}
        {auto}
      </div>
    </div>)
})