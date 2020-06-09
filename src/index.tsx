import * as React from 'rax';

import spine from "./spine-canvas.js";

interface SpineInfo{
    atlas:string;
    skel:string;
    png:string;
    animName:string;
    top:number;
    left:number;
    size:{width:number,height:number};
    noClear?:boolean,
    loop?:boolean,
    delay?:number,
    onAnimFinish?:()=>void
}
interface StateInfo{

}


class Spine extends React.Component<SpineInfo,StateInfo> {
    lastFrameTime:number;
    canvas:any;
    context:any;
    skeleton:spine.Skeleton;
    spineState:spine.AnimationState;
    frameHandler:any;
    assetManager:any;
    skeletonRenderer:any;
    stoped:boolean;
    bounds:{
        offset: spine.Vector2;
        size: spine.Vector2;
    };
    constructor(props) {
        super(props);
        this.stoped = false;
        this.lastFrameTime = Date.now() / 1000;
    }

    componentDidMount() {
        setTimeout(()=>{
            this.init();
        },0)
        

    }

    shouldComponentUpdate(newProps:SpineInfo){
        if (newProps.skel === this.props.skel && newProps.png === this.props.png && newProps.atlas === this.props.atlas) {
            return false;
        }
        return true;
    }

    componentDidUpdate(preProps){
        if (preProps.skel !== this.props.skel || preProps.png !== this.props.png || preProps.atlas !== this.props.atlas) {
            this.tryClearWithProps(preProps);
            this.init();
        } else {
            if (this.spineState) {
                if (this.props.animName && preProps.animName !== this.props.animName) {
                this.spineState.addAnimation(0, this.props.animName, this.props.loop, this.props.delay);
                }
            }
        }
    }

    componentWillUnmount() {
        this.stoped = true;
        this.tryClearWithProps(this.props);
    }

    removeSpineAsset = (asset) => {
        if (!this.assetManager) {
        return;
        }
        if (this.assetManager.get(asset)) {
        this.assetManager.remove(asset);
        }
    }

    tryClearWithProps = (props) => {
        if (props.noClear) return;
        this.removeSpineAsset(props.skel);
        this.removeSpineAsset(props.atlas);
        this.removeSpineAsset(props.png);

    }

    init = () => {
        if (this.frameHandler) {
            cancelAnimationFrame(this.frameHandler);
        }
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");

        this.skeletonRenderer = new spine.canvas.SkeletonRenderer(this.context);

        this.assetManager = new spine.canvas.AssetManager();
        let assetManager = this.assetManager;
        const loadTextSkel = new Promise((resolve, reject) => {
            assetManager.loadText(this.props.skel, () => {
                resolve()
            }, () => {
                reject();
            })
        })
        const loadTextAtlas = new Promise((resolve, reject) => {
            assetManager.loadText(this.props.atlas, () => {
                resolve()
            }, () => {
                reject();
            })
        })
        const loadTexturePng = new Promise((resolve, reject) => {
            assetManager.loadTexture(this.props.png, () => {
                resolve()
            }, () => {
                reject();
            })
        })
        Promise.all([loadTextSkel, loadTextAtlas, loadTexturePng]).then(() => {
            let data = this.loadSkeleton();
            this.skeleton = data.skeleton;
            this.spineState = data.state;
            this.bounds = data.bounds;
            this.frameHandler = requestAnimationFrame(this.renderAnim);
        }).catch((error)=>{
            console.log("error",error)
        })
    }

    loadSkeleton = () => {
        let skin = "default";
        let assetManager = this.assetManager;
        let atlas = new spine.TextureAtlas(assetManager.get(this.props.atlas), (path) => {
            return assetManager.get(this.props.png);
        });

        let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

        let skeletonJson = new spine.SkeletonJson(atlasLoader);
        let skeletonData = skeletonJson.readSkeletonData(assetManager.get(this.props.skel));
        let skeleton = new spine.Skeleton(skeletonData);
        skeleton.flipY = true;
        let bounds = this.calculateBounds(skeleton);
        skeleton.setSkinByName(skin);
        let animationState = new spine.AnimationState(new spine.AnimationStateData(skeleton.data));
        animationState.setAnimation(0, this.props.animName, this.props.loop);
        animationState.addListener({
            event: function(entry: spine.TrackEntry) {
                // console.log("Event on track " + trackIndex + ": " + JSON.stringify(event));
            },
            complete: function(entry: spine.TrackEntry) {
                // console.log("Animation on track " + trackIndex + " completed, loop count: " + loopCount);
                if (entry && entry.animation && entry.animation.name === this.finishAnim) {
                    if (this.onAnimFinish) {
                      this.onAnimFinish();
                      this.onAnimFinish = null;
                    }
                  }
            },
            start: function(entry: spine.TrackEntry) {
                // console.log("Animation on track " + trackIndex + " started");
            },
            end: function(entry: spine.TrackEntry) {
                // console.log("Animation on track " + trackIndex + " ended");
            },
            interrupt: function(entry: spine.TrackEntry) {
                // console.log("Animation on track " + trackIndex + " ended");
            },
            dispose: function(entry: spine.TrackEntry) {
                // console.log("Animation on track " + trackIndex + " ended");
            },
        })
        return { skeleton: skeleton, state: animationState, bounds: bounds };
    }

    calculateBounds = (skeleton) => {
        let data = skeleton.data;
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        let offset = new spine.Vector2();
        let size = new spine.Vector2();
        skeleton.getBounds(offset, size, []);
        return { offset: offset, size: size };
    }

    renderAnim = () => {
        if(this.stoped || !this.spineState){
            return;
        }
        let now = Date.now() / 1000;
        let delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.resize();
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.fillStyle = "transparent";
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.restore();

        this.spineState.update(delta);
        this.spineState.apply(this.skeleton);
        this.skeleton.updateWorldTransform();
        this.skeletonRenderer.draw(this.skeleton);

        this.frameHandler = requestAnimationFrame(this.renderAnim);
    }
    resize = () => {
        var w = this.canvas.clientWidth;
        var h = this.canvas.clientHeight;
        if (this.canvas.width != w || this.canvas.height != h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        var centerX = this.bounds.offset.x + this.bounds.size.x / 2;
        var centerY = this.bounds.offset.y + this.bounds.size.y / 2;
        var scaleX = this.bounds.size.x / this.canvas.width;
        var scaleY = this.bounds.size.y / this.canvas.height;
        var scale = Math.max(scaleX, scaleY) * 1.2;//动画大小
        if (scale < 1) scale = 1;
        var width = this.canvas.width * scale;
        var height = this.canvas.height * scale;

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(1 / scale, 1 / scale);
        this.context.translate(-centerX, -centerY);
        this.context.translate(width / 2, height / 2);
    }
    render() {
        let pvw = 7.5;
        let left = this.props.left ? `${this.props.left / pvw}vw` : 0;
        let top = this.props.top ? `${this.props.top / pvw}vw` : 0;
        let width = '100%';
        let height = '100%';
        if (this.props.size) {
            width = `${this.props.size.width / pvw}vw`;
            height = `${this.props.size.height / pvw}vw`;
        }
        return (
            <canvas ref={(ref) => { this.canvas = ref }} style={{ 'left': left, 'top': top, 'width': width, 'height': height }}></canvas>
        )
    }
}

export default Spine
