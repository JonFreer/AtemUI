import React from "react";
import { MagicLabel } from "./magicLabel";
import { ColourWheel } from "./colorwheel";
import { YRGBWheel } from "./yrgbWheel";
import Slider from "react-rangeslider";


interface ExpandedProps {
    lift:any
    gamma:any
    gain:any
    contrast:number
    hue:number
    saturation:number
    lumMix:number
    sendCommand:any
    input:number
}

export class Expanded extends React.Component<ExpandedProps> {


    render() {


        return (
            <div className="cam-expanded-holder">
                <div className="cam-expanded-header">Color Correction</div>
                <div className="cam-expanded-circle-holder-holder">
                    <div className="cam-expanded-circle-holder">
                        <div className="cam-expanded-title">
                            Lift
                        </div>
                        <div className="cam-circle-holder">
                            <ColourWheel
                                callback={(r: number, g: number, b: number) => this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand", { Input: this.props.input, AdjustmentDomain: 8, ChipFeature: 0, Relative: false, R: r, G: g, B: b, Y: this.props.lift.y })}
                                rgby={{r:this.props.lift.r,g:this.props.lift.g,b:this.props.lift.b}}
                                outerRadius = {150}
                                innerRadius = {145}
                                blackWidth={5}
                                />
                        </div>
                        <YRGBWheel minMax={4096} values={{r:this.props.lift.r,g:this.props.lift.g,b:this.props.lift.b,y:this.props.lift.y}}
                            callback={(r:number,g:number,b:number,y:number)=>this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:8,ChipFeature:0,Relative:false,R:r,G:g,B:b,Y:y})}/>
                        <ValueBar input={this.props.input} rgby ={this.props.lift} page={0} callback={(cmd:string,val:any)=>this.props.sendCommand(cmd,val)}></ValueBar>

                    </div>
                    <div className="cam-expanded-circle-holder">
                    <div className="cam-expanded-title">
                            Gamma
                        </div>
                        <div className="cam-circle-holder">
                            <ColourWheel
                                callback={(r: number, g: number, b: number) => this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand", { Input: this.props.input, AdjustmentDomain: 8, ChipFeature: 1, Relative: false, R: r, G: g, B: b, Y: this.props.lift.y })}
                                rgby={{r:this.props.gamma.r,g:this.props.gamma.g,b:this.props.gamma.b}}
                                outerRadius = {150}
                                innerRadius = {145}
                                blackWidth={5}/>

                            
                        </div>
                        <YRGBWheel minMax={8192} values={{r:this.props.gamma.r,g:this.props.gamma.g,b:this.props.gamma.b,y:this.props.gamma.y}}
                            callback={(r:number,g:number,b:number,y:number)=>this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:8,ChipFeature:1,Relative:false,R:r,G:g,B:b,Y:y})}/>
                        <ValueBar input={this.props.input} rgby ={this.props.gamma} page={1} callback={(cmd:string,val:any)=>this.props.sendCommand(cmd,val)}></ValueBar>
                    </div>
                    <div className="cam-expanded-circle-holder">
                    <div className="cam-expanded-title">
                            Gain
                        </div>
                        <div className="cam-circle-holder">
                            <ColourWheel
                                callback={(r: number, g: number, b: number) => this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand", { Input: this.props.input, AdjustmentDomain: 8, ChipFeature: 2, Relative: false, R: r, G: g, B: b, Y: this.props.lift.y })}
                                rgby={{r:this.props.gain.r,g:this.props.gain.g,b:this.props.gain.b}}
                                outerRadius = {150}
                                innerRadius = {145}
                                blackWidth={5} />

                            
                        </div>
                        <YRGBWheel minMax={32767} values={{r:this.props.gain.r,g:this.props.gain.g,b:this.props.gain.b,y:this.props.gain.y}}
                            callback={(r:number,g:number,b:number,y:number)=>this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input:this.props.input,AdjustmentDomain:8,ChipFeature:2,Relative:false,R:r,G:g,B:b,Y:y})}/>

                        <ValueBar input={this.props.input} rgby ={this.props.gain} page={2} callback={(cmd:string,val:any)=>this.props.sendCommand(cmd,val)}></ValueBar>
                    </div>
                </div>
                <div className="cam-expanded-slider-holder-holder">
                        <div className="cam-slider">
                            <div className="cam-expanded-slider-label">Contrast</div>
                            <div className="cam-expanded-slider-value">{Math.round(this.props.contrast/40.96)}%</div>
                            <Slider 
                            value={this.props.contrast} 
                            max={4096} 
                            min={0}
                            step={1}
                            tooltip={false}
                            onChange={(e)=>this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input: this.props.input, AdjustmentDomain:8, ChipFeature:4 , Contrast:e})}
                            ></Slider>
                        </div>


                        <div className="cam-slider">
                            <div className="cam-expanded-slider-label">Saturation</div>
                            <div className="cam-expanded-slider-value">{Math.round(this.props.saturation/40.96)}%</div>
                            <Slider 
                            value={this.props.saturation} 
                            max={4096} 
                            min={0}
                            step={1}
                            tooltip={false}
                            onChange={(e)=>this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input: this.props.input, AdjustmentDomain:8, ChipFeature:6 , Saturation:e,Hue:this.props.hue})}
                            ></Slider>
                        </div>

                        <div className="cam-slider">
                            <div className="cam-expanded-slider-label">Hue</div>
                            <div className="cam-expanded-slider-value">{Math.round(((this.props.hue+2048)/4096)*360)}&deg;</div>
                            <Slider 
                            value={this.props.hue} 
                            max={2048} 
                            min={-2048}
                            step={1}
                            tooltip={false}
                            onChange={(e)=>this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input: this.props.input, AdjustmentDomain:8, ChipFeature:6 , Hue:e, Saturation:this.props.saturation})}
                            ></Slider>
                        </div>

                        <div className="cam-slider">
                            <div className="cam-expanded-slider-label">RGB</div>
                            <div className="cam-expanded-slider-label" style={{right:"0px"}}>YRGB</div>
                            <Slider 
                            value={this.props.lumMix} 
                            max={2048} 
                            min={0}
                            step={1}
                            tooltip={false}
                            onChange={(e)=>this.props.sendCommand("LibAtem.Commands.CameraControl.CameraControlSetCommand",{Input: this.props.input, AdjustmentDomain:8, ChipFeature:5 , LumMix:e})}
                            ></Slider>
                        </div>

                </div>
            </div>

        )
    }

}

function ValueBar(props: {rgby: any, page: number, callback: any,input:number }) {
    const pageScale = [4096, 8192, 2048][props.page]
    const pageMax = [4096, 8192, 32767][props.page]
    return (
        <div className="cam-value-bar">
            <div></div>

            <div className="cam-value">
                <MagicLabel step={5} max={pageMax} min={-pageMax}
                    callback={(e: number) => {
                        props.callback("LibAtem.Commands.CameraControl.CameraControlSetCommand",
                            { Input: props.input, AdjustmentDomain: 8, ChipFeature: props.page, Relative: false, R: props.rgby.r, G: props.rgby.g, B: props.rgby.b, Y: e })
                    }}
                    format={(e: any) => (e / pageScale).toFixed(2)}
                    value={props.rgby.y} />

                <div className="cam-value-colour-bar white"></div>
            </div>

            <div className="cam-value">
                <MagicLabel step={5} max={pageMax} min={-pageMax}
                    callback={(e: number) => {
                        props.callback("LibAtem.Commands.CameraControl.CameraControlSetCommand",
                            { Input: props.input, AdjustmentDomain: 8, ChipFeature: props.page, Relative: false, R: e, G: props.rgby.g, B: props.rgby.b, Y: props.rgby.y })
                    }}
                    format={(e: any) => (e / pageScale).toFixed(2)}
                    value={props.rgby.r} />
                <div className="cam-value-colour-bar red"></div>
            </div>

            <div className="cam-value">
                <MagicLabel step={5} max={pageMax} min={-pageMax}
                    callback={(e: number) => {
                        props.callback("LibAtem.Commands.CameraControl.CameraControlSetCommand",
                            { Input: props.input, AdjustmentDomain: 8, ChipFeature: props.page, Relative: false, R: props.rgby.r, G: e, B: props.rgby.b, Y: props.rgby.y })
                    }}
                    format={(e: any) => (e / pageScale).toFixed(2)}
                    value={props.rgby.g} />
                <div className="cam-value-colour-bar green"></div>
            </div>

            <div className="cam-value">
                <MagicLabel step={5} max={pageMax} min={-pageMax}
                    callback={(e: number) => {
                        props.callback("LibAtem.Commands.CameraControl.CameraControlSetCommand",
                            { Input: props.input, AdjustmentDomain: 8, ChipFeature: props.page, Relative: false, R: props.rgby.r, G: props.rgby.g, B: e, Y: props.rgby.y })
                    }}
                    format={(e: any) => (e / pageScale).toFixed(2)}
                    value={props.rgby.b} />
                <div className="cam-value-colour-bar blue"></div>
            </div>


        </div>)
}